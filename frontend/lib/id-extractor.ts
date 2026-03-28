import { createWorker } from "tesseract.js";
import { api } from "./api";

function normalizeToken(token: string) {
  return token.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function findIdCandidate(text: string): string | null {
  const isDate = (token: string) => {
    // Matches YYYY.MM.DD, DD/MM/YYYY, MM-DD-YYYY, etc.
    // Also matches strings that look like dates after normalization (e.g. 20170619)
    if (
      /\d{4}[.\/\- ]\d{2}[.\/\- ]\d{2}/.test(token) ||
      /\d{2}[.\/\- ]\d{2}[.\/\- ]\d{4}/.test(token) ||
      /\d{2}[.\/\- ]\d{2}[.\/\- ]\d{2}/.test(token)
    ) {
      return true;
    }

    // Check if a normalized string is a valid date-like number (YYYYMMDD)
    const clean = token.replace(/[^0-9]/g, "");
    if (clean.length === 8) {
      const year = parseInt(clean.substring(0, 4));
      const month = parseInt(clean.substring(4, 6));
      const day = parseInt(clean.substring(6, 8));
      // Basic check for valid year range and months
      if (year > 1900 && year < 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return true;
      }
    }
    return false;
  };

  const rawTokens = text.split(/\s+/).filter(Boolean);

  // 1. Highest Priority: EXACT 12 DIGIT NUMBERS (Strictly numeric, no letters)
  for (const raw of rawTokens) {
    if (/^\d{12}$/.test(raw) && !isDate(raw)) {
      return raw;
    }
  }

  // 2. Second Priority: Cleaned tokens that are exactly 12 digits
  // This will strip "PE" or other prefixes ONLY if the result is 12 digits
  for (const raw of rawTokens) {
    const clean = normalizeToken(raw);
    if (/^\d{12}$/.test(clean) && !isDate(raw)) {
      return clean;
    }
  }

  // 3. Fallback to general tokens, while strictly excluding dates
  const tokens = rawTokens
    .filter((token) => !isDate(token))
    .map(normalizeToken)
    .filter(Boolean);

  for (const token of tokens) {
    if (/^\d{12}$/.test(token)) {
      return token;
    }
  }

  // General Passport/ID: 6 to 15 digits
  // Covers most countries globally (inclusive of 9-10 digit Russian Passports)
  for (const token of tokens) {
    if (/^\d{6,15}$/.test(token)) {
      return token;
    }
  }

  // General Passport/ID: 6 to 15 digits
  // Covers most countries globally (inclusive of 9-10 digit Russian Passports)
  for (const token of tokens) {
    if (/^\d{6,15}$/.test(token)) {
      return token;
    }
  }

  // Legacy Sri Lankan NIC (9 digits + V/X)
  for (const token of tokens) {
    if (/^\d{9}[VX]$/.test(token)) {
      return token;
    }
  }

  // Alpha-numeric Passports (1-2 letters + 6-12 digits)
  for (const token of tokens) {
    if (/^[A-Z]{1,2}\d{6,12}$/.test(token)) {
      return token;
    }
  }

  const compact = normalizeToken(text);
  const nic12 = compact.match(/\d{12}/);
  if (nic12) {
    return nic12[0];
  }

  const nicOld = compact.match(/\d{9}[VX]/);
  if (nicOld) {
    return nicOld[0];
  }

  const passport = compact.match(/[A-Z]{1,2}\d{6,9}/);
  if (passport) {
    return passport[0];
  }

  return null;
}

/**
 * Uses Google Vision API (via Backend Proxy) for superior OCR accuracy.
 * Falls back to Tesseract.js if backend is unavailable or fails.
 */
export async function extractIdNumberFromImage(file: File): Promise<string | null> {
  console.log("Starting ID extraction with Google Vision (Backend API)...");

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<{ text: string }>("/api/v1/ocr/extract", formData);

    if (response && response.text) {
      console.log("Google Vision Result:", response.text);
      const result = findIdCandidate(response.text);
      if (result) return result;
    }
  } catch (err) {
    console.warn("Google Vision failed, falling back to Tesseract.js:", err);
  }

  // Fallback to Tesseract.js
  const worker = await createWorker("eng+rus", 1, {
    logger: (m) => console.log("OCR Progress:", m),
    workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js",
  });
  
  try {
    const {
      data: { text },
    } = await worker.recognize(file);
    
    console.log("Tesseract Raw Text:", text);
    const result = findIdCandidate(text);
    console.log("Extracted ID Candidate:", result);
    
    return result;
  } catch (err) {
    console.error("Tesseract-OCR Error:", err);
    throw err;
  } finally {
    await worker.terminate();
  }
}
