import { describe, expect, it } from "vitest";

import { decodeCommand } from "@service/commands/decode-command";

describe("decodeCommand", () => {
  it("should decode valid base64 input", () => {
    expect(decodeCommand(["SGVsbG8gd29ybGQ="])).toBe("Hello world");
  });

  it("should decode valid base64 input with multiple args", () => {
    expect(decodeCommand(["SGVsbG8=", "d29ybGQ="])).toBe("Hello world");
  });

  it("should return error message for invalid base64", () => {
    expect(decodeCommand(["invalid_base64"])).toBe("Invalid Base64 input");
  });

  it("should return empty string for empty input", () => {
    expect(decodeCommand([])).toBe("");
  });
});
