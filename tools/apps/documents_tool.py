"""Work Documents tool backed by Odysseus."""

from __future__ import annotations

from collections.abc import Sequence
from typing import Literal

from pydantic import Field

from openhands.sdk import Action, Observation, ToolDefinition
from openhands.sdk.tool import ToolAnnotations, ToolExecutor, register_tool

from apps.odysseus_http import OdysseusHttpError, request

DocumentsActionKind = Literal["library", "read", "create", "delete"]


class DocumentsAction(Action):
    action: DocumentsActionKind = Field(description="Documents operation.")
    doc_id: str | None = Field(default=None, description="Document id.")
    title: str | None = None
    content: str | None = None
    search: str | None = None


class DocumentsObservation(Observation):
    pass


class DocumentsExecutor(ToolExecutor[DocumentsAction, DocumentsObservation]):
    def __call__(self, action: DocumentsAction, conversation=None) -> DocumentsObservation:
        try:
            if action.action == "library":
                search = action.search or ""
                path = "/api/openhands/documents"
                if search:
                    path += f"?search={search}"
                result = request("GET", path)
            elif action.action == "read":
                if not action.doc_id:
                    return DocumentsObservation.from_text("Error: doc_id required")
                result = request("GET", f"/api/openhands/documents/{action.doc_id}")
            elif action.action == "create":
                result = request(
                    "POST",
                    "/api/openhands/documents",
                    body={"title": action.title or "Untitled", "content": action.content or ""},
                )
            elif action.action == "delete":
                if not action.doc_id:
                    return DocumentsObservation.from_text("Error: doc_id required")
                result = request("DELETE", f"/api/openhands/documents/{action.doc_id}")
            else:
                return DocumentsObservation.from_text(f"Unknown action: {action.action}")
            return DocumentsObservation.from_text(str(result))
        except OdysseusHttpError as exc:
            return DocumentsObservation.from_text(f"Documents API error ({exc.status}): {exc.detail}")


class DocumentsTool(ToolDefinition[DocumentsAction, DocumentsObservation]):
    @classmethod
    def create(cls, conv_state=None, **params) -> Sequence["DocumentsTool"]:
        return [
            cls(
                description="Odysseus document library for long-form writing and drafts.",
                action_type=DocumentsAction,
                observation_type=DocumentsObservation,
                executor=DocumentsExecutor(),
                annotations=ToolAnnotations(title="Documents"),
            )
        ]


register_tool("documents", DocumentsTool)
