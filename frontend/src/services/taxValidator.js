/**
 * Indian Tax Identification & Compliance Verification Engine
 * Luhn Modulo-36 algorithm for GSTIN and PAN structure parser
 */

const ALPHANUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Validates GSTIN using official Luhn Modulo-36 algorithm
 * Pattern: 2 digits (State) + 10 chars (PAN) + 1 digit (Entity) + 'Z' + 1 Check Digit
 */
export function validateGSTIN(gstin) {
  if (!gstin || typeof gstin !== 'string') {
    return { valid: false, reason: 'GSTIN is required' };
  }

  const clean = gstin.trim().toUpperCase();
  if (clean.length !== 15) {
    return { valid: false, reason: 'GSTIN must be exactly 15 characters' };
  }

  const formatRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!formatRegex.test(clean)) {
    return { valid: false, reason: 'Invalid GSTIN format (State + PAN + Entity + Z + Checksum)' };
  }

  // Modulo-36 Luhn Checksum validation
  let factor = 2;
  let sum = 0;
  const checkChar = clean.charAt(14);
  const dataChars = clean.substring(0, 14);

  for (let i = dataChars.length - 1; i >= 0; i--) {
    const codePoint = ALPHANUM.indexOf(dataChars.charAt(i));
    let addend = factor * codePoint;
    factor = factor === 2 ? 1 : 2;
    addend = Math.floor(addend / 36) + (addend % 36);
    sum += addend;
  }

  const remainder = sum % 36;
  const checkCodePoint = (36 - remainder) % 36;
  const calculatedChar = ALPHANUM.charAt(checkCodePoint);

  const stateCode = clean.substring(0, 2);
  const pan = clean.substring(2, 12);
  const panInfo = validatePAN(pan);

  const isChecksumMatch = calculatedChar === checkChar;

  return {
    valid: isChecksumMatch,
    gstin: clean,
    stateCode,
    pan,
    entityType: panInfo.entityType,
    calculatedChecksum: calculatedChar,
    providedChecksum: checkChar,
    reason: isChecksumMatch ? 'Valid GSTIN Checksum (Luhn Mod-36)' : `Checksum mismatch (expected ${calculatedChar}, found ${checkChar})`
  };
}

/**
 * Validates Indian PAN and extracts entity type
 * 4th character determines legal nature
 */
export function validatePAN(pan) {
  if (!pan || typeof pan !== 'string') {
    return { valid: false, reason: 'PAN is required' };
  }

  const clean = pan.trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  if (!panRegex.test(clean)) {
    return { valid: false, reason: 'PAN must match format ABCDE1234F' };
  }

  const entityChar = clean.charAt(3);
  const ENTITY_MAP = {
    'C': 'Company (Pvt Ltd / Public)',
    'P': 'Individual (Proprietorship)',
    'H': 'Hindu Undivided Family (HUF)',
    'F': 'Partnership Firm / LLP',
    'A': 'Association of Persons (AOP)',
    'T': 'Trust',
    'B': 'Body of Individuals (BOI)',
    'L': 'Local Authority',
    'J': 'Artificial Juridical Person',
    'G': 'Government Agency'
  };

  return {
    valid: true,
    pan: clean,
    entityCode: entityChar,
    entityType: ENTITY_MAP[entityChar] || 'Business Entity',
    isCorporate: ['C', 'F', 'T'].includes(entityChar)
  };
}
