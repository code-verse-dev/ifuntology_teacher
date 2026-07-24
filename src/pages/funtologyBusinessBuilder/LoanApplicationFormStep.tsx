import type { ReactNode } from "react";
import { ClipboardList, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACCOUNT_TYPE_OPTIONS,
  CREDIT_PURPOSE_OPTIONS,
  type LoanApplicationData,
} from "./loanApplicationData";

type LoanApplicationFormStepProps = {
  value: LoanApplicationData;
  onChange: (next: LoanApplicationData) => void;
  /** When set, user arrived via “generate with loan” from step 2 or 3. */
  pendingPdfKind?: "estimate" | "budget" | null;
  onGeneratePdf?: () => void | Promise<void>;
  generatingPdf?: boolean;
};

function Field({
  id,
  label,
  children,
  className,
}: {
  id?: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ?? "space-y-1.5"}>
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border border-border/60 shadow-sm">
      <div className="border-b border-border/40 bg-muted/30 px-4 py-3 sm:px-5">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
        {children}
      </div>
    </Card>
  );
}

export default function LoanApplicationFormStep({
  value,
  onChange,
  pendingPdfKind = null,
  onGeneratePdf,
  generatingPdf = false,
}: LoanApplicationFormStepProps) {
  const setField = <K extends keyof LoanApplicationData>(
    field: K,
    next: LoanApplicationData[K]
  ) => {
    onChange({ ...value, [field]: next });
  };

  const awaitingPdf = Boolean(pendingPdfKind && onGeneratePdf);

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center gap-2 text-primary">
          <ClipboardList className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">
            Step 4 · {awaitingPdf ? "Required for PDF" : "Optional"}
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Loan Application Form
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {awaitingPdf
            ? `Fill out this loan application, then generate your ${
                pendingPdfKind === "estimate" ? "estimate" : "student budget"
              } PDF. Required fields must be completed before export.`
            : "Practice filling out a credit / loan application. This step is optional — you can skip it anytime."}
        </p>
      </div>

      {awaitingPdf ? (
        <Card className="rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                PDF ready after this form
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your{" "}
                {pendingPdfKind === "estimate"
                  ? "salon estimate"
                  : "student budget"}{" "}
                will be exported together with this loan application.
              </p>
            </div>
            <Button
              type="button"
              variant="brand"
              className="w-full shrink-0 sm:w-auto"
              disabled={generatingPdf}
              onClick={() => void onGeneratePdf?.()}
            >
              <FileDown className="h-4 w-4" />
              {generatingPdf
                ? "Generating…"
                : pendingPdfKind === "estimate"
                  ? "Generate Estimate PDF"
                  : "Generate Budget PDF"}
            </Button>
          </div>
        </Card>
      ) : null}

      <SectionCard title="Applicant Information">
        <Field id="loan-full-name" label="Full Name">
          <Input
            id="loan-full-name"
            className="h-11"
            value={value.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            placeholder="Full legal name"
          />
        </Field>
        <Field id="loan-dob" label="Date of Birth">
          <Input
            id="loan-dob"
            type="date"
            className="h-11"
            value={value.dateOfBirth}
            onChange={(e) => setField("dateOfBirth", e.target.value)}
          />
        </Field>
        <Field id="loan-address" label="Current Address" className="space-y-1.5 sm:col-span-2">
          <Input
            id="loan-address"
            className="h-11"
            value={value.currentAddress}
            onChange={(e) => setField("currentAddress", e.target.value)}
            placeholder="Street address"
          />
        </Field>
        <Field id="loan-city" label="City">
          <Input
            id="loan-city"
            className="h-11"
            value={value.city}
            onChange={(e) => setField("city", e.target.value)}
          />
        </Field>
        <Field id="loan-state" label="State">
          <Input
            id="loan-state"
            className="h-11"
            value={value.state}
            onChange={(e) => setField("state", e.target.value)}
          />
        </Field>
        <Field id="loan-zip" label="Zip Code">
          <Input
            id="loan-zip"
            className="h-11"
            value={value.zipCode}
            onChange={(e) => setField("zipCode", e.target.value)}
          />
        </Field>
        <Field id="loan-phone" label="Phone Number">
          <Input
            id="loan-phone"
            type="tel"
            className="h-11"
            value={value.phoneNumber}
            onChange={(e) => setField("phoneNumber", e.target.value)}
            placeholder="(555) 000-0000"
          />
        </Field>
        <Field id="loan-email" label="Email Address" className="space-y-1.5 sm:col-span-2">
          <Input
            id="loan-email"
            type="email"
            className="h-11"
            value={value.emailAddress}
            onChange={(e) => setField("emailAddress", e.target.value)}
            placeholder="name@email.com"
          />
        </Field>
      </SectionCard>

      <SectionCard title="Employment Information">
        <Field id="loan-employer" label="Current Employer">
          <Input
            id="loan-employer"
            className="h-11"
            value={value.currentEmployer}
            onChange={(e) => setField("currentEmployer", e.target.value)}
          />
        </Field>
        <Field id="loan-occupation" label="Occupation">
          <Input
            id="loan-occupation"
            className="h-11"
            value={value.occupation}
            onChange={(e) => setField("occupation", e.target.value)}
          />
        </Field>
        <Field
          id="loan-emp-address"
          label="Employment Address"
          className="space-y-1.5 sm:col-span-2"
        >
          <Input
            id="loan-emp-address"
            className="h-11"
            value={value.employmentAddress}
            onChange={(e) => setField("employmentAddress", e.target.value)}
          />
        </Field>
        <Field id="loan-emp-city" label="City">
          <Input
            id="loan-emp-city"
            className="h-11"
            value={value.employmentCity}
            onChange={(e) => setField("employmentCity", e.target.value)}
          />
        </Field>
        <Field id="loan-emp-state" label="State">
          <Input
            id="loan-emp-state"
            className="h-11"
            value={value.employmentState}
            onChange={(e) => setField("employmentState", e.target.value)}
          />
        </Field>
        <Field id="loan-emp-zip" label="Zip Code">
          <Input
            id="loan-emp-zip"
            className="h-11"
            value={value.employmentZipCode}
            onChange={(e) => setField("employmentZipCode", e.target.value)}
          />
        </Field>
        <Field id="loan-work-phone" label="Work Phone Number">
          <Input
            id="loan-work-phone"
            type="tel"
            className="h-11"
            value={value.workPhoneNumber}
            onChange={(e) => setField("workPhoneNumber", e.target.value)}
          />
        </Field>
        <Field id="loan-emp-length" label="Length of Employment" className="space-y-1.5 sm:col-span-2">
          <Input
            id="loan-emp-length"
            className="h-11"
            value={value.lengthOfEmployment}
            onChange={(e) => setField("lengthOfEmployment", e.target.value)}
            placeholder="e.g. 2 years, 6 months"
          />
        </Field>
      </SectionCard>

      <SectionCard title="Financial Information">
        <Field id="loan-gross" label="Gross Monthly Income">
          <Input
            id="loan-gross"
            type="number"
            min={0}
            step="0.01"
            className="h-11"
            value={value.grossMonthlyIncome}
            onChange={(e) => setField("grossMonthlyIncome", e.target.value)}
            placeholder="0.00"
          />
        </Field>
        <Field id="loan-other-income" label="Other Monthly Income (if any)">
          <Input
            id="loan-other-income"
            type="number"
            min={0}
            step="0.01"
            className="h-11"
            value={value.otherMonthlyIncome}
            onChange={(e) => setField("otherMonthlyIncome", e.target.value)}
            placeholder="0.00"
          />
        </Field>
        <Field id="loan-rent" label="Monthly Rent/Mortgage Payment">
          <Input
            id="loan-rent"
            type="number"
            min={0}
            step="0.01"
            className="h-11"
            value={value.monthlyRentMortgage}
            onChange={(e) => setField("monthlyRentMortgage", e.target.value)}
            placeholder="0.00"
          />
        </Field>
        <Field id="loan-debts" label="Outstanding Debts (if any)">
          <Input
            id="loan-debts"
            className="h-11"
            value={value.outstandingDebts}
            onChange={(e) => setField("outstandingDebts", e.target.value)}
            placeholder="Describe or enter amount"
          />
        </Field>
        <Field
          id="loan-cards"
          label="Credit Card(s) Held"
          className="space-y-1.5 sm:col-span-2"
        >
          <Input
            id="loan-cards"
            className="h-11"
            value={value.creditCardsHeld}
            onChange={(e) => setField("creditCardsHeld", e.target.value)}
            placeholder="e.g. Visa, Mastercard"
          />
        </Field>
      </SectionCard>

      <SectionCard title="Banking Information">
        <Field id="loan-bank" label="Name of Bank">
          <Input
            id="loan-bank"
            className="h-11"
            value={value.nameOfBank}
            onChange={(e) => setField("nameOfBank", e.target.value)}
          />
        </Field>
        <Field label="Account Type">
          <Select
            value={value.accountType || undefined}
            onValueChange={(next) => setField("accountType", next)}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field id="loan-account-number" label="Account Number">
          <Input
            id="loan-account-number"
            className="h-11"
            value={value.accountNumber}
            onChange={(e) => setField("accountNumber", e.target.value)}
            placeholder="Practice / mock number only"
          />
        </Field>
        <Field id="loan-bank-length" label="Length of Time with Bank">
          <Input
            id="loan-bank-length"
            className="h-11"
            value={value.lengthOfTimeWithBank}
            onChange={(e) => setField("lengthOfTimeWithBank", e.target.value)}
            placeholder="e.g. 3 years"
          />
        </Field>
      </SectionCard>

      <SectionCard
        title="References"
        description="Provide two personal or professional references."
      >
        <div className="space-y-4 sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Reference 1
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="loan-ref1-name" label="Reference Name">
              <Input
                id="loan-ref1-name"
                className="h-11"
                value={value.reference1Name}
                onChange={(e) => setField("reference1Name", e.target.value)}
              />
            </Field>
            <Field id="loan-ref1-rel" label="Relationship">
              <Input
                id="loan-ref1-rel"
                className="h-11"
                value={value.reference1Relationship}
                onChange={(e) =>
                  setField("reference1Relationship", e.target.value)
                }
              />
            </Field>
            <Field id="loan-ref1-phone" label="Phone Number">
              <Input
                id="loan-ref1-phone"
                type="tel"
                className="h-11"
                value={value.reference1Phone}
                onChange={(e) => setField("reference1Phone", e.target.value)}
              />
            </Field>
            <Field id="loan-ref1-address" label="Address">
              <Input
                id="loan-ref1-address"
                className="h-11"
                value={value.reference1Address}
                onChange={(e) => setField("reference1Address", e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-4 border-t border-border/40 pt-4 sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Reference 2
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="loan-ref2-name" label="Reference Name">
              <Input
                id="loan-ref2-name"
                className="h-11"
                value={value.reference2Name}
                onChange={(e) => setField("reference2Name", e.target.value)}
              />
            </Field>
            <Field id="loan-ref2-rel" label="Relationship">
              <Input
                id="loan-ref2-rel"
                className="h-11"
                value={value.reference2Relationship}
                onChange={(e) =>
                  setField("reference2Relationship", e.target.value)
                }
              />
            </Field>
            <Field id="loan-ref2-phone" label="Phone Number">
              <Input
                id="loan-ref2-phone"
                type="tel"
                className="h-11"
                value={value.reference2Phone}
                onChange={(e) => setField("reference2Phone", e.target.value)}
              />
            </Field>
            <Field id="loan-ref2-address" label="Address">
              <Input
                id="loan-ref2-address"
                className="h-11"
                value={value.reference2Address}
                onChange={(e) => setField("reference2Address", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Credit Information">
        <Field id="loan-credit-limit" label="Requested Credit Limit">
          <Input
            id="loan-credit-limit"
            type="number"
            min={0}
            step="0.01"
            className="h-11"
            value={value.requestedCreditLimit}
            onChange={(e) => setField("requestedCreditLimit", e.target.value)}
            placeholder="0.00"
          />
        </Field>
        <Field label="Purpose of Credit">
          <Select
            value={value.purposeOfCredit || undefined}
            onValueChange={(next) => setField("purposeOfCredit", next)}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="e.g. personal, business…" />
            </SelectTrigger>
            <SelectContent>
              {CREDIT_PURPOSE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </SectionCard>

      <Card className="overflow-hidden rounded-2xl border border-border/60 shadow-sm">
        <div className="border-b border-border/40 bg-muted/30 px-4 py-3 sm:px-5">
          <h3 className="text-sm font-bold text-foreground">
            Agreement and Authorization
          </h3>
        </div>
        <div className="space-y-4 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="loan-signature" label="Applicant's Signature">
              <Input
                id="loan-signature"
                className="h-11 font-serif italic"
                value={value.applicantSignature}
                onChange={(e) => setField("applicantSignature", e.target.value)}
                placeholder="Type full name as signature"
              />
            </Field>
            <Field id="loan-agree-date" label="Date">
              <Input
                id="loan-agree-date"
                type="date"
                className="h-11"
                value={value.agreementDate}
                onChange={(e) => setField("agreementDate", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Card>

      {awaitingPdf ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="brand"
            className="w-full sm:w-auto"
            disabled={generatingPdf}
            onClick={() => void onGeneratePdf?.()}
          >
            <FileDown className="h-4 w-4" />
            {generatingPdf
              ? "Generating…"
              : pendingPdfKind === "estimate"
                ? "Generate Estimate PDF"
                : "Generate Budget PDF"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
