import { describe, expect, it } from "vitest";

import { timestampCommand } from "@service/commands/timestamp-generator-command";

describe("timestampCommand", () => {
  it("should generate timestamp in milliseconds", () => {
    const expected = Date.now();
    const actual = Number(timestampCommand(["milliseconds"]));
    // Allow a delta of 100 milliseconds
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(100);
  });

  it("should generate nanoseconds timestamp", () => {
    const expected = Date.now() * 1_000_000;
    const actual = Number(timestampCommand(["nanoseconds"]));
    // Allow a delta of 10_000_000 nanoseconds (10 milliseconds)
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(10_000_000);
  });
});
