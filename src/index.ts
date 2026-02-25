import { Hono } from "hono";
import { slackCommandRequestParserMiddleware } from "./middleware/slack-command-request-parser";
import { slackInteractionRequestParserMiddleware } from "./middleware/slack-interactions-request-parser";
import { slackCommandRoute as slackCommandsRoute } from "./routes/slack-commands-route";
import { slackInteractionsRoute } from "./routes/slack-interactions-route";
import { Env } from "./utils/types";
import { rateLimiterMiddleware } from "@middleware/rate-limiter";
import { verifySlackRequestMiddleware } from "@middleware/verify-slack-signature-request";
import { slackOAuthCallbackRoute } from "@routes/slack-oauth-callback-route";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/slack/oauth/callback", slackOAuthCallbackRoute);

app.post(
  "/api/slack/commands",
  verifySlackRequestMiddleware,
  slackCommandRequestParserMiddleware,
  rateLimiterMiddleware,
  slackCommandsRoute
);

app.post(
  "/api/slack/interactions",
  verifySlackRequestMiddleware,
  slackInteractionRequestParserMiddleware,
  slackInteractionsRoute
);

export default app;
