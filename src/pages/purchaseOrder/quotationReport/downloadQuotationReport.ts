import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { UPLOADS_URL } from "@/constants/api";

export type QuotationDownloadFormat = "pdf" | "jpeg";

async function loadImageAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Unable to load report logo");
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Unable to read report logo"));
    reader.readAsDataURL(blob);
  });
}

export async function resolveQuotationLogoSrc(): Promise<string> {
  return loadImageAsDataUrl(`${UPLOADS_URL}logo.png`);
}

function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));
  if (!images.length) return Promise.resolve();

  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  ).then(() => undefined);
}

export async function downloadQuotationReport(
  element: HTMLElement,
  fileName: string,
  format: QuotationDownloadFormat
): Promise<void> {
  await waitForImages(element);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  if (format === "jpeg") {
    const link = document.createElement("a");
    link.download = `${fileName}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
    return;
  }

  const imgData = canvas.toDataURL("image/png");
  const pdfWidth = 215.9;
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  const pdf = new jsPDF({
    orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
    unit: "mm",
    format: [pdfWidth, pdfHeight],
  });

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
  pdf.save(`${fileName}.pdf`);
}
