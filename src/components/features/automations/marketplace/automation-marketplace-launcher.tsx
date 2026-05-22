import { InstallServerModal } from "#/components/features/mcp-page/install-server-modal";
import { useRecommendedAutomationSelect } from "#/hooks/use-recommended-automation-select";
import { AutomationMarketplaceGrid } from "./automation-marketplace-grid";
import type { MarketplaceSectionFilter } from "./marketplace-section-filter";

interface AutomationMarketplaceLauncherProps {
  query?: string;
  sectionFilter?: MarketplaceSectionFilter;
  onLaunched?: () => void;
}

export function AutomationMarketplaceLauncher({
  query,
  sectionFilter,
  onLaunched,
}: AutomationMarketplaceLauncherProps) {
  const {
    backendKind,
    installedMcpServers,
    handleSelectAutomation,
    installEntry,
    cancelInstallFlow,
    handleInstallSuccess,
  } = useRecommendedAutomationSelect(onLaunched);

  return (
    <>
      <AutomationMarketplaceGrid
        backendKind={backendKind}
        installedServers={installedMcpServers}
        query={query}
        sectionFilter={sectionFilter}
        onSelect={handleSelectAutomation}
      />

      {installEntry ? (
        <InstallServerModal
          key={installEntry.id}
          entry={installEntry}
          onClose={cancelInstallFlow}
          onSuccess={handleInstallSuccess}
        />
      ) : null}
    </>
  );
}
