/** LMS course types — keep in sync with backend CourseType enum. */
export const LMS_COURSE_TYPES = [
  "Funtology",
  "Skintology",
  "Barbertology",
  "Nailtology",
  "iTeach iFuntology",
  "iFuntology Braiding",
] as const;

export type LmsCourseType = (typeof LMS_COURSE_TYPES)[number];
