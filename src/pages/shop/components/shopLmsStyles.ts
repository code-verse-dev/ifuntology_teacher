export const lmsFieldLabel =
  "text-sm font-semibold text-[#1a4d8c] dark:text-[#1a4d8c]";

export const lmsFieldRequired = "text-rose-500";

export const lmsFieldInput =
  "mt-2.5 h-[52px] w-full rounded-xl border-0 bg-white px-5 text-base font-medium text-slate-700 shadow-[0_4px_14px_rgba(30,80,140,0.12)] outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#4a90e2]/40";

export const lmsFieldSelect = `${lmsFieldInput} appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')] bg-[length:16px] bg-[right_16px_center] bg-no-repeat pr-11`;

export const lmsCourseCard =
  "rounded-2xl border border-white/70 bg-white/30 p-6 shadow-[0_4px_20px_rgba(30,80,140,0.1)] backdrop-blur-[2px]";

export const lmsCourseCardLabel =
  "text-sm font-semibold text-[#1a4d8c]";

export const lmsCourseFieldInput =
  "mt-2.5 h-12 w-full min-w-0 rounded-xl border-0 bg-white px-4 text-base font-medium text-slate-700 shadow-[0_2px_10px_rgba(30,80,140,0.1)] outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#4a90e2]/35";

export const lmsCourseFieldSelectWrap = "relative mt-2.5";

export const lmsCourseFieldSelect =
  "h-12 w-full min-w-0 cursor-pointer appearance-none rounded-xl border border-[#b8cfe8] bg-[#f8fbff] pl-4 pr-10 text-base font-medium text-slate-700 shadow-[inset_0_1px_2px_rgba(30,80,140,0.06)] outline-none focus-visible:border-[#4a90e2] focus-visible:ring-2 focus-visible:ring-[#4a90e2]/35";

export const lmsCourseFieldSelectIcon =
  "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a7099]";

export const lmsCoursePills = [
  {
    label: "Funtology",
    className: "bg-gradient-to-b from-[#c6285c] to-[#7b1538] shadow-[0_4px_12px_rgba(123,21,56,0.45)]",
    link: "https://erp.ifuntology.com/courses/funtology",
  },
  {
    label: "Barbertology",
    className: "bg-gradient-to-b from-[#c9a227] to-[#7a5f12] shadow-[0_4px_12px_rgba(122,95,18,0.4)]",
    link: "https://erp.ifuntology.com/courses/barbertology",
  },
  {
    label: "Nailtology",
    className: "bg-gradient-to-b from-[#00838f] to-[#004d56] shadow-[0_4px_12px_rgba(0,77,86,0.4)]",
    link: "https://erp.ifuntology.com/courses/nailtology",
  },
  {
    label: "Skintology",
    className: "bg-gradient-to-b from-[#43a047] to-[#1b5e20] shadow-[0_4px_12px_rgba(27,94,32,0.4)]",
    link: "https://erp.ifuntology.com/courses/skintology",
  },
] as const;
