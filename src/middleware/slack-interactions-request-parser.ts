import { Context, Env, Next } from "hono";
import { ContextVariables, SlackInteractionRequest } from "@utils/types";
import { CTX_SLACK_INTERACTION_REQUEST } from "@utils/context-keys";

export const slackInteractionRequestParserMiddleware = async (
  c: Context<{ Bindings: Env; Variables: ContextVariables }>,
  next: Next
) => {
  try {
    const slackForm = await parseRequestBody(c);
    c.set(CTX_SLACK_INTERACTION_REQUEST, slackForm);
    await next();
  } catch (error: any) {
    console.error("Error parsing slack interaction request", error);
    return c.json({ error: error.message || "Bad Request" }, 400);
  }
};

async function parseRequestBody(c: Context): Promise<SlackInteractionRequest> {
  const body = await c.req.parseBody();
  console.log("Received interactions request body:", body);

  if (body.payload == null || typeof body.payload !== "string") {
    throw new Error("Invalid Slack interaction request: missing payload");
  }

  return JSON.parse(body.payload as string);
}
