import { formatCurrency, formatDate } from "@/lib/format";

describe("format helpers", () => {
  it("formats currency in LKR", () => {
    const value = formatCurrency(12345);
    expect(value).toMatch(/LKR\s*12,345/);
  });

  it("formats ISO date to readable format", () => {
    const value = formatDate("2026-03-07");
    expect(value.length).toBeGreaterThan(6);
  });
});
