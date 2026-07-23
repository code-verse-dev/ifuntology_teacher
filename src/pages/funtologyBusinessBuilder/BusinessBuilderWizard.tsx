import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, Calculator, Check, Wallet } from "lucide-react";
import { toast } from "sonner";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import IntroFormStep from "./IntroFormStep";
import EstimateCalculatorPage from "./EstimateCalculatorPage";
import StudentBudgetPage from "./StudentBudgetPage";
import {
  createEmptyIntroForm,
  validateIntroForm,
  type IntroFormData,
} from "./introFormData";

const STEPS = [
  {
    id: 1,
    title: "Business Profile",
    short: "Intro",
    description: "Basic business details",
    icon: Building2,
  },
  {
    id: 2,
    title: "Salon Estimate",
    short: "Estimate",
    description: "Construction & operating costs",
    icon: Calculator,
  },
  {
    id: 3,
    title: "Student Budget",
    short: "Budget",
    description: "Income, bills & expenses",
    icon: Wallet,
  },
] as const;

export default function BusinessBuilderWizard() {
  const [step, setStep] = useState(1);
  const [intro, setIntro] = useState<IntroFormData>(() => createEmptyIntroForm());
  const [visitedEstimate, setVisitedEstimate] = useState(false);
  const [visitedBudget, setVisitedBudget] = useState(false);

  useEffect(() => {
    document.title = "Calculate Your Estimate • iFuntology Teacher";
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (step === 2) setVisitedEstimate(true);
    if (step === 3) setVisitedBudget(true);
  }, [step]);

  const goNext = () => {
    if (step === 1) {
      const error = validateIntroForm(intro);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-7xl space-y-6 pb-10">
        <div>
          <Link
            to="/funtology-business-builder"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Business Builder
          </Link>

          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Calculate Your Estimate
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Complete all three steps — business profile, salon cost estimate,
            and student budget — in one flow.
          </p>
        </div>

        {/* Step indicator */}
        <Card className="rounded-2xl border border-border/60 p-4 shadow-sm sm:p-5">
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {STEPS.map((item, index) => {
              const Icon = item.icon;
              const active = step === item.id;
              const done = step > item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.id < step) setStep(item.id);
                      else if (item.id === step + 1) goNext();
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition",
                      active &&
                        "border-primary/40 bg-primary/5 shadow-sm",
                      done &&
                        !active &&
                        "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20",
                      !active &&
                        !done &&
                        "border-border/50 bg-muted/20 opacity-80"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                        active && "bg-primary text-primary-foreground",
                        done &&
                          !active &&
                          "bg-emerald-600 text-white",
                        !active &&
                          !done &&
                          "bg-muted text-muted-foreground"
                      )}
                    >
                      {done && !active ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Step {item.id}
                        {index < STEPS.length - 1 ? "" : ""}
                      </span>
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {item.title}
                      </span>
                      <span className="hidden text-[11px] text-muted-foreground sm:block">
                        {item.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </Card>

        {/* Intro summary chip when past step 1 */}
        {step > 1 && intro.businessName.trim() && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {intro.businessName}
            </span>
            <span>·</span>
            <span>{intro.name}</span>
            {intro.businessType && (
              <>
                <span>·</span>
                <span className="capitalize">
                  {intro.businessType.replace(/-/g, " ")}
                </span>
              </>
            )}
            {intro.budgetAmount && (
              <>
                <span>·</span>
                <span>
                  Budget $
                  {Number(intro.budgetAmount).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </>
            )}
            {intro.squareFootage && (
              <>
                <span>·</span>
                <span>{intro.squareFootage} sq ft</span>
              </>
            )}
          </div>
        )}

        {/* Step body — keep visited steps mounted so inputs persist */}
        <div>
          <div className={step === 1 ? "block" : "hidden"}>
            <IntroFormStep value={intro} onChange={setIntro} />
          </div>
          {visitedEstimate && (
            <div className={step === 2 ? "block" : "hidden"}>
              <EstimateCalculatorPage embedded />
            </div>
          )}
          {visitedBudget && (
            <div className={step === 3 ? "block" : "hidden"}>
              <StudentBudgetPage embedded />
            </div>
          )}
        </div>

        {/* Wizard navigation */}
        <Card className="sticky bottom-4 z-10 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/90">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Step {step} of {STEPS.length}
              {" · "}
              {STEPS[step - 1].title}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={goBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  type="button"
                  variant="brand"
                  className="w-full sm:w-auto"
                  onClick={goNext}
                >
                  {step === 1
                    ? "Continue to Estimate"
                    : "Continue to Student Budget"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="brand"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <Link to="/funtology-business-builder">
                    <Check className="h-4 w-4" />
                    Done
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </Card>
      </section>
    </DashboardWithSidebarLayout>
  );
}
