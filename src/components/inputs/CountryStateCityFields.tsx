import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCountryStateCity } from "@/hooks/useCountryStateCity";

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
  selectClassName?: string;
  labelClassName?: string;
  fieldClassName?: string;
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
  selectClassName,
  labelClassName,
  fieldClassName,
  countryLabel = "Country",
  stateLabel = "State",
  cityLabel = "City",
}: CountryStateCityFieldsProps) {
  const {
    countries,
    states,
    cities,
    countryIso,
    stateIso,
    handleCountryChange,
    handleStateChange,
    handleCityChange,
  } = useCountryStateCity({
    country,
    state,
    city,
    onCountryChange,
    onStateChange,
    onCityChange,
  });

  const requiredMark = required ? <span className="text-red-500"> *</span> : null;
  const selectStyles = cn(
    "w-full disabled:cursor-not-allowed disabled:opacity-50",
    selectClassName
  );

  return (
    <>
      <div className={cn("space-y-2", fieldClassName)}>
        <Label htmlFor={`${idPrefix}-country`} className={labelClassName}>
          {countryLabel}
          {requiredMark}
        </Label>
        <select
          id={`${idPrefix}-country`}
          value={countryIso}
          onChange={(e) => handleCountryChange(e.target.value)}
          className={selectStyles}
          disabled={disabled}
          required={required}
        >
          <option value="">Select country</option>
          {countries.map((item) => (
            <option key={item.isoCode} value={item.isoCode}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className={cn("space-y-2", fieldClassName)}>
        <Label htmlFor={`${idPrefix}-state`} className={labelClassName}>
          {stateLabel}
          {requiredMark}
        </Label>
        <select
          id={`${idPrefix}-state`}
          value={stateIso}
          onChange={(e) => handleStateChange(e.target.value)}
          className={selectStyles}
          disabled={disabled || !countryIso || states.length === 0}
          required={required && states.length > 0}
        >
          <option value="">
            {!countryIso
              ? "Select country first"
              : states.length === 0
                ? "No states available"
                : "Select state"}
          </option>
          {states.map((item) => (
            <option key={item.isoCode} value={item.isoCode}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className={cn("space-y-2", fieldClassName)}>
        <Label htmlFor={`${idPrefix}-city`} className={labelClassName}>
          {cityLabel}
          {requiredMark}
        </Label>
        <select
          id={`${idPrefix}-city`}
          value={city}
          onChange={(e) => handleCityChange(e.target.value)}
          className={selectStyles}
          disabled={
            disabled ||
            !countryIso ||
            cities.length === 0 ||
            (states.length > 0 && !stateIso)
          }
          required={required}
        >
          <option value="">
            {!countryIso
              ? "Select country first"
              : states.length > 0 && !stateIso
                ? "Select state first"
                : cities.length === 0
                  ? "No cities available"
                  : "Select city"}
          </option>
          {cities.map((item) => (
            <option
              key={`${item.name}-${item.latitude}-${item.longitude}`}
              value={item.name}
            >
              {item.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
