import { extensionModuleEmptyStateClassName } from "#/utils/extension-module-card-classes";
import { CreateInstructions } from "./create-instructions";

export function EmptyState() {
  return (
    <div
      data-testid="automations-empty"
      className={extensionModuleEmptyStateClassName}
    >
      <CreateInstructions />
    </div>
  );
}
