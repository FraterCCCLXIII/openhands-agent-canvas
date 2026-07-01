import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { BrandButton } from "#/components/features/settings/brand-button";
import { ContextMenuListItem } from "#/components/features/context-menu/context-menu-list-item";
import { I18nKey } from "#/i18n/declaration";
import { Wand } from "lucide-react";
import ChevronDownSmallIcon from "#/icons/chevron-down-small.svg?react";
import CogIcon from "#/icons/cog.svg?react";
import MessageSquareShareIcon from "#/icons/message-square-share.svg?react";
import { useCreateAutomationInChat } from "#/hooks/use-create-automation-in-chat";
import { useIsCreatingConversation } from "#/hooks/use-is-creating-conversation";
import { useCreateConversation } from "#/hooks/mutation/use-create-conversation";
import { ContextMenu } from "#/ui/context-menu";
import { dropdownMenuRowIconWrapperClassName } from "#/utils/dropdown-classes";
import { cn } from "#/utils/utils";

interface AddAutomationMenuProps {
  onSetupManually: () => void;
  onUseWizard: () => void;
}

function MenuItemContent({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="flex min-w-0 w-full items-center gap-2">
      <span className={dropdownMenuRowIconWrapperClassName} aria-hidden>
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </span>
  );
}

export function AddAutomationMenu({
  onSetupManually,
  onUseWizard,
}: AddAutomationMenuProps) {
  const { t } = useTranslation("openhands");
  const [open, setOpen] = useState(false);
  const [portalStyle, setPortalStyle] = useState<React.CSSProperties>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const createAutomationInChat = useCreateAutomationInChat();
  const createConversation = useCreateConversation();
  const isCreatingConversation = useIsCreatingConversation();
  const isBusy = createConversation.isPending || isCreatingConversation;

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return undefined;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const gap = 2;
      setPortalStyle({
        position: "fixed",
        zIndex: 9999,
        top: rect.bottom + gap,
        right: window.innerWidth - rect.right,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleCreateInChat = () => {
    setOpen(false);
    createAutomationInChat();
  };

  const handleUseWizard = () => {
    setOpen(false);
    onUseWizard();
  };

  const handleSetupManually = () => {
    setOpen(false);
    onSetupManually();
  };

  const menu =
    open && portalStyle ? (
      <ContextMenu
        ref={menuRef}
        theme="popover"
        className="min-w-[12.5rem]"
        testId="automations-add-automation-menu"
      >
        <li>
          <ContextMenuListItem
            testId="automations-add-automation-create-in-chat"
            onClick={handleCreateInChat}
            isDisabled={isBusy}
            className="group"
          >
            <MenuItemContent
              icon={MessageSquareShareIcon}
              label={t(I18nKey.AUTOMATIONS$CREATE_IN_CHAT)}
            />
          </ContextMenuListItem>
        </li>
        <li>
          <ContextMenuListItem
            testId="automations-add-automation-use-wizard"
            onClick={handleUseWizard}
            className="group"
          >
            <MenuItemContent
              icon={Wand}
              label={t(I18nKey.AUTOMATIONS$USE_WIZARD)}
            />
          </ContextMenuListItem>
        </li>
        <li>
          <ContextMenuListItem
            testId="automations-add-automation-setup-manually"
            onClick={handleSetupManually}
            className="group"
          >
            <MenuItemContent
              icon={CogIcon}
              label={t(I18nKey.AUTOMATIONS$SETUP_MANUALLY)}
            />
          </ContextMenuListItem>
        </li>
      </ContextMenu>
    ) : null;

  return (
    <>
      <BrandButton
        ref={triggerRef}
        type="button"
        variant="primary"
        testId="automations-add-automation"
        className="shrink-0 whitespace-nowrap"
        isDisabled={isBusy}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="inline-flex items-center gap-2">
          {t(I18nKey.AUTOMATIONS$ADD_AUTOMATION)}
          <ChevronDownSmallIcon
            className={cn(
              "size-4 transition-transform motion-reduce:transition-none",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </span>
      </BrandButton>

      {open && portalStyle && typeof document !== "undefined"
        ? ReactDOM.createPortal(
            <div style={portalStyle}>{menu}</div>,
            document.body,
          )
        : null}
    </>
  );
}
