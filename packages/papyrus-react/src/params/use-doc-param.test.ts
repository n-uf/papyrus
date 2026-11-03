import { describe, expect, it } from "vitest";
import { readDocParam, writeDocParam } from "./use-doc-param";

describe("document parameters", () => {
  it("reads numbers from the query string, falling back when absent or invalid", () => {
    expect(readDocParam("?raised=750000&print=true", "raised", 500_000)).toBe(750_000);
    expect(readDocParam("?print=true", "raised", 500_000)).toBe(500_000);
    expect(readDocParam("?raised=abc", "raised", 1)).toBe(1);
    expect(readDocParam("?raised=", "raised", 1)).toBe(1);
  });

  it("writes values and drops the default, keeping other parameters", () => {
    const base = "https://docs.example/docs/calc?download=solid";
    const set = writeDocParam(base, "raised", 750_000, 500_000);
    expect(set).toBe("https://docs.example/docs/calc?download=solid&raised=750000");
    expect(writeDocParam(set, "raised", 500_000, 500_000)).toBe(base);
  });
});
