import { formatCurrency, formatDate } from "@/lib/format";

describe("format helpers", () => {
  it("formats currency in LKR", () => {
    const value = formatCurrency(12345);
    expect(value).toContain("12");
    expect(value).toContain("345");
  });

  it("formats ISO date to readable format", () => {
    const value = formatDate("2026-03-07");
    expect(value.length).toBeGreaterThan(6);
  });
});
