export const getBasename = () => {
  const { hostname } = window.location;
  let basename = "";
  if (hostname.includes("react.customdev.solutions")) {
    basename = "/ifuntology/teacher";
  }
  return basename;
};

// export const ImageUrl = (image: string) => {
//     let { PUBLIC_URL } = process.env;
//     return `${PUBLIC_URL}/images/${image}`;
// };

export const ImageUrl = (image: string) => {
  return `${getBasename()}/images/${image}`;
};
