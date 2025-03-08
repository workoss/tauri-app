import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

// import { beforeAll, expect, test } from "vitest";
// import { randomFillSync } from "crypto";

// import { mockIPC } from "@tauri-apps/api/mocks";
// import { invoke } from "@tauri-apps/api/core";
