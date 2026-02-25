import { rateLimiterMiddleware } from "@middleware/rate-limiter";
import { getSubscriptionPlan } from "@service/subscription-service";
import { CTX_SLACK_COMMAND_REQUEST } from "@utils/context-keys";
import { rateLimiter } from "hono-rate-limiter";
import { WorkersKVStore } from "@hono-rate-limiter/cloudflare";
import { describe, it, expect, vi } from "vitest";

vi.mock("@service/subscription-service");
vi.mock("hono-rate-limiter");
vi.mock("@hono-rate-limiter/cloudflare");

describe("rateLimiterMiddleware", () => {
  const mockEnv = {
    SUBSCRIPTION_PLANS_KV: {},
    RATE_LIMITER_KV: {},
  };
  const mockNext = vi.fn();
  const mockRateLimiterInstance = vi.fn();

  let mockContext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext = {
      env: mockEnv,
      get: vi.fn(),
    };
    (rateLimiter as any).mockReturnValue(mockRateLimiterInstance);
    (WorkersKVStore as any).mockImplementation(function () {
      return {};
    });
  });

  it("should configure rate limiter with subscription plan settings", async () => {
    const mockRequest = { user_id: "U123", team_id: "T123" };
    const mockPlan = {
      name: "Pro",
      rateLimit: 100,
      windowMs: 60000,
    };

    mockContext.get.mockReturnValue(mockRequest);
    (getSubscriptionPlan as any).mockResolvedValue(mockPlan);

    await rateLimiterMiddleware(mockContext, mockNext);

    expect(mockContext.get).toHaveBeenCalledWith(CTX_SLACK_COMMAND_REQUEST);
    expect(getSubscriptionPlan).toHaveBeenCalledWith(
      mockEnv.SUBSCRIPTION_PLANS_KV,
      "T123"
    );

    expect(WorkersKVStore).toHaveBeenCalledWith({
      namespace: mockEnv.RATE_LIMITER_KV,
    });

    expect(rateLimiter).toHaveBeenCalledWith(
      expect.objectContaining({
        windowMs: mockPlan.windowMs,
        limit: mockPlan.rateLimit,
        handler: expect.any(Function),
      })
    );

    const config = (rateLimiter as any).mock.calls[0][0];
    expect(config.keyGenerator()).toBe("user:U123");

    // Verify handler behavior
    const handler = config.handler;
    const mockJson = vi.fn();
    const mockC = { json: mockJson };
    handler(mockC);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        response_type: "ephemeral",
        text: expect.stringContaining(mockPlan.name),
      }),
      200
    );

    expect(mockRateLimiterInstance).toHaveBeenCalledWith(mockContext, mockNext);
  });

  it("should propagate errors from getSubscriptionPlan", async () => {
    mockContext.get.mockReturnValue({ user_id: "U1", team_id: "T1" });
    const error = new Error("KV Error");
    (getSubscriptionPlan as any).mockRejectedValue(error);

    await expect(rateLimiterMiddleware(mockContext, mockNext)).rejects.toThrow(
      error
    );
  });
});
