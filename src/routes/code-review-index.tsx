import { redirect } from "react-router";
import { CODE_REVIEW_PATHS } from "#/components/features/code-review/code-review-paths";

export const clientLoader = async () =>
  redirect(CODE_REVIEW_PATHS.pullRequests);

export default function CodeReviewIndex() {
  return null;
}
