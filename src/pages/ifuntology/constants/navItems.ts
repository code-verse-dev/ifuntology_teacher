export const IFUNTOLOGY_NAV_ITEMS = [
  { title: "Funtology", url: "/courses/funtology" },
  { title: "Barbertology", url: "/courses/barbertology" },
  { title: "Nailtology", url: "/courses/nailtology" },
  { title: "Skintology", url: "/courses/skintology" },
  { title: "Write to Read", url: "/ifuntology/write-to-read" },
] as const;

export const IFUNTOLOGY_COURSE_SLUGS = [
  "funtology",
  "barbertology",
  "nailtology",
  "skintology",
] as const;

export const isIfuntologySectionActive = (pathname: string) =>
  IFUNTOLOGY_NAV_ITEMS.some((item) =>
    "end" in item && item.end
      ? pathname === item.url
      : pathname.startsWith(item.url),
  ) ||
  IFUNTOLOGY_COURSE_SLUGS.some(
    (slug) =>
      pathname === `/ifuntology/courses/${slug}` ||
      pathname === `/courses/${slug}`,
  );
