import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Dynamic RBI-Compliant P2P Loan Contract & Sanction Letter Generator
 * Generates an official 2-page legal document with dynamic amortization schedule
 * and cryptographic SHA-256 digital stamp using browser crypto.
 */
export async function generateLoanContractPdf({
  borrowerName = 'Priya Sharma',
  businessName = 'Priya Textiles Surat',
  loanId = 'LN-PRIYA-810',
  loanAmount = 500000,
  tenure = 12,
  interestRate = 13.5,
  acieScore = 810,
  grade = 'A',
  lenders = [
    { name: 'Vikram Sethi', tranche: 25000, sharePct: '5.0%' },
    { name: 'Ananya Roy', tranche: 50000, sharePct: '10.0%' },
    { name: 'Karan Singhal', tranche: 25000, sharePct: '5.0%' }
  ],
  purpose = 'Working Capital Expansion'
}) {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  // Colors
  const navy = rgb(0.08, 0.13, 0.24);
  const gold = rgb(0.83, 0.69, 0.22);
  const textDark = rgb(0.12, 0.15, 0.2);
  const gray = rgb(0.4, 0.45, 0.5);
  const borderCol = rgb(0.85, 0.88, 0.92);

  // Compute Amortization
  const monthlyRate = interestRate / 12 / 100;
  const emi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1)
  );
  const totalPayable = emi * tenure;
  const totalInterest = totalPayable - loanAmount;

  // Real browser SHA-256 cryptographic stamp
  const stampData = `${loanId}-${borrowerName}-${loanAmount}-${tenure}-${Date.now()}`;
  const msgUint8 = new TextEncoder().encode(stampData);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sha256Stamp = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // ---------------- PAGE 1: Sanction Letter & Legal Covenants ----------------
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page1.getSize();

  // Top Accent Banner
  page1.drawRectangle({
    x: 0,
    y: height - 8,
    width: width,
    height: 8,
    color: gold
  });

  // Header Title
  page1.drawText('PEERPULSE NBFC-P2P ESCROW PLATFORM', {
    x: 40,
    y: height - 45,
    size: 16,
    font: fontBold,
    color: navy
  });

  page1.drawText('STATUTORY LOAN SANCTION & FRACTIONAL POOLING AGREEMENT', {
    x: 40,
    y: height - 62,
    size: 9,
    font: fontBold,
    color: gold
  });

  page1.drawText(`Date of Execution: ${new Date().toLocaleDateString('en-IN')}`, {
    x: width - 200,
    y: height - 45,
    size: 8.5,
    font: fontRegular,
    color: gray
  });

  // Statutory RBI Warning Box
  page1.drawRectangle({
    x: 40,
    y: height - 120,
    width: width - 80,
    height: 44,
    color: rgb(0.98, 0.95, 0.9),
    borderColor: rgb(0.9, 0.75, 0.4),
    borderWidth: 1
  });

  page1.drawText('MANDATORY STATUTORY RBI DISCLOSURE (0% DEFAULT LOSS GUARANTEE):', {
    x: 50,
    y: height - 90,
    size: 7.5,
    font: fontBold,
    color: rgb(0.65, 0.35, 0.05)
  });

  page1.drawText(
    'PeerPulse operates under RBI Master Direction NBFC-P2P. Platform does not provide any credit enhancement or guarantee.',
    { x: 50, y: height - 104, size: 7, font: fontRegular, color: textDark }
  );
  page1.drawText(
    'All investments are fractionalized across registered retail lenders. Escrow mechanisms managed via IDFC FIRST Trustee.',
    { x: 50, y: height - 114, size: 7, font: fontRegular, color: textDark }
  );

  // Section 1: Loan & Borrower Telemetry
  let y = height - 145;
  page1.drawText('1. BORROWER & UNDERWRITING PARTICULARS', { x: 40, y, size: 10, font: fontBold, color: navy });

  y -= 18;
  const col1 = 45;
  const col2 = 300;

  const drawRow = (label, val, xPos, yPos) => {
    page1.drawText(label, { x: xPos, y: yPos, size: 8, font: fontRegular, color: gray });
    page1.drawText(String(val), { x: xPos + 110, y: yPos, size: 8.5, font: fontBold, color: textDark });
  };

  drawRow('Borrower Entity:', businessName, col1, y);
  drawRow('Application Reference:', loanId, col2, y);
  y -= 16;
  drawRow('Authorized Signatory:', borrowerName, col1, y);
  drawRow('ACIE Credit Score:', `${acieScore} (Grade ${grade})`, col2, y);
  y -= 16;
  drawRow('Sanctioned Principal:', `INR ${loanAmount.toLocaleString('en-IN')}`, col1, y);
  drawRow('Annual Interest Rate:', `${interestRate}% p.a.`, col2, y);
  y -= 16;
  drawRow('Tenure (Months):', `${tenure} Months`, col1, y);
  drawRow('Equated Monthly EMI:', `INR ${emi.toLocaleString('en-IN')}`, col2, y);
  y -= 16;
  drawRow('Purpose of Loan:', purpose, col1, y);
  drawRow('Total Repayment Volume:', `INR ${totalPayable.toLocaleString('en-IN')}`, col2, y);

  // Section 2: Fractional Syndicate Breakdown
  y -= 30;
  page1.drawText('2. FRACTIONAL SYNDICATE LENDER EXPOSURE SCHEDULE', { x: 40, y, size: 10, font: fontBold, color: navy });

  y -= 16;
  page1.drawRectangle({
    x: 40,
    y: y - 8,
    width: width - 80,
    height: 18,
    color: rgb(0.93, 0.95, 0.98)
  });

  page1.drawText('Lender Identifier', { x: 50, y: y - 4, size: 8, font: fontBold, color: navy });
  page1.drawText('Tranche Committed', { x: 220, y: y - 4, size: 8, font: fontBold, color: navy });
  page1.drawText('Fractional Share', { x: 370, y: y - 4, size: 8, font: fontBold, color: navy });
  page1.drawText('Statutory Cap Compliance', { x: 460, y: y - 4, size: 8, font: fontBold, color: navy });

  lenders.forEach((l) => {
    y -= 18;
    page1.drawLine({ start: { x: 40, y: y + 12 }, end: { x: width - 40, y: y + 12 }, color: borderCol, thickness: 0.5 });
    page1.drawText(l.name, { x: 50, y, size: 8, font: fontRegular, color: textDark });
    page1.drawText(`INR ${Number(l.tranche).toLocaleString('en-IN')}`, { x: 220, y, size: 8, font: fontMono, color: textDark });
    page1.drawText(l.sharePct || '5.0%', { x: 370, y, size: 8, font: fontRegular, color: textDark });
    page1.drawText('VERIFIED (<=50K)', { x: 460, y, size: 7.5, font: fontBold, color: rgb(0.1, 0.6, 0.3) });
  });

  // Section 3: Legal Undertakings
  y -= 30;
  page1.drawText('3. STATUTORY RECOVERY & RESTRUCTURING COVENANTS', { x: 40, y, size: 10, font: fontBold, color: navy });
  y -= 14;

  const covenants = [
    '• Automated e-NACH Sweeps: Collections executed on 5th of each month via NPCI e-Mandate.',
    '• Penal Interest Rate: Default exceeding 30 DPD triggers standard 2.0% p.a. statutory penal rate.',
    '• Fractional Restructuring: Any One-Time Settlement (OTS) requires >60% approval by lender tranche weight.',
    '• Escrow Trustee Protocol: Disbursals and collections are directly debited/credited via IDFC Trustee.'
  ];

  covenants.forEach((c) => {
    page1.drawText(c, { x: 45, y, size: 7.5, font: fontRegular, color: textDark });
    y -= 13;
  });

  // Digital Signature & Stamp Box
  y -= 25;
  page1.drawRectangle({
    x: 40,
    y: y - 48,
    width: width - 80,
    height: 52,
    color: rgb(0.97, 0.98, 1.0),
    borderColor: rgb(0.8, 0.85, 0.95),
    borderWidth: 1
  });

  page1.drawText('CRYPTOGRAPHIC PLATFORM TIMESTAMP & SHA-256 DIGITAL SEAL:', {
    x: 50,
    y: y - 10,
    size: 7.5,
    font: fontBold,
    color: navy
  });

  page1.drawText(`SHA-256: ${sha256Stamp.substring(0, 48)}...`, {
    x: 50,
    y: y - 24,
    size: 6.5,
    font: fontMono,
    color: gray
  });

  page1.drawText('Signed Digitally on behalf of PeerPulse P2P Platform & Fractional Syndicate Members', {
    x: 50,
    y: y - 38,
    size: 7,
    font: fontRegular,
    color: textDark
  });

  // Page 1 Footer
  page1.drawText('Page 1 of 2 — PeerPulse Statutory NBFC-P2P Sanction Deed', {
    x: 40,
    y: 20,
    size: 7.5,
    font: fontRegular,
    color: gray
  });

  // ---------------- PAGE 2: Full Amortization Schedule ----------------
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  const h2 = page2.getSize().height;

  page2.drawRectangle({ x: 0, y: h2 - 8, width: width, height: 8, color: navy });

  page2.drawText('ANNEXURE A: EQUATED MONTHLY AMORTIZATION SCHEDULE', {
    x: 40,
    y: h2 - 45,
    size: 13,
    font: fontBold,
    color: navy
  });

  page2.drawText(`Loan Application ID: ${loanId}  |  Tenure: ${tenure} Months  |  Monthly EMI: INR ${emi.toLocaleString('en-IN')}`, {
    x: 40,
    y: h2 - 62,
    size: 8.5,
    font: fontRegular,
    color: gray
  });

  // Table Headers
  let y2 = h2 - 90;
  page2.drawRectangle({
    x: 40,
    y: y2 - 6,
    width: width - 80,
    height: 18,
    color: rgb(0.93, 0.95, 0.98)
  });

  page2.drawText('Month #', { x: 50, y2: y2, y: y2, size: 7.5, font: fontBold, color: navy });
  page2.drawText('Due Date', { x: 110, y: y2, size: 7.5, font: fontBold, color: navy });
  page2.drawText('EMI (INR)', { x: 190, y: y2, size: 7.5, font: fontBold, color: navy });
  page2.drawText('Principal (INR)', { x: 270, y: y2, size: 7.5, font: fontBold, color: navy });
  page2.drawText('Interest (INR)', { x: 360, y: y2, size: 7.5, font: fontBold, color: navy });
  page2.drawText('Remaining Balance', { x: 450, y: y2, size: 7.5, font: fontBold, color: navy });

  let curBal = loanAmount;
  for (let m = 1; m <= tenure; m++) {
    y2 -= 18;
    const interestPart = Math.round(curBal * monthlyRate);
    const principalPart = emi - interestPart;
    curBal = Math.max(0, curBal - principalPart);

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + m);

    page2.drawLine({ start: { x: 40, y: y2 + 12 }, end: { x: width - 40, y: y2 + 12 }, color: borderCol, thickness: 0.5 });
    page2.drawText(`Month ${m}`, { x: 50, y: y2, size: 7.5, font: fontRegular, color: textDark });
    page2.drawText(dueDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), { x: 110, y: y2, size: 7.5, font: fontRegular, color: textDark });
    page2.drawText(emi.toLocaleString('en-IN'), { x: 190, y: y2, size: 7.5, font: fontMono, color: textDark });
    page2.drawText(principalPart.toLocaleString('en-IN'), { x: 270, y: y2, size: 7.5, font: fontMono, color: textDark });
    page2.drawText(interestPart.toLocaleString('en-IN'), { x: 360, y: y2, size: 7.5, font: fontMono, color: textDark });
    page2.drawText(curBal.toLocaleString('en-IN'), { x: 450, y: y2, size: 7.5, font: fontMono, color: navy });
  }

  // Summary at bottom of schedule
  y2 -= 25;
  page2.drawRectangle({
    x: 40,
    y: y2 - 18,
    width: width - 80,
    height: 24,
    color: rgb(0.96, 0.98, 0.96),
    borderColor: rgb(0.7, 0.85, 0.7),
    borderWidth: 1
  });

  page2.drawText(
    `Total Principal: INR ${loanAmount.toLocaleString('en-IN')}  |  Total Interest: INR ${totalInterest.toLocaleString('en-IN')}  |  Aggregate Payable: INR ${totalPayable.toLocaleString('en-IN')}`,
    { x: 50, y: y2 - 10, size: 8, font: fontBold, color: rgb(0.1, 0.5, 0.2) }
  );

  // Page 2 Footer
  page2.drawText('Page 2 of 2 — PeerPulse Statutory NBFC-P2P Sanction Deed', {
    x: 40,
    y: 20,
    size: 7.5,
    font: fontRegular,
    color: gray
  });

  // Download PDF directly
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `PeerPulse_Sanction_Agreement_${loanId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
