"""Product-wide memory tool backed by Odysseus /api/openhands/memory."""

from __future__ import annotations

from collections.abc import Sequence
from typing import Literal

from pydantic import Field

from openhands.sdk import Action, Observation, ToolDefinition
from openhands.sdk.tool import ToolAnnotations, ToolExecutor, register_tool

from apps.odysseus_http import OdysseusHttpError, request

MemoryActionKind = Literal["search", "list", "add", "delete"]


class MemoryAction(Action):
    action: MemoryActionKind = Field(description="Memory operation to perform.")
    query: str | None = Field(default=None, description="Search query for search action.")
    text: str | None = Field(default=None, description="Memory text for add action.")
    category: str | None = Field(
        default="fact",
        description="Category: fact, preference, contact, task, etc.",
    )
    memory_id: str | None = Field(default=None, description="Memory id for delete action.")


class MemoryObservation(Observation):
    pass


class MemoryExecutor(ToolExecutor[MemoryAction, MemoryObservation]):
    def __call__(self, action: MemoryAction, conversation=None) -> MemoryObservation:
        try:
            if action.action == "search":
                result = request(
                    "POST",
                    "/api/openhands/memory/search",
                    form={"query": action.query or ""},
                )
            elif action.action == "list":
                result = request("GET", "/api/openhands/memory")
            elif action.action == "add":
                if not (action.text or "").strip():
                    return MemoryObservation.from_text("Error: text is required for add")
                result = request(
                    "POST",
                    "/api/openhands/memory",
                    body={
                        "text": action.text.strip(),
                        "category": action.category or "fact",
                        "source": "ai_agent",
                    },
                )
            elif action.action == "delete":
                if not action.memory_id:
                    return MemoryObservation.from_text("Error: memory_id is required for delete")
                result = request("DELETE", f"/api/openhands/memory/{action.memory_id}")
            else:
                return MemoryObservation.from_text(f"Unknown action: {action.action}")
            return MemoryObservation.from_text(str(result))
        except OdysseusHttpError as exc:
            return MemoryObservation.from_text(f"Memory API error ({exc.status}): {exc.detail}")


_DESCRIPTION = """Persistent user memory across sessions (facts, preferences, contacts).

Actions:
- search: semantic search (query)
- list: list all memories
- add: store new memory (text, category)
- delete: remove memory (memory_id)

Reminders go to Notes (todos with due_date), not memory. Meetings go to Calendar."""


class MemoryTool(ToolDefinition[MemoryAction, MemoryObservation]):
    @classmethod
    def create(cls, conv_state=None, **params) -> Sequence["MemoryTool"]:
        return [
            cls(
                description=_DESCRIPTION,
                action_type=MemoryAction,
                observation_type=MemoryObservation,
                executor=MemoryExecutor(),
                annotations=ToolAnnotations(title="Memory"),
            )
        ]


register_tool("memory", MemoryTool)
