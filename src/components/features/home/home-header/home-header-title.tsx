import { useTranslation } from "react-i18next";
import { Typography } from "#/ui/typography";
import { I18nKey } from "#/i18n/declaration";

interface HomeHeaderTitleProps {
  titleKey?: I18nKey;
}

export function HomeHeaderTitle({
  titleKey = I18nKey.HOME$LETS_START_BUILDING,
}: HomeHeaderTitleProps) {
  const { t } = useTranslation("openhands");

  return (
    <div className="flex w-full items-center justify-center py-2">
      <Typography.H1 className="w-full text-center leading-normal">
        {t(titleKey)}
      </Typography.H1>
    </div>
  );
}
