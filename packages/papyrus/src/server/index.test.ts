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
  const state = { connected: true, closed: 0 };
  const browser = {
    isConnected: () => state.connected,
    newPage: async () => page,
    close: async () => void ((state.connected = false), state.closed++),
  };
  return { browser, seen, state };
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

  it("launches a browser per request and closes it, even when rendering fails", async () => {
    const launched: ReturnType<typeof fakeBrowser>[] = [];
    const handle = createPdfHandler({
      docs: ["calc"],
      launch: async () => {
        const fake = fakeBrowser();
        launched.push(fake);
        return fake.browser as never;
      },
      renderOptions: { settleMs: 0 },
    });
    for (let i = 0; i < 3; i++) {
      expect((await handle(new Request("https://docs.example/api/pdf?doc=calc"))).status).toBe(200);
    }
    expect(launched).toHaveLength(3);
    expect(launched.every((f) => f.state.closed === 1)).toBe(true);

    const broken = fakeBrowser();
    broken.browser.newPage = async () => {
      throw new Error("Target page, context or browser has been closed");
    };
    const failing = createPdfHandler({ docs: ["calc"], launch: async () => broken.browser as never });
    expect((await failing(new Request("https://docs.example/api/pdf?doc=calc"))).status).toBe(500);
    expect(broken.state.closed).toBe(1);
  });

  it("with reuseBrowser keeps one browser while it stays connected", async () => {
    const launched: ReturnType<typeof fakeBrowser>[] = [];
    const handle = createPdfHandler({
      docs: ["calc"],
      reuseBrowser: true,
      launch: async () => {
        const fake = fakeBrowser();
        launched.push(fake);
        return fake.browser as never;
      },
      renderOptions: { settleMs: 0 },
    });
    await handle(new Request("https://docs.example/api/pdf?doc=calc"));
    await handle(new Request("https://docs.example/api/pdf?doc=calc"));
    expect(launched).toHaveLength(1);
    expect(launched[0]?.state.closed).toBe(0);
    launched[0]!.state.connected = false;
    await handle(new Request("https://docs.example/api/pdf?doc=calc"));
    expect(launched).toHaveLength(2);
  });
});
