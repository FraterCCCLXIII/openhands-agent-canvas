"""Work Email tool backed by Odysseus."""

from __future__ import annotations

from collections.abc import Sequence
from typing import Literal

from pydantic import Field

from openhands.sdk import Action, Observation, ToolDefinition
from openhands.sdk.tool import ToolAnnotations, ToolExecutor, register_tool

from apps.odysseus_http import OdysseusHttpError, request

EmailActionKind = Literal["list", "read", "draft", "send"]


class EmailAction(Action):
    action: EmailActionKind = Field(description="Email operation.")
    uid: str | None = Field(default=None, description="Email UID for read/draft reply.")
    folder: str | None = Field(default="INBOX", description="IMAP folder.")
    limit: int | None = Field(default=10, description="Max emails for list.")
    to: str | None = None
    subject: str | None = None
    body: str | None = None
    cc: str | None = None


class EmailObservation(Observation):
    pass


class EmailExecutor(ToolExecutor[EmailAction, EmailObservation]):
    def __call__(self, action: EmailAction, conversation=None) -> EmailObservation:
        try:
            if action.action == "list":
                limit = max(1, min(int(action.limit or 10), 50))
                result = request("GET", f"/api/openhands/emails?folder={action.folder or 'INBOX'}&limit={limit}")
            elif action.action == "read":
                if not action.uid:
                    return EmailObservation.from_text("Error: uid required for read")
                result = request(
                    "GET",
                    f"/api/openhands/emails/{action.uid}?folder={action.folder or 'INBOX'}",
                )
            elif action.action == "draft":
                result = request(
                    "POST",
                    "/api/openhands/emails/draft",
                    body={
                        "to": action.to or "",
                        "subject": action.subject or "",
                        "body": action.body or "",
                        "cc": action.cc or "",
                    },
                )
            elif action.action == "send":
                result = request(
                    "POST",
                    "/api/openhands/emails/send",
                    body={
                        "to": action.to or "",
                        "subject": action.subject or "",
                        "body": action.body or "",
                        "cc": action.cc or "",
                    },
                )
            else:
                return EmailObservation.from_text(f"Unknown action: {action.action}")
            return EmailObservation.from_text(str(result))
        except OdysseusHttpError as exc:
            return EmailObservation.from_text(f"Email API error ({exc.status}): {exc.detail}")


_DESCRIPTION = """Read and compose email via Odysseus. Prefer draft over send unless user explicitly asks to send."""


class EmailTool(ToolDefinition[EmailAction, EmailObservation]):
    @classmethod
    def create(cls, conv_state=None, **params) -> Sequence["EmailTool"]:
        return [
            cls(
                description=_DESCRIPTION,
                action_type=EmailAction,
                observation_type=EmailObservation,
                executor=EmailExecutor(),
                annotations=ToolAnnotations(title="Email"),
            )
        ]


register_tool("email", EmailTool)
