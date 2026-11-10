/**
 * Global test setup for React packages.
 * Import this in package-specific test-setup.ts files.
 */
import { beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key: (index: number): string | null => Object.keys(store)[index] ?? null,
  };
})();

// Only set if not already defined (happy-dom may provide it)
if (typeof globalThis.localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
}

// Reset localStorage before each test
beforeEach(() => {
  localStorage.clear();
});
