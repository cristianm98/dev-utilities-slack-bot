import {
  getSlackAccessResponse,
  setupNewWorkspace,
} from "@service/oauth/oauth-service";
import { Env } from "@utils/types";
import { Context } from "hono";

export async function slackOAuthCallbackRoute(c: Context<{ Bindings: Env }>) {
  const code = c.req.query("code");

  if (!code) {
    const errMsg = "Missing OAuth code";
    console.error(errMsg);
    return c.text(errMsg, 400);
  }

  const slackAccessResponse = await getSlackAccessResponse(
    code,
    c.env.SLACK_CLIENT_ID,
    c.env.SLACK_CLIENT_SECRET,
    c.env.SLACK_OAUTH_REDIRECT_URI
  );

  if (!slackAccessResponse || !slackAccessResponse.ok) {
    const errMsg = "Slack OAuth error: ";
    console.error(errMsg, slackAccessResponse);
    return c.text(errMsg, 500);
  }
  const workspaceData = {
    workspaceId: slackAccessResponse.team.id,
    workspaceName: slackAccessResponse.team.name,
    botToken: slackAccessResponse.access_token,
    installedBy: slackAccessResponse.authed_user?.id || null,
  };
  const setupStatus = await setupNewWorkspace(c.env.UTILIO_DB, workspaceData);
  if (!setupStatus.success) {
    const errMsg = "Workspace setup error: ";
    console.error(errMsg, setupStatus.error);
    return c.text(errMsg, 500);
  }

  return c.redirect(c.env.SLACK_OAUTH_REDIRECT_URI);
}
