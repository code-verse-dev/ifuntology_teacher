import { useEffect, useRef, useState } from "react";
import { Download, FileImage, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import QuotationReportTemplate from "./QuotationReportTemplate";
import { buildQuotationReportData } from "./buildQuotationReportData";
import {
  downloadQuotationReport,
  resolveQuotationLogoSrc,
} from "./downloadQuotationReport";

type Props = {
  purchaseOrder: any;
  disabled?: boolean;
};

export default function QuotationReportDownload({
  purchaseOrder,
  disabled,
}: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const reportData = buildQuotationReportData(purchaseOrder);

  useEffect(() => {
    if (!reportData) return;
    let cancelled = false;

    resolveQuotationLogoSrc()
      .then((src) => {
        if (!cancelled) setLogoSrc(src);
      })
      .catch(() => {
        if (!cancelled) setLogoError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [reportData?.invoiceNumber]);

  const handleDownload = async (format: "pdf" | "jpeg") => {
    if (!reportData || !reportRef.current || !logoSrc) {
      toast.error("Quotation report is not ready yet.");
      return;
    }

    try {
      setIsDownloading(true);
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await downloadQuotationReport(
        reportRef.current,
        `quotation-${reportData.invoiceNumber}`,
        format
      );
      toast.success(
        format === "pdf"
          ? "Quotation PDF downloaded."
          : "Quotation image downloaded."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to download quotation report."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (!reportData) return null;

  const isReady = Boolean(logoSrc) && !logoError;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" disabled={disabled || isDownloading || !isReady}>
            {isDownloading || !isReady ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download Quotation
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={!isReady || isDownloading}
            onClick={() => handleDownload("pdf")}
            className="cursor-pointer"
          >
            <FileText className="mr-2 h-4 w-4" />
            Download PDF
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!isReady || isDownloading}
            onClick={() => handleDownload("jpeg")}
            className="cursor-pointer"
          >
            <FileImage className="mr-2 h-4 w-4" />
            Download Image (JPG)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {logoError ? (
        <span className="sr-only">Quotation logo failed to load.</span>
      ) : null}

      {logoSrc ? (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: -10000,
            top: 0,
            pointerEvents: "none",
          }}
        >
          <QuotationReportTemplate
            ref={reportRef}
            data={reportData}
            logoSrc={logoSrc}
          />
        </div>
      ) : null}
    </>
  );
}
