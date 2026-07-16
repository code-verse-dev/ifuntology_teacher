import { useState } from "react";
import {
  CitySelect,
  CountrySelect,
  StateSelect,
} from "react-country-state-city";
import { Building2, Globe, MapPinned } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import "./location-fields.css";

const locationDataSrc = "/country-state-city-data";

type CountryStateCityFieldsProps = {
  idPrefix: string;
  country: string;
  state: string;
  city: string;
  onCountryChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  variant?: "shop" | "pill";
  showIcons?: boolean;
  labelClassName?: string;
  fieldClassName?: string;
  requiredMarkClassName?: string;
  countryLabel?: string;
  stateLabel?: string;
  cityLabel?: string;
};

export default function CountryStateCityFields({
  idPrefix,
  country,
  state,
  city,
  onCountryChange,
  onStateChange,
  onCityChange,
  disabled = false,
  required = false,
  variant = "shop",
  showIcons = false,
  labelClassName,
  fieldClassName,
  requiredMarkClassName = "text-rose-500",
  countryLabel = "Country",
  stateLabel = "State",
  cityLabel = "City",
}: CountryStateCityFieldsProps) {
  const [countryId, setCountryId] = useState(0);
  const [stateId, setStateId] = useState(0);
  const [countryHasStates, setCountryHasStates] = useState(true);

  const fieldWrapperClassName = cn(
    "location-field",
    variant === "pill" && "location-field--pill",
    variant === "shop" && "location-field--shop",
    showIcons && "location-field--with-icon",
  );

  const cityInputClassName =
    variant === "pill"
      ? "h-11 rounded-full border-border/80 bg-background/80 pl-10"
      : "mt-2 h-12 rounded-xl border-0 bg-muted/50 px-4 text-sm shadow-none";

  const requiredMark = required ? (
    <span className={cn(requiredMarkClassName)}> *</span>
  ) : null;

  return (
    <>
      <div className={cn("space-y-2", fieldClassName)}>
        <Label htmlFor={`${idPrefix}-country`} className={labelClassName}>
          {countryLabel}
          {requiredMark}
        </Label>
        <div
          className={cn(
            fieldWrapperClassName,
            variant === "shop" && "mt-2",
          )}
        >
          {showIcons ? (
            <Globe className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          ) : null}
          <CountrySelect
            id={`${idPrefix}-country`}
            placeHolder="Select country"
            showFlag={false}
            src={locationDataSrc}
            containerClassName="location-select-wrapper"
            disabled={disabled}
            onChange={(selected) => {
              onCountryChange(selected.name);
              setCountryId(selected.id);
              setCountryHasStates(selected.hasStates);
              setStateId(0);
              onStateChange("");
              onCityChange("");
            }}
          />
        </div>
      </div>

      <div className={cn("space-y-2", fieldClassName)}>
        <Label htmlFor={`${idPrefix}-state`} className={labelClassName}>
          {stateLabel}
          {required && countryHasStates ? (
            <span className={cn(requiredMarkClassName)}> *</span>
          ) : !countryHasStates ? (
            <span className="text-muted-foreground"> (optional)</span>
          ) : null}
        </Label>
        <div
          className={cn(
            fieldWrapperClassName,
            variant === "shop" && "mt-2",
          )}
        >
          {showIcons ? (
            <MapPinned className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          ) : null}
          <StateSelect
            id={`${idPrefix}-state`}
            placeHolder={
              !countryId
                ? "Select country first"
                : countryHasStates
                  ? "Select state"
                  : "No states available"
            }
            src={locationDataSrc}
            countryid={countryId}
            containerClassName="location-select-wrapper"
            disabled={disabled || !countryId || !countryHasStates}
            onChange={(selected) => {
              onStateChange(selected.name);
              setStateId(selected.id);
              onCityChange("");
            }}
          />
        </div>
      </div>

      <div className={cn("space-y-2", fieldClassName)}>
        <Label htmlFor={`${idPrefix}-city`} className={labelClassName}>
          {cityLabel}
          {requiredMark}
        </Label>
        {countryHasStates ? (
          <div
            className={cn(
              fieldWrapperClassName,
              variant === "shop" && "mt-2",
            )}
          >
            {showIcons ? (
              <Building2 className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            ) : null}
            <CitySelect
              id={`${idPrefix}-city`}
              placeHolder={
                !countryId
                  ? "Select country first"
                  : !stateId
                    ? "Select state first"
                    : "Select city"
              }
              countryid={countryId}
              stateid={stateId}
              containerClassName="location-select-wrapper"
              disabled={disabled || !countryId || !stateId}
              onChange={(selected) => onCityChange(selected.name)}
            />
          </div>
        ) : (
          <div className="relative">
            {showIcons ? (
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            ) : null}
            <Input
              id={`${idPrefix}-city`}
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              className={cityInputClassName}
              disabled={disabled || !countryId}
              required={required}
              placeholder="Enter city"
            />
          </div>
        )}
      </div>
    </>
  );
}
