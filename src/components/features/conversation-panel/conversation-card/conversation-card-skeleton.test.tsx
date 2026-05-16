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

  it("renders three staggered rounded skeleton rows", () => {
    render(<ConversationCardSkeleton />);

    const root = screen.getByTestId("conversation-card-skeleton");
    const bars = root.querySelectorAll(":scope > div");
    expect(bars.length).toBe(3);
    bars.forEach((bar, index) => {
      expect(bar).toHaveClass("rounded-md", "animate-pulse");
      expect(bar.getAttribute("style")).toContain(
        `animation-delay: ${[0, 180, 360][index]}ms`,
      );
    });
  });

  it("renders three compact skeleton bars", () => {
    render(<ConversationCardSkeleton compact />);
    const root = screen.getByTestId("conversation-card-skeleton-compact");
    const bars = root.querySelectorAll(":scope > div");
    expect(bars.length).toBe(3);
  });
});
