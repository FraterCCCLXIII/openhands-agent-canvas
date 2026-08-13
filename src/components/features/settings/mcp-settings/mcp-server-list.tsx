import { useTranslation } from "react-i18next";
import { MCPServerListItem } from "./mcp-server-list-item";
import { I18nKey } from "#/i18n/declaration";
import { extensionModuleEmptyStateClassName } from "#/utils/extension-module-card-classes";
import {
  settingsListContainerClassName,
  settingsListTableHeadClassName,
  settingsListTableHeaderCellClassName,
} from "#/utils/settings-list-classes";
import { cn } from "#/utils/utils";
import type { MCPServerConfig } from "#/types/mcp-server";

interface MCPServerListProps {
  servers: MCPServerConfig[];
  onEdit: (server: MCPServerConfig) => void;
  onDelete: (serverId: string) => void;
}

export function MCPServerList({
  servers,
  onEdit,
  onDelete,
}: MCPServerListProps) {
  const { t } = useTranslation("openhands");

  if (servers.length === 0) {
    return (
      <div className={extensionModuleEmptyStateClassName}>
        <p className="text-content-2 text-sm">
          {t(I18nKey.SETTINGS$MCP_NO_SERVERS)}
        </p>
      </div>
    );
  }

  return (
    <div className={settingsListContainerClassName}>
      <table className="w-full min-w-full table-fixed">
        <thead className={settingsListTableHeadClassName}>
          <tr>
            <th className={cn(settingsListTableHeaderCellClassName, "w-1/5")}>
              {t(I18nKey.SETTINGS$NAME)}
            </th>
            <th
              className={cn(settingsListTableHeaderCellClassName, "w-[120px]")}
            >
              {t(I18nKey.SETTINGS$MCP_SERVER_TYPE)}
            </th>
            <th className={settingsListTableHeaderCellClassName}>
              {t(I18nKey.SETTINGS$MCP_SERVER_DETAILS)}
            </th>
            <th
              className={cn(
                settingsListTableHeaderCellClassName,
                "w-[10%] text-right",
              )}
            >
              {t(I18nKey.SETTINGS$ACTIONS)}
            </th>
          </tr>
        </thead>
        <tbody>
          {servers.map((server) => (
            <MCPServerListItem
              key={server.id}
              server={server}
              onEdit={() => onEdit(server)}
              onDelete={() => onDelete(server.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
