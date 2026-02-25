import { encodeCommand } from "@service/commands/encode-command";

describe("encodeCommand", () => {
  it("should encode valid input to base64", () => {
    expect(encodeCommand(["Hello world"])).toBe("SGVsbG8gd29ybGQ=");
  });

  it("should encode valid input with multiple args to base64", () => {
    expect(encodeCommand(["Hello", "world"])).toBe("SGVsbG8gd29ybGQ=");
  });

  it("should return empty string for empty input", () => {
    expect(encodeCommand([])).toBe("");
  });

  it("should encode special characters correctly", () => {
    expect(encodeCommand(["!@#$%^&*()"])).toBe("IUAjJCVeJiooKQ==");
  });
});
