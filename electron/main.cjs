const { app, BrowserWindow, shell } = require("electron");
const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs/promises");

const ELECTRON_DEV_URL = process.env.ELECTRON_RENDERER_URL;
const RENDERER_ROOT = path.resolve(__dirname, "..", "build", "client");
const MAIN_WINDOW_MIN_WIDTH = 1100;
const MAIN_WINDOW_MIN_HEIGHT = 700;

let staticRendererServer;

const MIME_BY_EXT = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function getMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return MIME_BY_EXT[extension] ?? "application/octet-stream";
}

async function readFileIfExists(filePath) {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

function createRendererServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (request, response) => {
      try {
        const requestedUrl = new URL(request.url ?? "/", "http://127.0.0.1");
        const decodedPath = decodeURIComponent(requestedUrl.pathname);
        const normalizedPath = decodedPath.replace(/^\/+/, "");
        const requestedPath = normalizedPath || "index.html";
        const absoluteRequestedPath = path.resolve(rootDir, requestedPath);
        const isInsideRoot =
          absoluteRequestedPath === rootDir ||
          absoluteRequestedPath.startsWith(`${rootDir}${path.sep}`);

        if (!isInsideRoot) {
          response.writeHead(403);
          response.end("Forbidden");
          return;
        }

        const fileBuffer = await readFileIfExists(absoluteRequestedPath);
        if (fileBuffer) {
          response.writeHead(200, {
            "Content-Type": getMimeType(absoluteRequestedPath),
          });
          response.end(fileBuffer);
          return;
        }

        const hasExtension = path.extname(requestedPath).length > 0;
        if (hasExtension) {
          response.writeHead(404);
          response.end("Not Found");
          return;
        }

        const indexPath = path.join(rootDir, "index.html");
        const indexBuffer = await readFileIfExists(indexPath);
        if (!indexBuffer) {
          response.writeHead(500);
          response.end("Renderer build is missing index.html");
          return;
        }

        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        response.end(indexBuffer);
      } catch (error) {
        response.writeHead(500);
        response.end("Internal Server Error");
      }
    });

    server.on("error", (error) => {
      reject(error);
    });

    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to resolve renderer server address."));
        return;
      }

      resolve({
        server,
        url: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

async function getRendererUrl() {
  if (ELECTRON_DEV_URL) {
    return ELECTRON_DEV_URL;
  }

  const rendererExists = await fs
    .access(RENDERER_ROOT)
    .then(() => true)
    .catch(() => false);

  if (!rendererExists) {
    throw new Error(
      "Missing build/client. Run `npm run build:electron` before `npm run electron:start`.",
    );
  }

  staticRendererServer = await createRendererServer(RENDERER_ROOT);
  return staticRendererServer.url;
}

async function createMainWindow() {
  const rendererUrl = await getRendererUrl();
  const mainWindow = new BrowserWindow({
    width: 1500,
    height: 900,
    minWidth: MAIN_WINDOW_MIN_WIDTH,
    minHeight: MAIN_WINDOW_MIN_HEIGHT,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.resolve(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  await mainWindow.loadURL(rendererUrl);
}

app.whenReady().then(async () => {
  await createMainWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (staticRendererServer) {
    staticRendererServer.server.close();
    staticRendererServer = undefined;
  }
});
