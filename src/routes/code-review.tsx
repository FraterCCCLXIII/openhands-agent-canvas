import { Outlet } from "react-router";
import { CodeReviewLayout } from "#/components/features/code-review/code-review-layout";

/**
 * Top-level Code Review surface (#1691).
 * UI-first scaffold: nested tabs for PRs / Hooks / Code Style / Issues.
 */
function CodeReviewRoute() {
  return (
    <div className="h-full min-h-0">
      <CodeReviewLayout>
        <Outlet />
      </CodeReviewLayout>
    </div>
  );
}

export default CodeReviewRoute;
