import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BUNDLE_KIT_HOVER_DESCRIPTION,
  LMS_KIT_VARIANTS,
  type LmsKitVariant,
} from "@/constants/lmsKitVariants";
import {
  lmsCourseFieldSelect,
  lmsCourseFieldSelectIcon,
  lmsCourseFieldSelectWrap,
} from "./shopLmsStyles";

type LmsKitVariantSelectProps = {
  value: LmsKitVariant;
  onChange: (value: LmsKitVariant) => void;
};

export default function LmsKitVariantSelect({
  value,
  onChange,
}: LmsKitVariantSelectProps) {
  const [open, setOpen] = useState(false);
  const [bundleTipOpen, setBundleTipOpen] = useState(false);

  const selectedLabel =
    LMS_KIT_VARIANTS.find((kit) => kit.value === value)?.label ?? "Select kit type";

  const closeMenu = () => {
    setOpen(false);
    setBundleTipOpen(false);
  };

  const pick = (next: LmsKitVariant) => {
    onChange(next);
    closeMenu();
  };

  return (
    <div className={cn(lmsCourseFieldSelectWrap, "relative")}>
      <button
        type="button"
        className={cn(
          lmsCourseFieldSelect,
          "truncate whitespace-nowrap text-left"
        )}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selectedLabel}
      </button>
      <ChevronDown className={lmsCourseFieldSelectIcon} aria-hidden />

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close kit type menu"
            onClick={closeMenu}
          />
          <ul
            role="listbox"
            className="absolute left-0 top-full z-50 mt-1 w-max min-w-full overflow-visible rounded-xl border border-[#b8cfe8] bg-white py-1 shadow-lg"
          >
            {LMS_KIT_VARIANTS.map((kit) =>
              kit.value === "BUNDLE_4_IN_1" ? (
                <li key={kit.value} role="presentation">
                  <Tooltip open={bundleTipOpen}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        role="option"
                        aria-selected={value === kit.value}
                        className={cn(
                          "w-full whitespace-nowrap px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-[#f0f7ff] sm:text-base",
                          value === kit.value && "bg-[#e8f2fc] text-[#1a4d8c]"
                        )}
                        onMouseEnter={() => setBundleTipOpen(true)}
                        onMouseLeave={() => setBundleTipOpen(false)}
                        onFocus={() => setBundleTipOpen(true)}
                        onBlur={() => setBundleTipOpen(false)}
                        onClick={() => pick(kit.value)}
                      >
                        {kit.label}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="start"
                      className="max-w-[300px] border-[#b8cfe8] bg-white px-3 py-2 text-xs leading-relaxed text-[#1a4d8c] shadow-md"
                    >
                      {BUNDLE_KIT_HOVER_DESCRIPTION}
                    </TooltipContent>
                  </Tooltip>
                </li>
              ) : (
                <li key={kit.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === kit.value}
                    className={cn(
                      "w-full whitespace-nowrap px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-[#f0f7ff] sm:text-base",
                      value === kit.value && "bg-[#e8f2fc] text-[#1a4d8c]"
                    )}
                    onMouseEnter={() => setBundleTipOpen(false)}
                    onClick={() => pick(kit.value)}
                  >
                    {kit.label}
                  </button>
                </li>
              )
            )}
          </ul>
        </>
      )}
    </div>
  );
}
