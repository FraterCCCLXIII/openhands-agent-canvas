"""Work Calendar tool backed by Odysseus."""

from __future__ import annotations

from collections.abc import Sequence
from typing import Literal

from pydantic import Field

from openhands.sdk import Action, Observation, ToolDefinition
from openhands.sdk.tool import ToolAnnotations, ToolExecutor, register_tool

from apps.odysseus_http import OdysseusHttpError, request

CalendarActionKind = Literal["list_events", "create_event", "delete_event"]


class CalendarAction(Action):
    action: CalendarActionKind = Field(description="Calendar operation.")
    start: str | None = Field(default=None, description="Range start (ISO or natural language).")
    end: str | None = Field(default=None, description="Range end (ISO or natural language).")
    title: str | None = Field(default=None, description="Event title for create.")
    event_uid: str | None = Field(default=None, description="Event uid for delete.")
    body: dict | None = Field(default=None, description="Full event payload for create.")


class CalendarObservation(Observation):
    pass


class CalendarExecutor(ToolExecutor[CalendarAction, CalendarObservation]):
    def __call__(self, action: CalendarAction, conversation=None) -> CalendarObservation:
        try:
            if action.action == "list_events":
                start = action.start or "today"
                end = action.end or "next week"
                result = request(
                    "GET",
                    f"/api/openhands/calendar/events?start={start}&end={end}",
                )
            elif action.action == "create_event":
                payload = dict(action.body or {})
                if action.title and "title" not in payload:
                    payload["title"] = action.title
                result = request("POST", "/api/openhands/calendar/events", body=payload)
            elif action.action == "delete_event":
                if not action.event_uid:
                    return CalendarObservation.from_text("Error: event_uid required")
                result = request("DELETE", f"/api/openhands/calendar/events/{action.event_uid}")
            else:
                return CalendarObservation.from_text(f"Unknown action: {action.action}")
            return CalendarObservation.from_text(str(result))
        except OdysseusHttpError as exc:
            return CalendarObservation.from_text(f"Calendar API error ({exc.status}): {exc.detail}")


_DESCRIPTION = """Calendar events (meetings, appointments, time blocks). NOT for simple reminders — use Notes with due_date."""


class CalendarTool(ToolDefinition[CalendarAction, CalendarObservation]):
    @classmethod
    def create(cls, conv_state=None, **params) -> Sequence["CalendarTool"]:
        return [
            cls(
                description=_DESCRIPTION,
                action_type=CalendarAction,
                observation_type=CalendarObservation,
                executor=CalendarExecutor(),
                annotations=ToolAnnotations(title="Calendar"),
            )
        ]


register_tool("calendar", CalendarTool)
