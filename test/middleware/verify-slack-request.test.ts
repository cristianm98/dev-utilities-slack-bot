import { verifySlackRequestMiddleware } from "@middleware/verify-slack-signature-request";
import { verifySlackRequest } from "@utils/slack";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@utils/slack");

describe("verifySlackRequestMiddleware", () => {
  const mockNext = vi.fn();
  let mockContext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext = {
      env: {
        SLACK_VERIFICATION_ENABLED: "true",
        SLACK_SIGNING_SECRET: "secret",
      },
      req: {
        raw: {
          clone: vi.fn(),
        },
      },
      text: vi.fn(),
    };
  });

  it("should skip verification if SLACK_VERIFICATION_ENABLED is 'false'", async () => {
    mockContext.env.SLACK_VERIFICATION_ENABLED = "false";

    await verifySlackRequestMiddleware(mockContext, mockNext);

    expect(verifySlackRequest).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it("should perform verification if SLACK_VERIFICATION_ENABLED is undefined (defaults to true)", async () => {
    mockContext.env.SLACK_VERIFICATION_ENABLED = undefined;
    (verifySlackRequest as any).mockResolvedValue(true);

    await verifySlackRequestMiddleware(mockContext, mockNext);

    expect(verifySlackRequest).toHaveBeenCalledWith(
      mockContext.req.raw,
      mockContext.env
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it("should return 401 if verification fails", async () => {
    (verifySlackRequest as any).mockResolvedValue(false);

    await verifySlackRequestMiddleware(mockContext, mockNext);

    expect(verifySlackRequest).toHaveBeenCalled();
    expect(mockContext.text).toHaveBeenCalledWith("Invalid signature", 401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should proceed if verification succeeds", async () => {
    (verifySlackRequest as any).mockResolvedValue(true);

    await verifySlackRequestMiddleware(mockContext, mockNext);

    expect(verifySlackRequest).toHaveBeenCalled();
    expect(mockContext.text).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});
