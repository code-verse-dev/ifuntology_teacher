export type QuotationLineItem = {
  qty: number | string;
  title: string;
  subtitle?: string;
  unitPrice: number | null;
  lineTotal: number | null;
};

export type QuotationReportData = {
  date: string;
  invoiceNumber: string;
  quoteExpires: string;
  poNumber: string;
  recipient: {
    organizationName: string;
    addressLines: string[];
    email: string;
    phone: string;
  };
  lineItems: QuotationLineItem[];
  subtotal: number;
  shipping: number;
  total: number;
};
