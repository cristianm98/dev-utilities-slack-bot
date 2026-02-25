import { Context } from "hono";
import { ContextVariables, Env, SlackCommandRequest } from "@utils/types";
import { helpCommand } from "@service/commands/help-command";
import { commandHandlerRegistry } from "@service/commands/command-coordinator";
import { CTX_SLACK_COMMAND_REQUEST } from "../utils/context-keys";

export async function slackCommandRoute(
  c: Context<{ Bindings: Env; Variables: ContextVariables }>
) {
  try {
    const formData = c.get(CTX_SLACK_COMMAND_REQUEST) as SlackCommandRequest;
    const text = (formData.text || "").trim();

    if (!text) {
      return c.text(helpCommand());
    }

    const [command, ...args] = text.split(/\s+/);
    const slackCommandData = {
      commandName: command,
      commandArgs: args,
      userId: formData.user_id,
      slackBotToken: c.env.SLACK_BOT_TOKEN,
      subscriptionsWorkerUrl: c.env.UPGRADE_URL,
    };
    const result = await commandHandlerRegistry.execute(slackCommandData);

    return c.json({
      response_type: result.responseType,
      text: result.text,
      blocks: result.blocks,
    });
  } catch (error) {
    console.error("Error in slack commands api:", error);
    return c.text("Internal Server Error", 500);
  }
}
