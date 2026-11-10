/**
 * Package boundary enforcement for the publishable packages of this repo
 * (@n-uf/papyrus, @n-uf/papyrus-react). Copied from n-uf/angiospermae.
 *
 * The packages ship their source to npmjs and GitHub Packages, so a consumer
 * installs exactly what the package.json declares. A source file may only import:
 *   - relative paths and absolute paths,
 *   - Node built-ins,
 *   - the package itself, and
 *   - packages the package declares in `dependencies`, `peerDependencies` or
 *     `optionalDependencies`.
 *
 * Path aliases (`@/...`) and `package.json` "imports" (`#...`) are flagged: the
 * consumer's bundler and TypeScript do not know the package's aliases, so such
 * an import cannot resolve once the source is installed. Use relative paths.
 *
 * `devDependencies` are NOT installed for consumers. They may only be imported
 * from test, story and config files (see {@link DEV_FILES}).
 *
 * In addition, `forbid` lists packages that must never be imported even when
 * declared (for example harbuz and kavun are sibling kits and stay independent).
 *
 * The rule looks at: `import` / `export ... from` / `import()` / `import type`,
 * `import x = require()`, `require()`, `require.resolve()`, `import.meta.resolve()`
 * and the vitest / jest module mocks (`vi.mock`, `vi.doMock`, `vi.importActual`,
 * `vi.importMock`, `vi.unmock`, `jest.mock`, ...).
 *
 * Usage (eslint.config.js of a package):
 *   import { packageBoundaries } from "@n-uf/eslint-config/package-boundaries";
 *   export default [...config, ...packageBoundaries({ forbid: ["@n-uf/kavun"] })];
 *
 * This file has no dependencies beyond ESLint itself.
 */
import { builtinModules } from "node:module";
import fs from "node:fs";
import path from "node:path";

const BUILTINS = new Set(builtinModules);

/**
 * Files that may import `devDependencies`: tests, stories, test setup and
 * tool configuration. Everything else is published and runs in consumers.
 */
export const DEV_FILES = [
  "**/*.{test,spec}.{ts,tsx,js,jsx,mjs,cjs}",
  "**/__tests__/**",
  "**/__mocks__/**",
  "**/*.stories.{ts,tsx,js,jsx,mjs}",
  "**/*.config.{ts,js,mjs,cjs}",
  "**/test-setup.{ts,tsx,js}",
  "**/setup-tests.{ts,tsx,js}",
  "**/.storybook/**",
];

const MODULE_MOCK_METHODS = new Set([
  "mock",
  "doMock",
  "unmock",
  "doUnmock",
  "importActual",
  "importMock",
  "requireActual",
  "requireMock",
]);
const MOCK_OBJECTS = new Set(["vi", "vitest", "jest"]);

/** Walk up from `dir` to the nearest package.json. Cached per directory. */
const manifestCache = new Map();
function findManifest(dir) {
  if (manifestCache.has(dir)) return manifestCache.get(dir);
  let result = null;
  const file = path.join(dir, "package.json");
  if (fs.existsSync(file)) {
    const json = JSON.parse(fs.readFileSync(file, "utf8"));
    result = {
      name: json.name,
      runtime: new Set([
        ...Object.keys(json.dependencies ?? {}),
        ...Object.keys(json.peerDependencies ?? {}),
        ...Object.keys(json.optionalDependencies ?? {}),
      ]),
      dev: new Set(Object.keys(json.devDependencies ?? {})),
    };
  } else {
    const parent = path.dirname(dir);
    if (parent !== dir) result = findManifest(parent);
  }
  manifestCache.set(dir, result);
  return result;
}

/** "@scope/name/sub/path" -> "@scope/name"; "name/sub" -> "name". */
function packageNameOf(specifier) {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function isIgnorable(specifier) {
  return (
    specifier === "" ||
    specifier.startsWith(".") ||
    specifier.startsWith("/") ||
    specifier.startsWith("node:") ||
    specifier.startsWith("data:") ||
    specifier.startsWith("virtual:") ||
    BUILTINS.has(specifier.split("/")[0])
  );
}

/** `@/x` (tsconfig path alias) and `#x` (package.json "imports"): not resolvable by consumers. */
function isConsumerUnresolvable(specifier) {
  return specifier.startsWith("@/") || specifier.startsWith("#");
}

/** A string literal or a template literal without expressions. */
function literalValue(node) {
  if (!node) return undefined;
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  if (node.type === "TemplateLiteral" && node.expressions.length === 0) {
    return node.quasis[0]?.value.cooked ?? undefined;
  }
  return undefined;
}

/** `require.resolve` and `import.meta.resolve` */
function isResolveCall(callee) {
  if (callee.type !== "MemberExpression" || callee.computed) return false;
  if (callee.property.type !== "Identifier" || callee.property.name !== "resolve") {
    return false;
  }
  const obj = callee.object;
  if (obj.type === "Identifier" && obj.name === "require") return true;
  return obj.type === "MetaProperty" && obj.meta.name === "import" && obj.property.name === "meta";
}

/** `vi.mock(...)`, `jest.requireActual(...)` and friends */
function isModuleMockCall(callee) {
  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.object.type === "Identifier" &&
    MOCK_OBJECTS.has(callee.object.name) &&
    callee.property.type === "Identifier" &&
    MODULE_MOCK_METHODS.has(callee.property.name)
  );
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    schema: [
      {
        type: "object",
        properties: {
          forbid: { type: "array", items: { type: "string" } },
          allowDev: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      undeclared:
        "'{{pkg}}' is not declared in {{self}}'s package.json. Published packages may only import their own declared dependencies.",
      devOnly:
        "'{{pkg}}' is only a devDependency of {{self}}, which consumers do not install. Move it to dependencies or peerDependencies, or import it from a test, story or config file only.",
      unresolvable:
        "'{{pkg}}' is a path alias or subpath import that consumers of {{self}} cannot resolve (the package ships TypeScript source). Use a relative import.",
      forbidden:
        "'{{pkg}}' must not be imported by {{self}}: it is on this package's `forbid` list (see packageBoundaries({ forbid }) in its eslint.config.js).",
    },
  },
  create(context) {
    const options = context.options[0] ?? {};
    const forbid = new Set(options.forbid ?? []);
    const allowDev = options.allowDev === true;
    const filename = context.filename ?? context.getFilename();
    const manifest = findManifest(path.dirname(filename));
    if (!manifest) return {};

    function check(node, specifier) {
      if (typeof specifier !== "string") return;
      if (isConsumerUnresolvable(specifier)) {
        context.report({
          node,
          messageId: "unresolvable",
          data: { pkg: specifier, self: manifest.name },
        });
        return;
      }
      if (isIgnorable(specifier)) return;
      const pkg = packageNameOf(specifier);
      if (pkg === manifest.name) return;
      const data = { pkg, self: manifest.name };
      if (forbid.has(pkg)) {
        context.report({ node, messageId: "forbidden", data });
      } else if (manifest.runtime.has(pkg)) {
        // fine: shipped to consumers
      } else if (manifest.dev.has(pkg)) {
        if (!allowDev) context.report({ node, messageId: "devOnly", data });
      } else {
        context.report({ node, messageId: "undeclared", data });
      }
    }

    return {
      ImportDeclaration: (node) => check(node.source, node.source.value),
      ExportNamedDeclaration: (node) => node.source && check(node.source, node.source.value),
      ExportAllDeclaration: (node) => check(node.source, node.source.value),
      ImportExpression: (node) => check(node.source, literalValue(node.source)),
      // import x = require("y")
      TSImportEqualsDeclaration: (node) => {
        const ref = node.moduleReference;
        if (ref.type === "TSExternalModuleReference") {
          check(ref.expression, literalValue(ref.expression));
        }
      },
      // import("y") in a type position: type T = import("y").Foo
      TSImportType: (node) => {
        const arg = node.argument ?? node.parameter;
        const lit = arg?.literal ?? arg;
        check(lit, literalValue(lit));
      },
      CallExpression: (node) => {
        const first = node.arguments[0];
        if (!first) return;
        const callee = node.callee;
        if (
          (callee.type === "Identifier" && callee.name === "require") ||
          isResolveCall(callee) ||
          isModuleMockCall(callee)
        ) {
          check(first, literalValue(first));
        }
      },
    };
  },
};

export const packageBoundariesPlugin = {
  meta: { name: "package-boundaries" },
  rules: { "no-undeclared-imports": rule },
};

/**
 * Flat-config entries enforcing the boundary rule on a package's files.
 *
 * Test, story and config files ({@link DEV_FILES}) may additionally import the
 * package's `devDependencies`.
 *
 * @param {{ forbid?: string[] }} [options]
 * @returns {import("eslint").Linter.Config[]}
 */
export function packageBoundaries(options = {}) {
  const forbid = options.forbid ?? [];
  const sources = ["**/*.{ts,tsx,js,jsx,mjs,cjs}"];
  return [
    {
      files: sources,
      plugins: { "package-boundaries": packageBoundariesPlugin },
      rules: {
        "package-boundaries/no-undeclared-imports": ["error", { forbid, allowDev: false }],
      },
    },
    {
      files: DEV_FILES,
      rules: {
        "package-boundaries/no-undeclared-imports": ["error", { forbid, allowDev: true }],
      },
    },
  ];
}
