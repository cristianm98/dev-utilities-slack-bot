import { Context, Next } from "hono";
import { ContextVariables, Env } from "@utils/types";
import { verifySlackRequest } from "@utils/slack";

export const verifySlackRequestMiddleware = async (
  c: Context<{ Bindings: Env; Variables: ContextVariables }>,
  next: Next
) => {
  const isVerificationEnabled = c.env.SLACK_VERIFICATION_ENABLED !== "false";

  if (!isVerificationEnabled) {
    await next();
    return;
  }

  const isValid = await verifySlackRequest(c.req.raw, c.env);

  if (!isValid) {
    console.error("Invalid Slack signature");
    return c.text("Invalid signature", 401);
  }

  await next();
};
