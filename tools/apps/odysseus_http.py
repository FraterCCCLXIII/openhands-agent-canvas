"""Shared HTTP client for Odysseus OpenHands API from agent-server tools."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any


class OdysseusHttpError(Exception):
    def __init__(self, status: int, detail: str):
        super().__init__(detail)
        self.status = status
        self.detail = detail


def _config() -> tuple[str, str]:
    base = (os.environ.get("ODYSSEUS_URL") or "").strip().rstrip("/")
    token = (os.environ.get("ODYSSEUS_API_TOKEN") or "").strip()
    if not base:
        raise OdysseusHttpError(503, "ODYSSEUS_URL is not configured")
    if not token:
        raise OdysseusHttpError(503, "ODYSSEUS_API_TOKEN is not configured")
    return base, token


def request(
    method: str,
    path: str,
    *,
    body: dict[str, Any] | None = None,
    form: dict[str, str] | None = None,
    timeout: float = 30.0,
) -> Any:
    base, token = _config()
    url = f"{base}{path if path.startswith('/') else '/' + path}"
    headers = {"Authorization": f"Bearer {token}"}
    data: bytes | None = None
    if form is not None:
        from urllib.parse import urlencode

        data = urlencode(form).encode("utf-8")
        headers["Content-Type"] = "application/x-www-form-urlencoded"
    elif body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method.upper())
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            if not raw:
                return {}
            return json.loads(raw)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(detail)
            if isinstance(parsed, dict) and parsed.get("detail"):
                detail = str(parsed["detail"])
        except Exception:
            pass
        raise OdysseusHttpError(exc.code, detail or exc.reason) from exc
    except urllib.error.URLError as exc:
        raise OdysseusHttpError(503, str(exc.reason)) from exc
