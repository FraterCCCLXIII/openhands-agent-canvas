import { Navigate } from "react-router";

/** Code Style moved to Settings for the #1691 scaffold. */
export default function CodeReviewCodeStyleRoute() {
  return <Navigate to="/settings/code-style" replace />;
}
