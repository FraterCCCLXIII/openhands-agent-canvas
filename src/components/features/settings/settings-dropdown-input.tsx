import { Autocomplete, AutocompleteItem } from "@heroui/react";
import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { OptionalTag } from "./optional-tag";
import { cn } from "#/utils/utils";
import {
  formControlHeroUiInputClassName,
  formControlSettingsFieldClassName,
  formControlSettingsLabelClassName,
} from "#/utils/form-control-classes";
import { heroUiAutocompleteSelectorButtonClassName } from "#/ui/combobox-caret";
import { I18nKey } from "#/i18n/declaration";

interface SettingsDropdownInputProps {
  testId: string;
  name: string;
  items: { key: React.Key; label: string }[];
  label?: ReactNode;
  labelClassName?: string;
  wrapperClassName?: string;
  placeholder?: string;
  showOptionalTag?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  defaultSelectedKey?: string;
  selectedKey?: string;
  isClearable?: boolean;
  allowsCustomValue?: boolean;
  required?: boolean;
  onSelectionChange?: (key: React.Key | null) => void;
  onInputChange?: (value: string) => void;
  defaultFilter?: (textValue: string, inputValue: string) => boolean;
  startContent?: ReactNode;
  inputWrapperClassName?: string;
  inputClassName?: string;
  autocompleteClassName?: string;
}

export function SettingsDropdownInput({
  testId,
  label,
  labelClassName,
  wrapperClassName,
  name,
  items,
  placeholder,
  showOptionalTag,
  isDisabled,
  isLoading,
  defaultSelectedKey,
  selectedKey,
  isClearable,
  allowsCustomValue,
  required,
  onSelectionChange,
  onInputChange,
  defaultFilter,
  startContent,
  inputWrapperClassName,
  inputClassName,
  autocompleteClassName,
}: SettingsDropdownInputProps) {
  const { t } = useTranslation("openhands");
  const isScreenReaderOnlyLabel =
    typeof labelClassName === "string" && labelClassName.includes("sr-only");

  return (
    <label
      className={cn(
        "flex flex-col w-full min-w-0",
        isScreenReaderOnlyLabel ? "gap-0" : "gap-2.5",
        wrapperClassName,
      )}
    >
      {label && !isScreenReaderOnlyLabel ? (
        <div className="flex items-center gap-1">
          <span
            className={cn(formControlSettingsLabelClassName, labelClassName)}
          >
            {label}
          </span>
          {showOptionalTag && <OptionalTag />}
        </div>
      ) : null}
      <Autocomplete
        aria-label={
          typeof label === "string"
            ? label
            : typeof name === "string"
              ? name
              : undefined
        }
        data-testid={testId}
        name={name}
        defaultItems={items}
        defaultSelectedKey={defaultSelectedKey}
        selectedKey={selectedKey}
        onSelectionChange={onSelectionChange}
        onInputChange={onInputChange}
        isClearable={isClearable}
        isDisabled={isDisabled || isLoading}
        isLoading={isLoading}
        placeholder={isLoading ? t(I18nKey.HOME$LOADING) : placeholder}
        allowsCustomValue={allowsCustomValue}
        isRequired={required}
        className={cn("w-full", autocompleteClassName)}
        classNames={{
          popoverContent: "bg-content1 rounded-xl",
          selectorButton: cn(
            heroUiAutocompleteSelectorButtonClassName,
            "text-muted",
          ),
        }}
        selectorButtonProps={{ disableRipple: true }}
        inputProps={{
          classNames: {
            inputWrapper: cn(
              formControlSettingsFieldClassName,
              inputWrapperClassName,
            ),
            input: cn(formControlHeroUiInputClassName, inputClassName),
          },
        }}
        defaultFilter={defaultFilter}
        startContent={startContent || null}
      >
        {(item) => (
          <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
        )}
      </Autocomplete>
    </label>
  );
}
