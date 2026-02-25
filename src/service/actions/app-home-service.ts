import { getSubscriptionPlan } from "@service/subscription-service";
import { SLACK_ACTION_UPGRADE } from "@utils/context-keys";
import {
  ViewsPublishResponse,
  SLACK_API_BASE_URL,
} from "@utils/slack-api-types";

export async function publishAppHome(
  userId: string,
  subscriptionPlanName: string,
  slackBotToken: string
): Promise<ViewsPublishResponse> {
  const isValidUserId = !userId || typeof userId !== "string";
  if (isValidUserId) {
    const errorMessage = `publishAppHome called with invalid userId: ${userId}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const responseData: ViewsPublishResponse = await publishHomeView(
    slackBotToken,
    userId,
    subscriptionPlanName
  );
  if (!responseData.ok) {
    console.error("Error publishing app home:", responseData.error);
    throw new Error(`Failed to publish app home: ${responseData.error}`);
  }

  return responseData;
}
async function publishHomeView(
  slackBotToken: string,
  userId: string,
  subscriptionPlanName: string
) {
  const view = {
    type: "home",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Welcome to Utilio! The ultimate Slack developer utilities.",
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `You are currently on the ${subscriptionPlanName} plan. Please follow the link below to upgrade your subscription and unlock more features!`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Upgrade Plan",
            },
            style: "primary",
            action_id: SLACK_ACTION_UPGRADE,
          },
        ],
      },
    ],
  };

  const publishHomeViewArgs = {
    token: slackBotToken,
    user_id: userId,
    view: view,
  };

  const response = await fetch(`${SLACK_API_BASE_URL}/views.publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${slackBotToken}`,
    },
    body: JSON.stringify(publishHomeViewArgs),
  });

  const responseData: ViewsPublishResponse = await response.json();
  return responseData;
}
