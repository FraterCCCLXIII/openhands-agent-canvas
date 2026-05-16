import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ConversationCardSkeleton } from "./conversation-card-skeleton";

describe("ConversationCardSkeleton", () => {
  it("renders skeleton card", () => {
    render(<ConversationCardSkeleton />);
    expect(
      screen.getByTestId("conversation-card-skeleton"),
    ).toBeInTheDocument();
  });

  it("renders compact skeleton without full-row placeholder", () => {
    render(<ConversationCardSkeleton compact />);
    expect(
      screen.getByTestId("conversation-card-skeleton-compact"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("conversation-card-skeleton"),
    ).not.toBeInTheDocument();
  });

  it("uses a single bar with conversation-card outer spacing and rounded corners", () => {
    const { container } = render(<ConversationCardSkeleton />);

    const root = screen.getByTestId("conversation-card-skeleton");
    expect(root).toHaveClass("rounded-md", "py-1", "pl-2", "pr-1", "skeleton");
    expect(container.querySelector(".skeleton")).toBe(root);
  });
});
