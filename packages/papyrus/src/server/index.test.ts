import { describe, expect, it } from "vitest";
import { createPdfHandler } from "./index.js";

/** A stand-in for a Playwright browser that records what it was asked to print */
function fakeBrowser() {
  const seen: { url?: string; headers?: Record<string, string> } = {};
  const page = {
    setExtraHTTPHeaders: async (h: Record<string, string>) => void (seen.headers = h),
    goto: async (url: string) => void (seen.url = url),
    waitForTimeout: async () => {},
    emulateMedia: async () => {},
    addStyleTag: async () => {},
    evaluate: async () => ({ pages: 1, declared: 1 }),
    pdf: async () => Buffer.from("%PDF-1.4 /Type /Page "),
    close: async () => {},
  };
  const browser = { isConnected: () => true, newPage: async () => page };
  return { browser, seen };
}

describe("createPdfHandler", () => {
  it("renders an allowed document with the reader's parameters and forwards only named cookies", async () => {
    const { browser, seen } = fakeBrowser();
    const handle = createPdfHandler({
      docs: ["calc"],
      launch: async () => browser as never,
      forwardCookies: ["session"],
      fileName: (id) => `acme-${id}.pdf`,
      renderOptions: { settleMs: 0 },
    });
    const res = await handle(
      new Request("https://docs.example/api/pdf?doc=calc&raised=900000&print=false", {
        headers: { cookie: "session=abc; tracking=xyz" },
      }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toBe('attachment; filename="acme-calc.pdf"');
    expect(seen.url).toBe("https://docs.example/docs/calc?print=true&raised=900000");
    expect(seen.headers).toEqual({ cookie: "session=abc" });
  });

  it("refuses documents that are not allowed", async () => {
    const handle = createPdfHandler({ docs: ["calc"], launch: async () => fakeBrowser().browser as never });
    expect((await handle(new Request("https://docs.example/api/pdf?doc=secret"))).status).toBe(404);
    expect((await handle(new Request("https://docs.example/api/pdf?doc=../calc"))).status).toBe(404);
    expect((await handle(new Request("https://docs.example/api/pdf"))).status).toBe(404);
  });
});
