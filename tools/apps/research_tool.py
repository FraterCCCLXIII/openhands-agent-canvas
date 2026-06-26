"""Work Research tool backed by Odysseus."""

from __future__ import annotations

from collections.abc import Sequence
from typing import Literal

from pydantic import Field

from openhands.sdk import Action, Observation, ToolDefinition
from openhands.sdk.tool import ToolAnnotations, ToolExecutor, register_tool

from apps.odysseus_http import OdysseusHttpError, request

ResearchActionKind = Literal["trigger", "list", "get_report"]


class ResearchAction(Action):
    action: ResearchActionKind = Field(description="Research operation.")
    query: str | None = Field(default=None, description="Research question for trigger.")
    session_id: str | None = Field(default=None, description="Research session id.")


class ResearchObservation(Observation):
    pass


class ResearchExecutor(ToolExecutor[ResearchAction, ResearchObservation]):
    def __call__(self, action: ResearchAction, conversation=None) -> ResearchObservation:
        try:
            if action.action == "trigger":
                if not (action.query or "").strip():
                    return ResearchObservation.from_text("Error: query required")
                result = request(
                    "POST",
                    "/api/openhands/research/trigger",
                    body={"query": action.query.strip()},
                )
            elif action.action == "list":
                result = request("GET", "/api/openhands/research")
            elif action.action == "get_report":
                if not action.session_id:
                    return ResearchObservation.from_text("Error: session_id required")
                result = request("GET", f"/api/openhands/research/{action.session_id}")
            else:
                return ResearchObservation.from_text(f"Unknown action: {action.action}")
            return ResearchObservation.from_text(str(result))
        except OdysseusHttpError as exc:
            return ResearchObservation.from_text(f"Research API error ({exc.status}): {exc.detail}")


class ResearchTool(ToolDefinition[ResearchAction, ResearchObservation]):
    @classmethod
    def create(cls, conv_state=None, **params) -> Sequence["ResearchTool"]:
        return [
            cls(
                description="Multi-step web research with saved reports.",
                action_type=ResearchAction,
                observation_type=ResearchObservation,
                executor=ResearchExecutor(),
                annotations=ToolAnnotations(title="Research"),
            )
        ]


register_tool("research", ResearchTool)
