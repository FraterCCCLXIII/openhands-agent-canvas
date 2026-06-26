"""Work Contacts tool backed by Odysseus."""

from __future__ import annotations

from collections.abc import Sequence
from typing import Literal

from pydantic import Field

from openhands.sdk import Action, Observation, ToolDefinition
from openhands.sdk.tool import ToolAnnotations, ToolExecutor, register_tool

from apps.odysseus_http import OdysseusHttpError, request

ContactsActionKind = Literal["list", "search", "add"]


class ContactsAction(Action):
    action: ContactsActionKind = Field(description="Contacts operation.")
    query: str | None = Field(default=None, description="Search query.")
    name: str | None = None
    email: str | None = None
    phone: str | None = None


class ContactsObservation(Observation):
    pass


class ContactsExecutor(ToolExecutor[ContactsAction, ContactsObservation]):
    def __call__(self, action: ContactsAction, conversation=None) -> ContactsObservation:
        try:
            if action.action == "list":
                result = request("GET", "/api/openhands/contacts")
            elif action.action == "search":
                q = action.query or ""
                result = request("GET", f"/api/openhands/contacts/search?q={q}")
            elif action.action == "add":
                result = request(
                    "POST",
                    "/api/openhands/contacts",
                    body={
                        "name": action.name or "",
                        "email": action.email or "",
                        "phone": action.phone or "",
                    },
                )
            else:
                return ContactsObservation.from_text(f"Unknown action: {action.action}")
            return ContactsObservation.from_text(str(result))
        except OdysseusHttpError as exc:
            return ContactsObservation.from_text(f"Contacts API error ({exc.status}): {exc.detail}")


class ContactsTool(ToolDefinition[ContactsAction, ContactsObservation]):
    @classmethod
    def create(cls, conv_state=None, **params) -> Sequence["ContactsTool"]:
        return [
            cls(
                description="Search and manage contacts for email and scheduling.",
                action_type=ContactsAction,
                observation_type=ContactsObservation,
                executor=ContactsExecutor(),
                annotations=ToolAnnotations(title="Contacts"),
            )
        ]


register_tool("contacts", ContactsTool)
