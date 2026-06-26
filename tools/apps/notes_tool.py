"""Work Notes / todos tool backed by Odysseus."""

from __future__ import annotations

from collections.abc import Sequence
from typing import Literal

from pydantic import Field

from openhands.sdk import Action, Observation, ToolDefinition
from openhands.sdk.tool import ToolAnnotations, ToolExecutor, register_tool

from apps.odysseus_http import OdysseusHttpError, request

NotesActionKind = Literal["list", "add", "update", "delete", "toggle_item"]


class NotesAction(Action):
    action: NotesActionKind = Field(description="Notes/todos operation.")
    title: str | None = Field(default=None, description="Note or todo title.")
    note_id: str | None = Field(default=None, description="Note id for update/delete/toggle.")
    due_date: str | None = Field(
        default=None,
        description="Natural language or ISO due date for reminders (NOT calendar events).",
    )
    item_index: int | None = Field(default=None, description="Checklist item index for toggle_item.")


class NotesObservation(Observation):
    pass


class NotesExecutor(ToolExecutor[NotesAction, NotesObservation]):
    def __call__(self, action: NotesAction, conversation=None) -> NotesObservation:
        try:
            if action.action == "list":
                result = request("GET", "/api/openhands/todos")
            else:
                body: dict = {"action": action.action}
                if action.title:
                    body["title"] = action.title
                if action.note_id:
                    body["id"] = action.note_id
                if action.due_date:
                    body["due_date"] = action.due_date
                if action.item_index is not None:
                    body["item_index"] = action.item_index
                result = request("POST", "/api/openhands/todos", body=body)
            return NotesObservation.from_text(str(result))
        except OdysseusHttpError as exc:
            return NotesObservation.from_text(f"Notes API error ({exc.status}): {exc.detail}")


_DESCRIPTION = """User notes and todos (checklists, reminders).

IMPORTANT: "Remind me at 5pm" → add todo with due_date (fires notification).
"Meeting at 3pm" → use calendar tool instead.

Actions: list, add, update, delete, toggle_item."""


class NotesTool(ToolDefinition[NotesAction, NotesObservation]):
    @classmethod
    def create(cls, conv_state=None, **params) -> Sequence["NotesTool"]:
        return [
            cls(
                description=_DESCRIPTION,
                action_type=NotesAction,
                observation_type=NotesObservation,
                executor=NotesExecutor(),
                annotations=ToolAnnotations(title="Notes"),
            )
        ]


register_tool("notes", NotesTool)
