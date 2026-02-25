import { slackCommandRoute } from "@routes/slack-commands-route";
import { commandHandlerRegistry } from "@service/commands/command-coordinator";
import { helpCommand } from "@service/commands/help-command";
import { CTX_SLACK_COMMAND_REQUEST } from "@utils/context-keys";
import { ResponseType } from "@utils/types";
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@service/commands/command-coordinator", () => ({
  commandHandlerRegistry: {
    execute: vi.fn(),
  },
}));

vi.mock("@service/commands/help-command", () => ({
  helpCommand: vi.fn(),
}));

describe("slackCommandRoute", () => {
  const mockEnv = {
    SLACK_BOT_TOKEN: "mock-bot-token",
    UTILIO_SUBSCRIPTIONS_WORKER_URL: "mock-worker-url",
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

  it("should return help command if text is empty", async () => {
    const payload = {
      text: "",
      user_id: "U123",
    };
    mockContext.get.mockReturnValue(payload);
    (helpCommand as any).mockReturnValue("Help Message");

    await slackCommandRoute(mockContext);

    expect(mockContext.get).toHaveBeenCalledWith(CTX_SLACK_COMMAND_REQUEST);
    expect(helpCommand).toHaveBeenCalled();
    expect(mockContext.text).toHaveBeenCalledWith("Help Message");
    expect(commandHandlerRegistry.execute).not.toHaveBeenCalled();
  });

  it("should return help command if text is only whitespace", async () => {
    const payload = {
      text: "   ",
      user_id: "U123",
    };
    mockContext.get.mockReturnValue(payload);
    (helpCommand as any).mockReturnValue("Help Message");

    await slackCommandRoute(mockContext);

    expect(helpCommand).toHaveBeenCalled();
    expect(mockContext.text).toHaveBeenCalledWith("Help Message");
  });

  it("should execute command and return result", async () => {
    const payload = {
      text: "encode hello",
      user_id: "U123",
    };
    mockContext.get.mockReturnValue(payload);
    
    const executionResult = {
      responseType: ResponseType.Ephemeral,
      text: "Encoded: ...",
      blocks: [],
    };
    (commandHandlerRegistry.execute as any).mockResolvedValue(executionResult);

    await slackCommandRoute(mockContext);

    expect(commandHandlerRegistry.execute).toHaveBeenCalledWith({
      commandName: "encode",
      commandArgs: ["hello"],
      userId: "U123",
      slackBotToken: mockEnv.SLACK_BOT_TOKEN,
      subscriptionsWorkerUrl: mockEnv.UTILIO_SUBSCRIPTIONS_WORKER_URL,
    });

    expect(mockContext.json).toHaveBeenCalledWith({
      response_type: executionResult.responseType,
      text: executionResult.text,
      blocks: executionResult.blocks,
    });
  });

  it("should handle arguments correctly", async () => {
    const payload = {
      text: "uuid v4 5",
      user_id: "U123",
    };
    mockContext.get.mockReturnValue(payload);
    (commandHandlerRegistry.execute as any).mockResolvedValue({});

    await slackCommandRoute(mockContext);

    expect(commandHandlerRegistry.execute).toHaveBeenCalledWith(expect.objectContaining({
      commandName: "uuid",
      commandArgs: ["v4", "5"],
    }));
  });

  it("should return 500 on error", async () => {
    mockContext.get.mockImplementation(() => {
      throw new Error("Test Error");
    });

    await slackCommandRoute(mockContext);

    expect(mockContext.text).toHaveBeenCalledWith("Internal Server Error", 500);
  });
});
