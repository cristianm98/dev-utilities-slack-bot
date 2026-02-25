import { parseCronExpression as cronParser } from "@service/commands/cron-parser-command";
import { describe, expect, it } from "vitest";

describe("cronParser", () => {
  it("should parse a valid cron expression (midnight)", () => {
    expect(cronParser("0 0 * * *")).toEqual("At 00:00");
  });

  it("should parse a valid cron expression (every 5 minutes)", () => {
    expect(cronParser("*/5 * * * *")).toEqual("Every 5 minutes");
  });

  it("should parse a valid cron expression (every Monday at 9:30)", () => {
    expect(cronParser("30 9 * * 1")).toEqual("At 09:30, only on Monday");
  });

  it("should parse a valid cron expression (every January 1st at noon)", () => {
    expect(cronParser("0 12 1 1 *")).toEqual(
      "At 12:00, on day 1 of the month, only in January"
    );
  });

  it("should parse a valid cron expression (every minute)", () => {
    expect(cronParser("* * * * *")).toEqual("Every minute");
  });

  it("should parse a valid cron expression (every weekday at 8:00)", () => {
    expect(cronParser("0 8 * * 1-5")).toEqual(
      "At 08:00, Monday through Friday"
    );
  });

  it("should parse a valid cron expression (every 15th of the month at 6:00)", () => {
    expect(cronParser("0 6 15 * *")).toEqual(
      "At 06:00, on day 15 of the month"
    );
  });

  it("should parse a valid cron expression (every December at 23:59)", () => {
    expect(cronParser("59 23 * 12 *")).toEqual("At 23:59, only in December");
  });

  it("should throw for an invalid cron expression (nonsense)", () => {
    expect(() => cronParser("invalid cron")).toThrowError(
      "Unable to parse the cron expression: invalid cron."
    );
  });

  it("should throw for an invalid cron expression (too few fields)", () => {
    expect(() => cronParser("* * * *")).toThrowError(
      "Unable to parse the cron expression: * * * *."
    );
  });

  it("should handle an invalid cron expression (too many fields)", () => {
    // cronstrue returns 'Every second' for this input
    expect(cronParser("* * * * * * *")).toEqual("Every second");
  });

  it("should throw for an empty cron expression", () => {
    expect(() => cronParser("")).toThrowError(
      "Unable to parse the cron expression: ."
    );
  });

  it("should handle a cron expression with invalid characters", () => {
    // cronstrue returns a string for @daily, not an error
    expect(cronParser("@daily")).toEqual("At 00:00");
  });
});
