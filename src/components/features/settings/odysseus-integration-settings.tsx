import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchOdysseusCapabilities,
  OdysseusApiError,
} from "#/apps/odysseus-client";
import { ODYSSEUS_TOKEN_SECRET_NAME, ODYSSEUS_URL_ENV } from "#/apps/types";
import { SecretsService } from "#/api/secrets-service";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { SettingsSwitch } from "#/components/features/settings/settings-switch";
import { I18nKey } from "#/i18n/declaration";
import { useOdysseusStore } from "#/stores/odysseus-store";
import { cn } from "#/utils/utils";

export function OdysseusIntegrationSettings() {
  const { t } = useTranslation("openhands");
  const url = useOdysseusStore((s) => s.url);
  const token = useOdysseusStore((s) => s.token);
  const memoryEnabled = useOdysseusStore((s) => s.memoryEnabled);
  const memoryInjectOnStart = useOdysseusStore((s) => s.memoryInjectOnStart);
  const setUrl = useOdysseusStore((s) => s.setUrl);
  const setToken = useOdysseusStore((s) => s.setToken);
  const setMemoryEnabled = useOdysseusStore((s) => s.setMemoryEnabled);
  const setMemoryInjectOnStart = useOdysseusStore(
    (s) => s.setMemoryInjectOnStart,
  );

  const [status, setStatus] = useState<string>("");
  const [testing, setTesting] = useState(false);

  const saveSecrets = async () => {
    if (token?.trim()) {
      await SecretsService.createSecret(
        ODYSSEUS_TOKEN_SECRET_NAME,
        token.trim(),
        "Odysseus API token for Work Apps",
      );
    }
    if (url?.trim()) {
      await SecretsService.createSecret(
        ODYSSEUS_URL_ENV,
        url.trim(),
        "Odysseus base URL for Work Apps",
      );
    }
  };

  const testConnection = async () => {
    if (!url?.trim() || !token?.trim()) {
      setStatus(t(I18nKey.APPS$ODYSSEUS_MISSING_FIELDS));
      return;
    }
    setTesting(true);
    setStatus("");
    try {
      const caps = await fetchOdysseusCapabilities(url, token);
      await saveSecrets();
      setStatus(
        t(I18nKey.APPS$ODYSSEUS_CONNECTED, {
          integration: caps.integration,
        }),
      );
    } catch (error) {
      const message =
        error instanceof OdysseusApiError
          ? error.message
          : t(I18nKey.APPS$ODYSSEUS_CONNECT_FAILED);
      setStatus(message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-neutral-500">
        {t(I18nKey.APPS$ODYSSEUS_HELP)}
      </p>
      <SettingsInput
        label={t(I18nKey.APPS$ODYSSEUS_URL)}
        type="text"
        value={url ?? ""}
        onChange={(value) => setUrl(value)}
        placeholder="http://127.0.0.1:7000"
      />
      <SettingsInput
        label={t(I18nKey.APPS$ODYSSEUS_TOKEN)}
        type="password"
        value={token ?? ""}
        onChange={(value) => setToken(value)}
        placeholder="ody_..."
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(
            "rounded-md border border-neutral-700 px-3 py-1.5 text-sm",
            testing && "opacity-60",
          )}
          disabled={testing}
          onClick={() => void testConnection()}
        >
          {testing
            ? t(I18nKey.APPS$ODYSSEUS_TESTING)
            : t(I18nKey.APPS$ODYSSEUS_TEST)}
        </button>
        {status ? (
          <span className="text-xs text-neutral-400">{status}</span>
        ) : null}
      </div>
      <SettingsSwitch isToggled={memoryEnabled} onToggle={setMemoryEnabled}>
        {t(I18nKey.APPS$MEMORY_ENABLED)}
      </SettingsSwitch>
      <SettingsSwitch
        isToggled={memoryInjectOnStart}
        onToggle={setMemoryInjectOnStart}
        isDisabled={!memoryEnabled}
      >
        {t(I18nKey.APPS$MEMORY_INJECT)}
      </SettingsSwitch>
    </div>
  );
}
