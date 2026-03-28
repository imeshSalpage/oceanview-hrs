import { createWorker } from "tesseract.js";

function normalizeToken(token: string) {
  return token.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function findIdCandidate(text: string): string | null {
  const tokens = text
    .split(/\s+/)
    .map(normalizeToken)
    .filter(Boolean);

  for (const token of tokens) {
    if (/^\d{12}$/.test(token)) {
      return token;
    }
  }

  for (const token of tokens) {
    if (/^\d{9}[VX]$/.test(token)) {
      return token;
    }
  }

  for (const token of tokens) {
    if (/^[A-Z]{1,2}\d{6,9}$/.test(token)) {
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

export async function extractIdNumberFromImage(file: File): Promise<string | null> {
  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(file);
    return findIdCandidate(text);
  } finally {
    await worker.terminate();
  }
}
