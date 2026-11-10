import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";

import { packageBoundariesPlugin } from "../package-boundaries.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const here = path.dirname(fileURLToPath(import.meta.url));
const src = (name) => path.join(here, "fixtures/pkg/src", name);
const rule = packageBoundariesPlugin.rules["no-undeclared-imports"];

const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    sourceType: "module",
    ecmaVersion: "latest",
  },
});

const runtime = [{ allowDev: false, forbid: ["@n-uf/kavun"] }];
const devFile = [{ allowDev: true, forbid: ["@n-uf/kavun"] }];

tester.run("package-boundaries/no-undeclared-imports", rule, {
  valid: [
    // relative, builtin, alias, self, declared (dependencies / peer / optional)
    { filename: src("a.ts"), options: runtime, code: `import a from "./a"; import b from "../b";` },
    { filename: src("a.ts"), options: runtime, code: `import fs from "node:fs"; import p from "path";` },
    { filename: src("a.ts"), options: runtime, code: `import { x } from "@n-uf/fixture/sub";` },
    { filename: src("a.ts"), options: runtime, code: `import clsx from "clsx"; import { jsx } from "react/jsx-runtime";` },
    { filename: src("a.ts"), options: runtime, code: `import("playwright");` },
    { filename: src("a.ts"), options: runtime, code: `import type { T } from "react";` },
    // devDependencies are fine in test/story/config files
    { filename: src("a.test.ts"), options: devFile, code: `import { it } from "vitest"; vi.mock("vitest");` },
    { filename: src("a.test.ts"), options: devFile, code: `const x = require.resolve("@types/react");` },
    // not a literal: nothing to check
    { filename: src("a.ts"), options: runtime, code: `import(name); require(name); vi.mock(name);` },
  ],
  invalid: [
    { filename: src("a.ts"), options: runtime, code: `import x from "lodash";`, errors: [{ messageId: "undeclared" }] },
    { filename: src("a.ts"), options: runtime, code: `export { y } from "@scope/pkg/deep";`, errors: [{ messageId: "undeclared" }] },
    { filename: src("a.ts"), options: runtime, code: `export * from "lodash";`, errors: [{ messageId: "undeclared" }] },
    { filename: src("a.ts"), options: runtime, code: `const m = await import("lodash");`, errors: [{ messageId: "undeclared" }] },
    { filename: src("a.ts"), options: runtime, code: `type T = import("lodash").Foo;`, errors: [{ messageId: "undeclared" }] },
    { filename: src("a.ts"), options: runtime, code: `import l = require("lodash");`, errors: [{ messageId: "undeclared" }] },
    { filename: src("a.ts"), options: runtime, code: `const l = require("lodash");`, errors: [{ messageId: "undeclared" }] },
    { filename: src("a.ts"), options: runtime, code: `const p = require.resolve("lodash");`, errors: [{ messageId: "undeclared" }] },
    { filename: src("a.ts"), options: runtime, code: `const p = import.meta.resolve("lodash");`, errors: [{ messageId: "undeclared" }] },
    { filename: src("a.test.ts"), options: devFile, code: `vi.mock("lodash");`, errors: [{ messageId: "undeclared" }] },
    { filename: src("a.test.ts"), options: devFile, code: `await vi.importActual("lodash");`, errors: [{ messageId: "undeclared" }] },
    { filename: src("a.test.ts"), options: devFile, code: `jest.mock("lodash");`, errors: [{ messageId: "undeclared" }] },
    // devDependencies are not installed for consumers
    { filename: src("a.ts"), options: runtime, code: `import { it } from "vitest";`, errors: [{ messageId: "devOnly" }] },
    { filename: src("a.ts"), options: runtime, code: `import type { T } from "@types/react";`, errors: [{ messageId: "devOnly" }] },
    { filename: src("a.ts"), options: runtime, code: `vi.mock("vitest");`, errors: [{ messageId: "devOnly" }] },
    // aliases and subpath imports cannot resolve in consumers
    { filename: src("a.ts"), options: runtime, code: `import { x } from "@/utils/x";`, errors: [{ messageId: "unresolvable" }] },
    { filename: src("a.ts"), options: runtime, code: `export * from "@/x";`, errors: [{ messageId: "unresolvable" }] },
    { filename: src("a.ts"), options: runtime, code: `import("@/x");`, errors: [{ messageId: "unresolvable" }] },
    { filename: src("a.ts"), options: runtime, code: `import { y } from "#internal/y";`, errors: [{ messageId: "unresolvable" }] },
    { filename: src("a.test.ts"), options: devFile, code: `vi.mock("@/x");`, errors: [{ messageId: "unresolvable" }] },
    // forbidden wins over everything
    { filename: src("a.ts"), options: runtime, code: `import k from "@n-uf/kavun/ui/x";`, errors: [{ messageId: "forbidden" }] },
    // a scoped package name still counts as a real package, not an alias
    { filename: src("a.ts"), options: runtime, code: `import s from "@scope/pkg";`, errors: [{ messageId: "undeclared" }] },
    { filename: src("a.test.ts"), options: devFile, code: `vi.mock("@n-uf/kavun");`, errors: [{ messageId: "forbidden" }] },
  ],
});
