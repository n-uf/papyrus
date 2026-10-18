import { describe, expect, it, vi } from "vitest";

import * as dossier from "./index";
import { createDocRegistry } from "./doc-registry";

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
