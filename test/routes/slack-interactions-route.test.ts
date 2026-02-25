import { slackInteractionsRoute } from "@routes/slack-interactions-route";
import { publishAppHome } from "@service/actions/app-home-service";
import { upgradeAction } from "@service/actions/upgrade-action-service";
import { getSubscriptionPlan } from "@service/subscription-service";
import {
  SLACK_ACTION_UPGRADE,
  SLACK_APP_HOME_OPENED,
  SLACK_BLOCK_ACTIONS,
  SLACK_EVENT_CALLBACK,
} from "@utils/context-keys";
import { describe, expect, it, vi } from "vitest";

vi.mock("@service/actions/app-home-service");
vi.mock("@service/actions/upgrade-action-service");
vi.mock("@service/subscription-service");

describe("slackInteractionsRoute", () => {
  const mockEnv = {
    SLACK_BOT_TOKEN: "mock-bot-token",
    SUBSCRIPTION_PLANS_KV: {},
    JWT_SIGNING_SECRET: "secret",
    UPGRADE_BASE_URL: "url",
    JWT_ISSUER: "issuer",
    JWT_AUDIENCE: "audience",
  };

  let mockContext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext = {
      env: mockEnv,
      get: vi.fn(),
      text: vi.fn(),
      json: vi.fn(),
    };
  });

  it("should handle app home opened event", async () => {
    const payload = {
      type: SLACK_EVENT_CALLBACK,
      event: {
        type: SLACK_APP_HOME_OPENED,
        user: "U123",
        team: "T123",
      },
    };
    mockContext.get.mockReturnValue(payload);
    (getSubscriptionPlan as any).mockResolvedValue({ name: "Free" });

    await slackInteractionsRoute(mockContext);

    expect(getSubscriptionPlan).toHaveBeenCalledWith(
      mockEnv.SUBSCRIPTION_PLANS_KV,
      "T123"
    );
    expect(publishAppHome).toHaveBeenCalledWith(
      "U123",
      mockEnv.SLACK_BOT_TOKEN,
      "Free"
    );
    expect(mockContext.text).toHaveBeenCalledWith("OK", 200);
  });

  it("should handle upgrade action", async () => {
    const payload = {
      type: SLACK_BLOCK_ACTIONS,
      actions: [{ action_id: SLACK_ACTION_UPGRADE }],
    };
    mockContext.get.mockReturnValue(payload);
    (upgradeAction as any).mockResolvedValue({ status: "ok" });

    await slackInteractionsRoute(mockContext);

    expect(upgradeAction).toHaveBeenCalled();
    expect(mockContext.json).toHaveBeenCalledWith({ status: "ok" });
  });

  it("should return 400 for unsupported interaction", async () => {
    const payload = {
      type: "unknown_type",
    };
    mockContext.get.mockReturnValue(payload);

    await slackInteractionsRoute(mockContext);

    expect(mockContext.text).toHaveBeenCalledWith(
      "Unsupported interaction",
      400
    );
  });

  it("should return 500 on error", async () => {
    mockContext.get.mockImplementation(() => {
      throw new Error("test error");
    });

    await slackInteractionsRoute(mockContext);

    expect(mockContext.text).toHaveBeenCalledWith("Internal Server Error", 500);
  });
});
