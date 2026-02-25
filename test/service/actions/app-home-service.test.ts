import { publishAppHome } from "@service/actions/app-home-service";
import { SLACK_API_BASE_URL } from "@utils/slack-api-types";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("publishAppHome", () => {
  const mockUserId = "U123456";
  const mockSubscriptionPlanName = "Free";
  const mockSlackBotToken = "xoxb-mock-token";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully publish app home view", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: true }),
    });

    const result = await publishAppHome(
      mockUserId,
      mockSubscriptionPlanName,
      mockSlackBotToken
    );

    expect(result).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledWith(
      `${SLACK_API_BASE_URL}/views.publish`,
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockSlackBotToken}`,
        },
      })
    );

    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(requestBody.user_id).toBe(mockUserId);
    expect(requestBody.view.type).toBe("home");
    expect(JSON.stringify(requestBody.view.blocks)).toContain(
      mockSubscriptionPlanName
    );
  });

  it("should throw an error if userId is invalid", async () => {
    await expect(
      publishAppHome("", mockSubscriptionPlanName, mockSlackBotToken)
    ).rejects.toThrow("publishAppHome called with invalid userId");
  });

  it("should throw an error if slack api returns not ok", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ ok: false, error: "invalid_auth" }),
    });

    await expect(
      publishAppHome(mockUserId, mockSubscriptionPlanName, mockSlackBotToken)
    ).rejects.toThrow("Failed to publish app home: invalid_auth");
  });
});
