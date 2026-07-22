import { Navigate } from "react-router";

/** Hooks moved to Settings for the #1691 scaffold. */
export default function CodeReviewHooksRoute() {
  return <Navigate to="/settings/hooks" replace />;
}
