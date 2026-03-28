import { createWorker } from "tesseract.js";
import { extractTextWithGoogleVision } from "./google-vision";

export type ExtractedIdData = {
  idNumber: string | null;
  fullName: string | null;
  address: string | null;
};

function normalizeToken(token: string) {
  return token.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

const isDate = (token: string) => {
  if (
    /\d{4}[.\/\- ]\d{2}[.\/\- ]\d{2}/.test(token) ||
    /\d{2}[.\/\- ]\d{2}[.\/\- ]\d{4}/.test(token) ||
    /\d{2}[.\/\- ]\d{2}[.\/\- ]\d{2}/.test(token)
  ) {
    return true;
  }
  const clean = token.replace(/[^0-9]/g, "");
  if (clean.length === 8) {
    const year = parseInt(clean.substring(0, 4));
    const month = parseInt(clean.substring(4, 6));
    const day = parseInt(clean.substring(6, 8));
    if (year > 1900 && year < 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return true;
    }
  }
  return false;
};

function findIdData(text: string): ExtractedIdData {
  const result: ExtractedIdData = {
    idNumber: null,
    fullName: null,
    address: null,
  };

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const rawTokens = text.split(/\s+/).filter(Boolean);

  // 1. EXTRACT ID NUMBER
  for (const raw of rawTokens) {
    if (/^\d{12}$/.test(raw) && !isDate(raw)) {
      result.idNumber = raw;
      break;
    }
  }

  if (!result.idNumber) {
    for (const raw of rawTokens) {
      const clean = normalizeToken(raw);
      if (/^\d{12}$/.test(clean) && !isDate(raw)) {
        result.idNumber = clean;
        break;
      }
    }
  }

  if (!result.idNumber) {
    for (const raw of rawTokens) {
      const token = normalizeToken(raw);
      if (!isDate(raw) && /^\d{6,15}$/.test(token)) {
        result.idNumber = token;
        break;
      }
    }
  }

  // 2. EXTRACT FULL NAME
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase();
    if (line.includes("NAME") || line.includes("SURNAME") || line.includes("GIVEN NAMES")) {
      let possibleName = lines[i].split(/[:\-]/).slice(1).join(" ").trim();
      if (!possibleName && i + 1 < lines.length) {
        possibleName = lines[i + 1].trim();
      }
      if (possibleName && possibleName.length > 3 && !/^\d+$/.test(possibleName)) {
        result.fullName = possibleName;
        break;
      }
    }
  }

  // 3. EXTRACT ADDRESS
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase();
    if (line.includes("ADDRESS") || line.includes("RESIDENCE")) {
      const addrParts = [];
      const inline = lines[i].split(/[:\-]/).slice(1).join(" ").trim();
      if (inline) addrParts.push(inline);

      for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
        const nextLine = lines[j];
        if (!nextLine || nextLine.toUpperCase().includes("DATE") || nextLine.toUpperCase().includes("SEX") || nextLine.toUpperCase().includes("ID")) break;
        addrParts.push(nextLine.trim());
      }
      if (addrParts.length > 0) {
        result.address = addrParts.join(", ");
        break;
      }
    }
  }

  return result;
}

export async function extractIdDataFromImage(file: File): Promise<ExtractedIdData> {
  const emptyResult: ExtractedIdData = { idNumber: null, fullName: null, address: null };

  try {
    const text = await extractTextWithGoogleVision(file);
    if (text) {
      return findIdData(text);
    }
  } catch (err) {
    console.warn("Google Vision failed:", err);
  }

  const worker = await createWorker("eng+rus", 1, {
    workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js",
  });
  
  try {
    const { data: { text } } = await worker.recognize(file);
    return findIdData(text);
  } catch (err) {
    console.error("OCR extraction failed:", err);
    return emptyResult;
  } finally {
    if (worker) await worker.terminate();
  }
}

export async function extractIdNumberFromImage(file: File): Promise<string | null> {
  const data = await extractIdDataFromImage(file);
  return data.idNumber;
}
