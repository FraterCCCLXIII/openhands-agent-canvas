import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AddAutomationModal } from "./add-automation-modal";
import { CreateAutomationWizardModal } from "./create-automation-wizard/create-automation-wizard-modal";

interface AutomateAddAutomationContextValue {
  openManualSetup: () => void;
  openWizard: () => void;
}

const AutomateAddAutomationContext =
  createContext<AutomateAddAutomationContextValue | null>(null);

export function AutomateAddAutomationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isAddAutomationOpen, setIsAddAutomationOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const openManualSetup = useCallback(() => {
    setIsAddAutomationOpen(true);
  }, []);

  const openWizard = useCallback(() => {
    setIsWizardOpen(true);
  }, []);

  const value = useMemo(
    () => ({ openManualSetup, openWizard }),
    [openManualSetup, openWizard],
  );

  return (
    <AutomateAddAutomationContext.Provider value={value}>
      {children}
      <AddAutomationModal
        isOpen={isAddAutomationOpen}
        onClose={() => setIsAddAutomationOpen(false)}
      />
      <CreateAutomationWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </AutomateAddAutomationContext.Provider>
  );
}

export function useAutomateAddAutomation() {
  return useContext(AutomateAddAutomationContext);
}
