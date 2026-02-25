import { getSubscriptionPlan } from "@service/subscription-service";
import { describe, beforeEach, expect, it, vi } from "vitest";

describe("getSubscriptionPlan", () => {
  let mockKV: any;

  beforeEach(() => {
    mockKV = {
      get: vi.fn(),
    };
  });

  it("should return parsed subscription plan when data exists and is valid", async () => {
    const validPlan = {
      name: "Basic",
      rateLimit: 50,
      windowMs: 3600000,
    };
    mockKV.get.mockResolvedValue(JSON.stringify(validPlan));

    const result = await getSubscriptionPlan(mockKV, "team-1");

    expect(result).toEqual(validPlan);
    expect(mockKV.get).toHaveBeenCalledWith("team-1");
  });

  it("should throw error if subscription plan not found", async () => {
    mockKV.get.mockResolvedValue(null);

    await expect(getSubscriptionPlan(mockKV, "team-2")).rejects.toThrow(
      "Subscription plan not found"
    );
  });

  it("should throw error if data is missing required fields", async () => {
    const invalidPlan = { name: "Bad Plan" }; // Missing rateLimit and windowMs
    mockKV.get.mockResolvedValue(JSON.stringify(invalidPlan));

    await expect(getSubscriptionPlan(mockKV, "team-3")).rejects.toThrow(
      "Invalid subscription plan data: missing required fields"
    );
  });

  it("should throw error if JSON is invalid", async () => {
    mockKV.get.mockResolvedValue("invalid-json");

    await expect(getSubscriptionPlan(mockKV, "team-4")).rejects.toThrow(); // JSON.parse error
  });
});
