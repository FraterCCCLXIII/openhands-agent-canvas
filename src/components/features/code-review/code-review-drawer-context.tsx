import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CodeReviewDrawerContent = {
  title: string;
  subtitle?: string;
  /** Extra line under the title (e.g. author, repo, branch). */
  titleMeta?: ReactNode;
  /** Actions beside the close control (e.g. GitHub link + Review). */
  headerActions?: ReactNode;
  testId?: string;
  body: ReactNode;
};

type CodeReviewDrawerContextValue = {
  drawer: CodeReviewDrawerContent | null;
  openDrawer: (content: CodeReviewDrawerContent) => void;
  closeDrawer: () => void;
};

const CodeReviewDrawerContext =
  createContext<CodeReviewDrawerContextValue | null>(null);

export function CodeReviewDrawerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [drawer, setDrawer] = useState<CodeReviewDrawerContent | null>(null);

  const openDrawer = useCallback((content: CodeReviewDrawerContent) => {
    setDrawer(content);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawer(null);
  }, []);

  const value = useMemo(
    () => ({ drawer, openDrawer, closeDrawer }),
    [closeDrawer, drawer, openDrawer],
  );

  return (
    <CodeReviewDrawerContext.Provider value={value}>
      {children}
    </CodeReviewDrawerContext.Provider>
  );
}

export function useCodeReviewDrawer() {
  const context = useContext(CodeReviewDrawerContext);
  if (!context) {
    throw new Error(
      "useCodeReviewDrawer must be used within CodeReviewDrawerProvider",
    );
  }
  return context;
}
