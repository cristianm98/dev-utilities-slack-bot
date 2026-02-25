import { CONTENT_TYPES, SlackOAuthResponse } from "@utils/types";

export async function getSlackAccessResponse(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<SlackOAuthResponse | null> {
  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: {
      "Content-Type": CONTENT_TYPES.FORM,
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  return await response.json();
}

export async function setupNewWorkspace(
  utilioDb: D1Database,
  data: {
    workspaceId: string;
    workspaceName: string;
    botToken: string;
    installedBy: string | null;
  }
) {
  try {
    // Collect statements
    const stmt1 = buildStoreWorkspaceStatement(
      utilioDb,
      data.workspaceId,
      data.workspaceName,
      data.botToken,
      data.installedBy
    );

    const stmt2 = buildCreateSubscriptionStatement(utilioDb, data.workspaceId);
    const results = await utilioDb.batch([stmt1, stmt2]);

    return {
      success: true,
      results,
    };
  } catch (e: any) {
    console.error("Atomic Batch Failed:", e.message);
    return {
      success: false,
      error: e.message,
    };
  }
}

function buildStoreWorkspaceStatement(
  d1: D1Database,
  workspaceId: string,
  workspaceName: string,
  botToken: string,
  installedBy: string | null
) {
  const now = new Date().toISOString();
  return d1
    .prepare(
      `
    INSERT INTO workspaces (
      workspace_id,
      workspace_name,
      bot_token,
      installed_by,
      installed_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(workspace_id) DO UPDATE SET
      bot_token = excluded.bot_token,
      workspace_name = excluded.workspace_name,
      updated_at = excluded.updated_at
    `
    )
    .bind(workspaceId, workspaceName, botToken, installedBy, now, now);
}

function buildCreateSubscriptionStatement(d1: D1Database, workspaceId: string) {
  const now = new Date().toISOString();
  return d1
    .prepare(
      `
    INSERT INTO subscriptions (
      team_id, 
      plan, 
      plan_status, 
      stripe_customer_id, 
      stripe_subscription_id, 
      subscription_current_period_end, 
      created_at, 
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(team_id) DO UPDATE SET
      plan = COALESCE(excluded.plan, plan),
      plan_status = excluded.plan_status,
      updated_at = excluded.updated_at
    `
    )
    .bind(workspaceId, "FREE", "active", null, null, null, now, now);
}
