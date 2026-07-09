const MARKETING_IMAGE_BASE = "https://ifuntology.com/images/";

export const marketingImageUrl = (image: string) => {
  const name = image.replace(/^\/+/, "");
  return `${MARKETING_IMAGE_BASE}${name}`;
};
