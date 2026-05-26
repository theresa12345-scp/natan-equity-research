import { describe, it, expect } from "vitest";
import {
  formatIDR,
  formatUSD,
  formatPrice,
  formatPercent,
  formatPercentPlain,
  formatBp,
  formatMarketCap,
} from "../../lib/format";

describe("formatIDR", () => {
  it("renders with Rp prefix and no decimals", () => {
    expect(formatIDR(9650)).toBe("Rp 9,650");
    expect(formatIDR(1000000)).toBe("Rp 1,000,000");
  });

  it("rounds to whole rupiah", () => {
    expect(formatIDR(9650.49)).toBe("Rp 9,650");
    expect(formatIDR(9650.5)).toBe("Rp 9,651");
  });
});

describe("formatUSD", () => {
  it("renders with $ prefix and exactly two decimals", () => {
    expect(formatUSD(162.84)).toBe("$162.84");
    expect(formatUSD(1)).toBe("$1.00");
    expect(formatUSD(1234567.89)).toBe("$1,234,567.89");
  });
});

describe("formatPrice", () => {
  it("dispatches by currency", () => {
    expect(formatPrice(9650, "IDR")).toBe("Rp 9,650");
    expect(formatPrice(162.84, "USD")).toBe("$162.84");
  });
});

describe("formatPercent", () => {
  it("uses leading sign for positive", () => {
    expect(formatPercent(1.24)).toBe("+1.24%");
  });

  it("uses leading sign for negative", () => {
    expect(formatPercent(-0.83)).toBe("-0.83%");
  });

  it("treats zero as unsigned", () => {
    expect(formatPercent(0)).toBe("0.00%");
  });

  it("respects custom digit count", () => {
    expect(formatPercent(12.3456, 1)).toBe("+12.3%");
    expect(formatPercent(12.3456, 3)).toBe("+12.346%");
  });
});

describe("formatPercentPlain", () => {
  it("omits leading sign", () => {
    expect(formatPercentPlain(1.24)).toBe("1.24%");
    expect(formatPercentPlain(-1.24)).toBe("-1.24%");
  });
});

describe("formatBp", () => {
  it("renders integer basis points with sign", () => {
    expect(formatBp(25)).toBe("+25bp");
    expect(formatBp(-50)).toBe("-50bp");
    expect(formatBp(12.7)).toBe("+13bp");
  });
});

describe("formatMarketCap", () => {
  it("compacts IDR market caps", () => {
    expect(formatMarketCap(1_000_000_000_000, "IDR")).toBe("Rp 1T");
  });

  it("compacts USD market caps", () => {
    expect(formatMarketCap(1_000_000_000, "USD")).toBe("$1B");
    expect(formatMarketCap(3_270_000_000_000, "USD")).toBe("$3.27T");
  });
});
