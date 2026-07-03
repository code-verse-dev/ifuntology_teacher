export const WTR_PDF_BASE = "https://erp.ifuntology.com/pdfs";

export function getWtrAssignmentPdfUrl(filename: string): string {
  if (import.meta.env.DEV) {
    return `/pdfs/${filename}`;
  }
  return `${WTR_PDF_BASE}/${filename}`;
}

const WTR_WEEKLY_ASSIGNMENT_FILES = [
  "iFuntology_Write_to_Read_Weekly_Assignments_3rd_to_5th_Descriptive.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_3rd_to_5th_Expository.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_3rd_to_5th_Journals_Diaries.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_3rd_to_5th_Letter_Writing.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_3rd_to_5th_Narrative.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_3rd_to_5th_Persuasive.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_3rd_to_5th_Poetry.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_6th_to_8th_Argumentative.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_6th_to_8th_Biographical_Essays.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_6th_to_8th_Book_Reviews.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_6th_to_8th_Creative_Writing.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_6th_to_8th_Speeches.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_9th_to_12th_Argumentative_Essays.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_9th_to_12th_Editorials.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_9th_to_12th_Literary_Analysis.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_9th_to_12th_Personal_Essays.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_9th_to_12th_Research_Papers.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_9th_to_12th_Synthesis_Essays.pdf",
  "iFuntology_Write_to_Read_Weekly_Assignments_9th_to_12th_Technical_Writing.pdf",
] as const;

export function formatWtrAssignmentName(filename: string): string {
  return filename.replace(/\.pdf$/i, "").replace(/_/g, " ");
}

export type WtrWeeklyAssignment = {
  id: string;
  url: string;
  filename: string;
  name: string;
};

export const WTR_WEEKLY_ASSIGNMENTS: WtrWeeklyAssignment[] =
  WTR_WEEKLY_ASSIGNMENT_FILES.map((filename) => ({
    id: filename,
    url: getWtrAssignmentPdfUrl(filename),
    filename,
    name: formatWtrAssignmentName(filename),
  }));

export async function downloadWtrAssignmentPdf(url: string, filename: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
