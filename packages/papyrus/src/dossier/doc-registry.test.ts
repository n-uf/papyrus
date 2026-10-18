import { describe, expect, it, vi } from "vitest";

import * as dossier from "./index";
import { createDocRegistry, docRegistry } from "./doc-registry";

const doc = (id: string) => ({
  id,
  meta: { title: id, pageCount: 1, toc: [] },
  component: () => null,
});

describe("createDocRegistry", () => {
  it("registers and looks up documents", () => {
    const registry = createDocRegistry();
    registry.register(doc("a"));
    expect(registry.has("a")).toBe(true);
    expect(registry.get("a")?.meta.title).toBe("a");
    expect(registry.getIds()).toEqual(["a"]);
    expect(registry.get("missing")).toBeUndefined();
  });

  it("warns when a document is overwritten", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const registry = createDocRegistry();
    registry.register(doc("a"));
    registry.register(doc("a"));
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe("docRegistry", () => {
  it("is shared through globalThis, so a second copy of the module sees the same registry", async () => {
    vi.resetModules();
    const second = await import("./doc-registry");
    expect(second.docRegistry).toBe(docRegistry);
    second.registerDoc(doc("shared"));
    expect(docRegistry.has("shared")).toBe(true);
  });

  it("is stored under Symbol.for('@n-uf/papyrus/docRegistry')", () => {
    const store = globalThis as unknown as Record<symbol, unknown>;
    expect(store[Symbol.for("@n-uf/papyrus/docRegistry")]).toBe(docRegistry);
  });
});

describe("dossier module", () => {
  it("exports only the content-free registry API", () => {
    expect(Object.keys(dossier).sort()).toEqual([
      "createDocRegistry",
      "docRegistry",
      "getDocComponent",
      "getDocMeta",
      "getRegisteredDocIds",
      "hasDoc",
      "registerDoc",
    ]);
  });
});
