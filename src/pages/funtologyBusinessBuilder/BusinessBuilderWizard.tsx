import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calculator,
  Check,
  ClipboardList,
  FileDown,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import IntroFormStep from "./IntroFormStep";
import EstimateCalculatorPage from "./EstimateCalculatorPage";
import StudentBudgetPage from "./StudentBudgetPage";
import LoanApplicationFormStep from "./LoanApplicationFormStep";
import {
  createEmptyIntroForm,
  validateIntroForm,
  type IntroFormData,
} from "./introFormData";
import {
  createEmptyLoanApplication,
  validateLoanApplication,
  type LoanApplicationData,
} from "./loanApplicationData";
import {
  generateEstimatePdf,
  type PdfEstimateInput,
} from "./generateEstimatePdf";
import { generateStudentBudgetPdf } from "./generateStudentBudgetPdf";
import type { StudentBudgetInput } from "./studentBudgetData";

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
  {
    id: 4,
    title: "Loan Application",
    short: "Loan",
    description: "Optional practice form",
    icon: ClipboardList,
    optional: true,
  },
] as const;

const TOTAL_STEPS = STEPS.length;

type PendingPdfIntent =
  | {
      kind: "estimate";
      payload: Omit<PdfEstimateInput, "intro" | "loan">;
    }
  | {
      kind: "budget";
      payload: StudentBudgetInput;
    };

export default function BusinessBuilderWizard() {
  const [step, setStep] = useState(1);
  const [intro, setIntro] = useState<IntroFormData>(() => createEmptyIntroForm());
  const [loan, setLoan] = useState<LoanApplicationData>(() =>
    createEmptyLoanApplication()
  );
  const [visitedEstimate, setVisitedEstimate] = useState(false);
  const [visitedBudget, setVisitedBudget] = useState(false);
  const [visitedLoan, setVisitedLoan] = useState(false);
  const [pendingPdf, setPendingPdf] = useState<PendingPdfIntent | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    document.title = "Calculate Your Estimate • iFuntology Teacher";
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (step === 2) setVisitedEstimate(true);
    if (step === 3) setVisitedBudget(true);
    if (step === 4) setVisitedLoan(true);
  }, [step]);

  const goNext = () => {
    if (step === 1) {
      const error = validateIntroForm(intro);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const goBack = () => {
    if (step === 4 && pendingPdf?.kind === "estimate") {
      setStep(2);
      return;
    }
    if (step === 4 && pendingPdf?.kind === "budget") {
      setStep(3);
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  };

  const goToLoanForPdf = (intent: PendingPdfIntent) => {
    setPendingPdf(intent);
    setVisitedLoan(true);
    setStep(4);
    toast.message("Complete the loan application to generate your PDF.");
  };

  const clearPendingPdf = () => setPendingPdf(null);

  const handleGeneratePdfWithLoan = async () => {
    if (!pendingPdf) return;
    const error = validateLoanApplication(loan);
    if (error) {
      toast.error(error);
      return;
    }
    setGeneratingPdf(true);
    try {
      if (pendingPdf.kind === "estimate") {
        await generateEstimatePdf({
          ...pendingPdf.payload,
          intro,
          loan,
        });
        toast.success("Estimate report with loan application exported.");
      } else {
        await generateStudentBudgetPdf({
          ...pendingPdf.payload,
          intro,
          loan,
        });
        toast.success("Student budget PDF with loan application downloaded.");
      }
      clearPendingPdf();
    } catch {
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

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
            Complete your business profile, salon cost estimate, and student
            budget. A loan application practice form is available as an optional
            fourth step.
          </p>
        </div>

        {/* Step indicator */}
        <Card className="rounded-2xl border border-border/60 p-4 shadow-sm sm:p-5">
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item) => {
              const Icon = item.icon;
              const active = step === item.id;
              const done = step > item.id;
              const optional = "optional" in item && item.optional;
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
                        {optional ? " · Optional" : ""}
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
              <EstimateCalculatorPage
                embedded
                intro={intro}
                onGenerateWithLoan={(payload) =>
                  goToLoanForPdf({ kind: "estimate", payload })
                }
              />
            </div>
          )}
          {visitedBudget && (
            <div className={step === 3 ? "block" : "hidden"}>
              <StudentBudgetPage
                embedded
                intro={intro}
                onGenerateWithLoan={(payload) =>
                  goToLoanForPdf({ kind: "budget", payload })
                }
              />
            </div>
          )}
          {visitedLoan && (
            <div className={step === 4 ? "block" : "hidden"}>
              <LoanApplicationFormStep
                value={loan}
                onChange={setLoan}
                pendingPdfKind={pendingPdf?.kind ?? null}
                onGeneratePdf={
                  pendingPdf ? handleGeneratePdfWithLoan : undefined
                }
                generatingPdf={generatingPdf}
              />
            </div>
          )}
        </div>

        {/* Wizard navigation */}
        <Card className="sticky bottom-4 z-10 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/90">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Step {step} of {TOTAL_STEPS}
              {" · "}
              {STEPS[step - 1].title}
              {step === 4 ? " (optional)" : ""}
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
              {step === 3 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    asChild
                  >
                    <Link
                      to="/funtology-business-builder"
                      onClick={clearPendingPdf}
                    >
                      Skip & Finish
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="brand"
                    className="w-full sm:w-auto"
                    onClick={goNext}
                  >
                    Continue to Loan Form
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              {step < 3 && (
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
              )}
              {step === 4 && pendingPdf && (
                <Button
                  type="button"
                  variant="brand"
                  className="w-full sm:w-auto"
                  disabled={generatingPdf}
                  onClick={handleGeneratePdfWithLoan}
                >
                  <FileDown className="h-4 w-4" />
                  {generatingPdf
                    ? "Generating…"
                    : pendingPdf.kind === "estimate"
                      ? "Generate Estimate PDF"
                      : "Generate Budget PDF"}
                </Button>
              )}
              {step === 4 && (
                <Button
                  type="button"
                  variant={pendingPdf ? "outline" : "brand"}
                  className="w-full sm:w-auto"
                  asChild
                >
                  <Link
                    to="/funtology-business-builder"
                    onClick={clearPendingPdf}
                  >
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
