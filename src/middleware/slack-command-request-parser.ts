import { Context, Next } from "hono";
import { ContextVariables, Env, SlackCommandRequest } from "@utils/types";
import { CTX_SLACK_COMMAND_REQUEST } from "@utils/context-keys";

export const slackCommandRequestParserMiddleware = async (
  c: Context<{ Bindings: Env; Variables: ContextVariables }>,
  next: Next
) => {
  const slackForm = await parseFormData(c);
  c.set(CTX_SLACK_COMMAND_REQUEST, slackForm);
  await next();
};

async function parseFormData(c: Context): Promise<SlackCommandRequest> {
  try {
    const body = await c.req.parseBody();
    console.log("Received form data:", body);
    const user_id = body.user_id as string;
    const team_id = body.team_id as string;
    if (
      user_id == null ||
      team_id == null ||
      typeof user_id !== "string" ||
      typeof team_id !== "string"
    ) {
      throw new Error("Invalid Slack Form data: missing required fields");
    }

    const slackCommandRequest: SlackCommandRequest = {
      user_id,
      team_id,
      token: typeof body.token === "string" ? body.token : undefined,
      team_domain:
        typeof body.team_domain === "string" ? body.team_domain : undefined,
      channel_id:
        typeof body.channel_id === "string" ? body.channel_id : undefined,
      channel_name:
        typeof body.channel_name === "string" ? body.channel_name : undefined,
      user_name:
        typeof body.user_name === "string" ? body.user_name : undefined,
      command: typeof body.command === "string" ? body.command : undefined,
      text: typeof body.text === "string" ? body.text : undefined,
      response_url:
        typeof body.response_url === "string" ? body.response_url : undefined,
      trigger_id:
        typeof body.trigger_id === "string" ? body.trigger_id : undefined,
    };
    return slackCommandRequest;
  } catch (error) {
    console.error("Failed to parse form data:", error);
    throw new Error("Invalid request format");
  }
}
