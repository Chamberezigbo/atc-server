export function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// pdfkit's built-in fonts only support Latin-1 (WinAnsiEncoding) — the
// ₦ glyph (U+20A6) renders as a broken box/bar. Confirmed by generating
// a test PDF: "₦12,000.00" came out garbled, "NGN 12,000.00" did not.
// Embedding a custom Unicode font would fix it but adds a bundled font
// asset for one symbol — not worth it. Use this instead of formatNaira()
// anywhere text goes into a pdfkit document.
export function formatNairaForPdf(amount) {
  return `NGN ${Number(amount).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
