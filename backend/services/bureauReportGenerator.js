/**
 * CIBIL & CRIF High Mark XML/Format Credit Bureau Report Generator
 * Generates RBI-compliant Stage 4 Default Transmission Payload for NPAs (90+ DPD).
 */

function generateCibilDefaultXml({
  borrowerId,
  borrowerName,
  gstin,
  loanId,
  sanctionAmount,
  outstandingPrincipal,
  dpd,
  classifiedDate
}) {
  const timestamp = new Date().toISOString();
  const segmentId = `CIBIL-P2P-${Date.now()}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<INProfileResponse xmlns="http://www.cibil.com/xml/2023/P2P" version="2.0">
  <Header>
    <SegmentIdentifier>${segmentId}</SegmentIdentifier>
    <MemberId>PEERPULSE-NBFC-P2P-IND</MemberId>
    <ReportDate>${timestamp}</ReportDate>
    <ProductCode>P2P_MSME_UNSECURED</ProductCode>
  </Header>
  <ConsumerSubject>
    <SubjectIdentifier>${borrowerId}</SubjectIdentifier>
    <LegalName>${borrowerName}</LegalName>
    <TaxIdentifier type="GSTIN">${gstin || 'UNREGISTERED'}</TaxIdentifier>
    <PlatformTrustScore>0</PlatformTrustScore>
  </ConsumerSubject>
  <AccountDetails>
    <AccountNumber>${loanId}</AccountNumber>
    <AccountType>P2P_FRACTIONAL_POOL</AccountType>
    <OwnershipIndicator>INDIVIDUAL_MSME</OwnershipIndicator>
    <SanctionedAmount currency="INR">${sanctionAmount}</SanctionedAmount>
    <CurrentBalance currency="INR">${outstandingPrincipal}</CurrentBalance>
    <OverdueAmount currency="INR">${outstandingPrincipal}</OverdueAmount>
    <DaysPastDue>${dpd}</DaysPastDue>
    <AssetClassification status="SUB_STANDARD_NPA">
      <ClassificationDate>${classifiedDate || timestamp}</ClassificationDate>
      <ReasonCode>90_DPD_NON_PAYMENT</ReasonCode>
    </AssetClassification>
    <DLGClaimSettlementStatus>NOT_APPLICABLE_RBI_0_PCT_DLG</DLGClaimSettlementStatus>
  </AccountDetails>
</INProfileResponse>`;
}

module.exports = {
  generateCibilDefaultXml
};
