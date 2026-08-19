import { forwardRef } from "react";
import type { QuotationReportData } from "./types";
import { formatCurrency } from "./buildQuotationReportData";

const MINT = "#d9ead3";
const BLUE = "#2b78c5";
const BORDER = "#b7b7b7";
const MIN_BODY_ROWS = 16;

type Props = {
  data: QuotationReportData;
  logoSrc: string;
};

const QuotationReportTemplate = forwardRef<HTMLDivElement, Props>(
  function QuotationReportTemplate({ data, logoSrc }, ref) {
    const emptyRowCount = Math.max(0, MIN_BODY_ROWS - data.lineItems.length);

    return (
      <div
        ref={ref}
        style={{
          width: 816,
          background: "#ffffff",
          color: "#000000",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 11,
          lineHeight: 1.35,
          padding: "24px 28px 32px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <img
            src={logoSrc}
            alt="iFuntology"
            style={{ width: 150, height: "auto", objectFit: "contain" }}
            crossOrigin="anonymous"
          />
          <div style={{ flex: 1, textAlign: "center", paddingTop: 8 }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              Funtology Fundamentals/iFuntology
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                fontWeight: 700,
                color: BLUE,
                textTransform: "uppercase",
              }}
            >
              Free 3-Hr Virtual Training and Access to 30-Minute Bookings
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            borderBottom: `1px solid ${BORDER}`,
          }}
        />

        {/* Date / invoice + recipient */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginTop: 16,
          }}
        >
          <div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 700 }}>DATE:</span> {data.date}
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontWeight: 700 }}>Quote #/Invoice #:</span>{" "}
              {data.invoiceNumber}
            </div>
            <div>Make All Checks Payable To:</div>
            <div>Funtology-Healing Strands</div>
            <div style={{ marginTop: 8 }}>
              Mail To: P.O. Box 5481, Augusta, Georgia 30916
            </div>
            <div style={{ marginTop: 8 }}>
              Direct All Inquires To:{" "}
              <span style={{ color: BLUE }}>info@iFuntology.com</span>
            </div>
            <div>678.576.2021</div>
            <div>iFuntology.com</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>TO:</div>
            <div>{data.recipient.organizationName}</div>
            {data.recipient.addressLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
            <div style={{ color: BLUE }}>{data.recipient.email}</div>
            <div>{data.recipient.phone}</div>
            <div style={{ marginTop: 10, maxWidth: 320 }}>
              All Physical Kits Will Receive The Learning Management Portal and
              the iFuntology: Write to Read Book IT Program
            </div>
          </div>
        </div>

        {/* Sales bar */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 18,
            fontSize: 10,
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: `1px solid ${BORDER}`,
                  background: MINT,
                  padding: "6px 8px",
                  width: "25%",
                  verticalAlign: "top",
                }}
              >
                <div style={{ fontWeight: 700 }}>SALESPERSON</div>
                <div>TeQuilla@iFuntology.com</div>
              </td>
              <td
                style={{
                  border: `1px solid ${BORDER}`,
                  background: MINT,
                  padding: "6px 8px",
                  width: "35%",
                  verticalAlign: "top",
                }}
              >
                <div style={{ fontWeight: 700 }}>TAX EXEMPTION STATUS</div>
                <div>Please advise (EXEMPTION)</div>
                <div style={{ textAlign: "center", marginTop: 8, fontWeight: 700 }}>
                  QUOTE EXPIRES: {data.quoteExpires}
                </div>
              </td>
              <td
                style={{
                  border: `1px solid ${BORDER}`,
                  background: MINT,
                  padding: "6px 8px",
                  width: "25%",
                  verticalAlign: "top",
                }}
              >
                <div style={{ fontWeight: 700 }}>P.O. #</div>
                <div>{data.poNumber}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Items table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 0,
            fontSize: 11,
          }}
        >
          <thead>
            <tr>
              {["QTY", "DESCRIPTION", "UNIT PRICE", "LINE TOTAL"].map(
                (heading, idx) => (
                  <th
                    key={heading}
                    style={{
                      border: `1px solid ${BORDER}`,
                      background: MINT,
                      padding: "8px 10px",
                      textAlign: idx === 0 ? "center" : idx >= 2 ? "right" : "left",
                      width:
                        idx === 0 ? "10%" : idx === 1 ? "50%" : "20%",
                      fontWeight: 700,
                    }}
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {data.lineItems.map((item, index) => (
              <tr key={`${item.title}-${index}`}>
                <td
                  style={{
                    border: `1px solid ${BORDER}`,
                    padding: "8px 10px",
                    textAlign: "center",
                    verticalAlign: "top",
                  }}
                >
                  {item.qty}
                </td>
                <td
                  style={{
                    border: `1px solid ${BORDER}`,
                    padding: "8px 10px",
                    verticalAlign: "top",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{item.title}</div>
                  {item.subtitle ? <div>{item.subtitle}</div> : null}
                </td>
                <td
                  style={{
                    border: `1px solid ${BORDER}`,
                    padding: "8px 10px",
                    textAlign: "right",
                    verticalAlign: "top",
                  }}
                >
                  {item.unitPrice != null ? formatCurrency(item.unitPrice) : ""}
                </td>
                <td
                  style={{
                    border: `1px solid ${BORDER}`,
                    padding: "8px 10px",
                    textAlign: "right",
                    verticalAlign: "top",
                  }}
                >
                  {item.lineTotal != null ? formatCurrency(item.lineTotal) : ""}
                </td>
              </tr>
            ))}
            {Array.from({ length: emptyRowCount }).map((_, index) => (
              <tr key={`empty-${index}`}>
                <td style={{ border: `1px solid ${BORDER}`, height: 28 }} />
                <td style={{ border: `1px solid ${BORDER}` }} />
                <td style={{ border: `1px solid ${BORDER}` }} />
                <td style={{ border: `1px solid ${BORDER}` }} />
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 0,
          }}
        >
          <table
            style={{
              width: 320,
              borderCollapse: "collapse",
              fontSize: 11,
            }}
          >
            <tbody>
              {[
                { label: "SUBTOTAL", value: data.subtotal },
                { label: "SHIPPING", value: data.shipping },
                { label: "TAX", value: data.tax },
                { label: "TOTAL", value: data.total, bold: true },
              ].map((row) => (
                <tr key={row.label}>
                  <td
                    style={{
                      border: `1px solid ${BORDER}`,
                      padding: "8px 12px",
                      fontWeight: row.bold ? 700 : 400,
                      width: "55%",
                    }}
                  >
                    {row.label}
                  </td>
                  <td
                    style={{
                      border: `1px solid ${BORDER}`,
                      background: MINT,
                      padding: "8px 12px",
                      textAlign: "right",
                      fontWeight: row.bold ? 700 : 400,
                      width: "45%",
                    }}
                  >
                    {formatCurrency(row.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

export default QuotationReportTemplate;
