export type ShopContactFields = {
  organizationName: string;
  email: string;
  address: string;
  country: string;
  city: string;
  stateVal: string;
  streetAddress: string;
  zip: string;
  shippingAddress: string;
  shippingCountry: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
};

export function getShopContactDetailsError(
  state: ShopContactFields
): string | null {
  if (!state.organizationName.trim()) {
    return "Organization name is required.";
  }
  if (!state.email.trim()) {
    return "Email is required.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(state.email.trim())) {
    return "Enter a valid email address.";
  }
  if (!state.address.trim()) {
    return "Organization address is required.";
  }
  if (!state.country.trim()) {
    return "Country is required.";
  }
  if (!state.city.trim()) {
    return "City is required.";
  }
  if (!state.stateVal.trim()) {
    return "State is required.";
  }
  if (!state.streetAddress.trim()) {
    return "Street address is required.";
  }
  if (!state.zip.trim()) {
    return "Zip code is required.";
  }
  if (!state.shippingAddress.trim()) {
    return "Shipping address is required.";
  }
  if (!state.shippingCountry.trim()) {
    return "Shipping country is required.";
  }
  if (!state.shippingCity.trim()) {
    return "Shipping city is required.";
  }
  if (!state.shippingState.trim()) {
    return "Shipping state is required.";
  }
  if (!state.shippingZip.trim()) {
    return "Shipping zip code is required.";
  }
  return null;
}

export function isShopContactDetailsComplete(state: ShopContactFields): boolean {
  return getShopContactDetailsError(state) === null;
}
