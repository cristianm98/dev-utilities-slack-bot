import { SLACK_ACTION_UPGRADE } from "@utils/context-keys";
import { signUpgradeToken } from "@utils/jwt";
import { isSlackAdmin } from "@utils/slack";
import { SLACK_API_BASE_URL, ViewsOpenResponse } from "@utils/slack-api-types";
import { SlackInteractionRequest } from "@utils/types";

const internalErrorMessage = "Internal error while upgrading subscription.";

export async function upgradeAction(
  slackInteractionRequest: SlackInteractionRequest,
  jwtSigningSecret: string,
  slackBotToken: string,
  upgradeBaseUrl: string,
  issuer: string,
  audience: string
) {
  const actionId = slackInteractionRequest.actions?.[0]?.action_id;
  if (actionId !== SLACK_ACTION_UPGRADE) {
    console.error(`upgradeAction called with unknown action_id: ${actionId}`);
    return { text: internalErrorMessage };
  }

  const triggerId = slackInteractionRequest.trigger_id;
  if (!triggerId) {
    console.error("Missing trigger_id in interaction request");
    return { text: "Internal error while upgrading subscription." };
  }

  const workspaceId = slackInteractionRequest.team?.id;
  const userId = slackInteractionRequest.user?.id;

  if (!workspaceId || !userId) {
    console.error(
      `Missing workspaceId or userId. workspaceId: ${workspaceId}, userId: ${userId}`
    );
    return { text: internalErrorMessage };
  }

  const isAdmin = await isSlackAdmin(userId, slackBotToken);
  if (!isAdmin) {
    await openAccessDeniedModal(slackBotToken, triggerId);
    return;
  }

  if (!jwtSigningSecret) {
    console.error("JWT signing secret is missing or empty.");
    return { text: internalErrorMessage };
  }

  // Generate short-lived JWT for Pro
  const upgradeActionJwtPro = await signUpgradeToken(
    {
      iss: issuer,
      aud: audience,
      workspaceId: workspaceId,
      userId: userId,
      priceId: "price_1SRbpgGqAfrtTu8eUQ0UuRXG", // TODO select price id also based on billing period
      subscriptionPlan: "pro",
    },
    jwtSigningSecret
  );

  // Generate short-lived JWT for Ultimate
  const upgradeActionJwtUltimate = await signUpgradeToken(
    {
      iss: issuer,
      aud: audience,
      workspaceId: workspaceId,
      userId: userId,
      priceId: "price_1SRboLGqAfrtTu8ecmG54rMa", // TODO select price id also based on billing period
      subscriptionPlan: "ultimate",
    },
    jwtSigningSecret
  );

  const responseData: ViewsOpenResponse = await openCheckoutRedirectModal(
    upgradeBaseUrl,
    upgradeActionJwtPro,
    upgradeActionJwtUltimate,
    slackBotToken,
    triggerId
  );

  if (!responseData.ok) {
    console.error("Error opening upgrade modal:", responseData.error);
    return { text: internalErrorMessage };
  }

  return responseData;
}
async function openAccessDeniedModal(slackBotToken: string, triggerId: any) {
  const accessDeniedView = {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Upgrade Utilio",
    },
    close: {
      type: "plain_text",
      text: "Close",
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: ":warning: You must be a workspace admin to upgrade Utilio.",
        },
      },
    ],
  };

  const openViewArgs = {
    token: slackBotToken,
    trigger_id: triggerId,
    view: JSON.stringify(accessDeniedView),
  };

  await fetch(`${SLACK_API_BASE_URL}/views.open`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${slackBotToken}`,
    },
    body: JSON.stringify(openViewArgs),
  });
}

async function openCheckoutRedirectModal(
  upgradeBaseUrl: string,
  upgradeActionJwtPro: string,
  upgradeActionJwtUltimate: string,
  slackBotToken: string,
  triggerId: any
) {
  const upgradeUrlPro = `${upgradeBaseUrl}?token=${encodeURIComponent(
    upgradeActionJwtPro
  )}`;
  const upgradeUrlUltimate = `${upgradeBaseUrl}?token=${encodeURIComponent(
    upgradeActionJwtUltimate
  )}`;

  const view = {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Upgrade Utilio",
    },
    close: {
      type: "plain_text",
      text: "Cancel",
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Ready to upgrade Utilio? Choose your plan:*",
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Pro Plan*\nUnlock advanced features.",
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Select Pro",
          },
          style: "primary",
          url: upgradeUrlPro,
          action_id: "upgrade_checkout_pro",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Ultimate Plan*\nGet everything.",
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Select Ultimate",
          },
          style: "primary",
          url: upgradeUrlUltimate,
          action_id: "upgrade_checkout_ultimate",
        },
      },
    ],
  };

  const openViewArgs = {
    token: slackBotToken,
    trigger_id: triggerId,
    view: JSON.stringify(view),
  };

  // Publish the modal using views.open
  const response = await fetch(`${SLACK_API_BASE_URL}/views.open`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${slackBotToken}`,
    },
    body: JSON.stringify(openViewArgs),
  });

  const responseData: ViewsOpenResponse = await response.json();
  return responseData;
}
