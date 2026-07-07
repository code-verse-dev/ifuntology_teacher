import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
// import { useCountryStateCity } from "@/hooks/useCountryStateCity";

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
  // const {
  //   countries,
  //   states,
  //   cities,
  //   countryIso,
  //   stateIso,
  //   handleCountryChange,
  //   handleStateChange,
  //   handleCityChange,
  // } = useCountryStateCity({
  //   country,
  //   state,
  //   city,
  //   onCountryChange,
  //   onStateChange,
  //   onCityChange,
  // });

  const requiredMark = required ? <span className="text-red-500"> *</span> : null;
  const inputStyles = cn(
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
        <Input
          id={`${idPrefix}-country`}
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          className={inputStyles}
          disabled={disabled}
          required={required}
          placeholder="e.g. United States"
        />
      </div>

      <div className={cn("space-y-2", fieldClassName)}>
        <Label htmlFor={`${idPrefix}-state`} className={labelClassName}>
          {stateLabel}
          {requiredMark}
        </Label>
        <Input
          id={`${idPrefix}-state`}
          value={state}
          onChange={(e) => onStateChange(e.target.value)}
          className={inputStyles}
          disabled={disabled}
          required={required}
          placeholder="e.g. Alaska"
        />
      </div>

      <div className={cn("space-y-2", fieldClassName)}>
        <Label htmlFor={`${idPrefix}-city`} className={labelClassName}>
          {cityLabel}
          {requiredMark}
        </Label>
        <Input
          id={`${idPrefix}-city`}
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className={inputStyles}
          disabled={disabled}
          required={required}
          placeholder="e.g. Anchorage"
        />
      </div>
    </>
  );
}
