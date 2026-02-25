import { upgradeAction } from "@service/actions/upgrade-action-service";
import { SLACK_ACTION_UPGRADE } from "@utils/context-keys";
import { signUpgradeToken } from "@utils/jwt";
import { isSlackAdmin } from "@utils/slack";
import { SLACK_API_BASE_URL } from "@utils/slack-api-types";
import { describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@utils/jwt", () => ({
  signUpgradeToken: vi.fn(),
}));
vi.mock("@utils/slack");

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("upgradeAction", () => {
  const mockJwtSigningSecret = "mock-secret";
  const mockSlackBotToken = "mock-bot-token";
  const mockUpgradeBaseUrl = "https://example.com/upgrade";
  const mockIssuer = "mock-issuer";
  const mockAudience = "mock-audience";

  const mockInteractionRequest = {
    trigger_id: "mock-trigger-id",
    team: { id: "workspace-id" },
    user: { id: "user-id" },
    actions: [{ action_id: SLACK_ACTION_UPGRADE }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true }),
    });
    (signUpgradeToken as any).mockResolvedValue("mock-jwt-token");
  });

  it("should open an upgrade modal with plan options for admin users", async () => {
    (isSlackAdmin as any).mockResolvedValue(true);

    await upgradeAction(
      mockInteractionRequest as any,
      mockJwtSigningSecret,
      mockSlackBotToken,
      mockUpgradeBaseUrl,
      mockIssuer,
      mockAudience
    );

    expect(isSlackAdmin).toHaveBeenCalledWith("user-id", mockSlackBotToken);

    // Expect two calls to signUpgradeToken
    expect(signUpgradeToken).toHaveBeenCalledTimes(2);

    // Call for Pro
    expect(signUpgradeToken).toHaveBeenCalledWith(
      expect.objectContaining({
        iss: mockIssuer,
        aud: mockAudience,
        workspaceId: "workspace-id",
        userId: "user-id",
        priceId: "price_1SRbpgGqAfrtTu8eUQ0UuRXG",
        subscriptionPlan: "pro",
      }),
      mockJwtSigningSecret
    );

    // Call for Ultimate
    expect(signUpgradeToken).toHaveBeenCalledWith(
      expect.objectContaining({
        iss: mockIssuer,
        aud: mockAudience,
        workspaceId: "workspace-id",
        userId: "user-id",
        priceId: "price_1SRboLGqAfrtTu8ecmG54rMa",
        subscriptionPlan: "ultimate",
      }),
      mockJwtSigningSecret
    );

    expect(mockFetch).toHaveBeenCalledWith(
      `${SLACK_API_BASE_URL}/views.open`,
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockSlackBotToken}`,
        },
        body: expect.stringContaining("modal"),
      })
    );

    const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
    const view = JSON.parse(callArgs.view);
    expect(callArgs.trigger_id).toBe("mock-trigger-id");
    expect(view.type).toBe("modal");
    expect(view.title.text).toBe("Upgrade Utilio");

    // Check for plan buttons
    // The new structure has sections with accessories
    const proSection = view.blocks.find(
      (b: any) => b.text && b.text.text.includes("Pro Plan")
    );
    expect(proSection).toBeDefined();
    expect(proSection.accessory.type).toBe("button");
    expect(proSection.accessory.url).toBe(
      `${mockUpgradeBaseUrl}?token=mock-jwt-token`
    );

    const ultimateSection = view.blocks.find(
      (b: any) => b.text && b.text.text.includes("Ultimate Plan")
    );
    expect(ultimateSection).toBeDefined();
    expect(ultimateSection.accessory.type).toBe("button");
    expect(ultimateSection.accessory.url).toBe(
      `${mockUpgradeBaseUrl}?token=mock-jwt-token`
    );
  });

  it("should open an access denied modal for non-admin users", async () => {
    (isSlackAdmin as any).mockResolvedValue(false);

    await upgradeAction(
      mockInteractionRequest as any,
      mockJwtSigningSecret,
      mockSlackBotToken,
      mockUpgradeBaseUrl,
      mockIssuer,
      mockAudience
    );

    expect(isSlackAdmin).toHaveBeenCalledWith("user-id", mockSlackBotToken);
    expect(signUpgradeToken).not.toHaveBeenCalled();

    expect(mockFetch).toHaveBeenCalledWith(
      `${SLACK_API_BASE_URL}/views.open`,
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockSlackBotToken}`,
        },
        body: expect.stringContaining("modal"),
      })
    );

    const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
    const view = JSON.parse(callArgs.view);
    expect(callArgs.trigger_id).toBe("mock-trigger-id");
    expect(view.type).toBe("modal");
    expect(view.title.text).toBe("Upgrade Utilio");
    expect(JSON.stringify(view.blocks)).toContain("must be a workspace admin");
  });

  it("should return error if trigger_id is missing", async () => {
    const requestWithoutTriggerId = {
      ...mockInteractionRequest,
      trigger_id: undefined,
    };
    const result = await upgradeAction(
      requestWithoutTriggerId as any,
      mockJwtSigningSecret,
      mockSlackBotToken,
      mockUpgradeBaseUrl,
      mockIssuer,
      mockAudience
    );

    expect(result).toEqual({
      text: "Internal error while upgrading subscription.",
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
