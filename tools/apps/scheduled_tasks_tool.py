"""Scheduled tasks tool backed by Odysseus."""

from __future__ import annotations

from collections.abc import Sequence
from typing import Literal

from pydantic import Field

from openhands.sdk import Action, Observation, ToolDefinition
from openhands.sdk.tool import ToolAnnotations, ToolExecutor, register_tool

from apps.odysseus_http import OdysseusHttpError, request

ScheduledTasksActionKind = Literal["list", "create", "run", "pause", "resume"]


class ScheduledTasksAction(Action):
    action: ScheduledTasksActionKind = Field(description="Scheduled task operation.")
    task_id: str | None = Field(default=None, description="Task id.")
    body: dict | None = Field(default=None, description="Task create payload.")


class ScheduledTasksObservation(Observation):
    pass


class ScheduledTasksExecutor(ToolExecutor[ScheduledTasksAction, ScheduledTasksObservation]):
    def __call__(self, action: ScheduledTasksAction, conversation=None) -> ScheduledTasksObservation:
        try:
            if action.action == "list":
                result = request("GET", "/api/openhands/tasks")
            elif action.action == "create":
                result = request("POST", "/api/openhands/tasks", body=action.body or {})
            elif action.action == "run":
                if not action.task_id:
                    return ScheduledTasksObservation.from_text("Error: task_id required")
                result = request("POST", f"/api/openhands/tasks/{action.task_id}/run")
            elif action.action in ("pause", "resume"):
                if not action.task_id:
                    return ScheduledTasksObservation.from_text("Error: task_id required")
                result = request("POST", f"/api/openhands/tasks/{action.task_id}/{action.action}")
            else:
                return ScheduledTasksObservation.from_text(f"Unknown action: {action.action}")
            return ScheduledTasksObservation.from_text(str(result))
        except OdysseusHttpError as exc:
            return ScheduledTasksObservation.from_text(
                f"Scheduled tasks API error ({exc.status}): {exc.detail}"
            )


class ScheduledTasksTool(ToolDefinition[ScheduledTasksAction, ScheduledTasksObservation]):
    @classmethod
    def create(cls, conv_state=None, **params) -> Sequence["ScheduledTasksTool"]:
        return [
            cls(
                description="Odysseus scheduled/automated tasks (cron, daily brief, email triage).",
                action_type=ScheduledTasksAction,
                observation_type=ScheduledTasksObservation,
                executor=ScheduledTasksExecutor(),
                annotations=ToolAnnotations(title="Scheduled Tasks"),
            )
        ]


register_tool("scheduled_tasks", ScheduledTasksTool)
