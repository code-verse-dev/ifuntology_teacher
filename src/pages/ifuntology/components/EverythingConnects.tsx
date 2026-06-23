import { ArrowRight } from "lucide-react";
import { aosData, aosStaggerDelay } from "../utils/aosData";
import SectionHeader from "./SectionHeader";

export interface ConnectionStep {
  label: string;
  colorClassName: string;
}

interface EverythingConnectsProps {
  eyebrow?: string;
  title?: string;
  steps: ConnectionStep[];
  description?: string;
}

export default function EverythingConnects({
  eyebrow = "INTEGRATION STEPS",
  title = "Everything Connects",
  steps,
  description,
}: EverythingConnectsProps) {
  return (
    <section className="ifi-card p-6 sm:p-8">
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {steps.map((step, i) => (
          <span
            key={step.label}
            className="inline-flex items-center gap-2"
            {...aosData("fade-up", { delay: aosStaggerDelay(i, 55) + 120 })}
          >
            <span className={`ifi-step-pill ${step.colorClassName}`}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <ArrowRight
                className="hidden h-3.5 w-3.5 text-slate-600 sm:block"
                strokeWidth={2.5}
                aria-hidden
              />
            )}
          </span>
        ))}
      </div>
    </section>
  );
}
