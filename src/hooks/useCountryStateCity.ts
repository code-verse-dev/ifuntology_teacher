import { useMemo, useState } from "react";
import { City, Country, State } from "country-state-city";
import type { ICity, ICountry, IState } from "country-state-city";

type UseCountryStateCityOptions = {
  country: string;
  state: string;
  city: string;
  onCountryChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
};

export function useCountryStateCity({
  country: _country,
  state: _state,
  city: _city,
  onCountryChange,
  onStateChange,
  onCityChange,
}: UseCountryStateCityOptions) {
  const countries = useMemo<ICountry[]>(() => Country.getAllCountries(), []);
  const [countryIso, setCountryIso] = useState("");
  const [stateIso, setStateIso] = useState("");

  const states = useMemo<IState[]>(
    () => (countryIso ? State.getStatesOfCountry(countryIso) : []),
    [countryIso]
  );

  const cities = useMemo<ICity[]>(() => {
    if (!countryIso) return [];
    if (states.length > 0) {
      if (!stateIso) return [];
      return City.getCitiesOfState(countryIso, stateIso) ?? [];
    }
    return City.getCitiesOfCountry(countryIso) ?? [];
  }, [countryIso, stateIso, states.length]);

  const handleCountryChange = (isoCode: string) => {
    const selected = countries.find((item) => item.isoCode === isoCode);

    setCountryIso(isoCode);
    setStateIso("");
    onCountryChange(selected?.name ?? "");
    onStateChange("");
    onCityChange("");
  };

  const handleStateChange = (isoCode: string) => {
    const selected = states.find((item) => item.isoCode === isoCode);

    setStateIso(isoCode);
    onStateChange(selected?.name ?? "");
    onCityChange("");
  };

  const handleCityChange = (cityName: string) => {
    onCityChange(cityName);
  };

  return {
    countries,
    states,
    cities,
    countryIso,
    stateIso,
    handleCountryChange,
    handleStateChange,
    handleCityChange,
  };
}
