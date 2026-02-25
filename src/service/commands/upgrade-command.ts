import { isSlackAdmin } from "@utils/slack";
import { CommandHandler, ResponseType } from "@utils/types";

export async function upgradeCommand(
  userId: string,
  slackBotToken: string,
  subscriptionsWorkerUrl: string
): Promise<any> {
  if (!userId || !slackBotToken) {
    return "Invalid request";
  }

  const isAdmin = await isSlackAdmin(userId, slackBotToken);

  if (!isAdmin) {
    return "❌ This command is restricted to Slack admins.";
  }

  const upgradeBlockKit = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Please follow the link below to upgrade your subscription plan.",
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Upgrade",
            emoji: true,
          },
          url: `${subscriptionsWorkerUrl}/subscribe?slackUserId=${userId}`,
          style: "primary",
        },
      ],
    },
  ];
  console.log("Upgrade block:", JSON.stringify(upgradeBlockKit));
  return upgradeBlockKit;
}

export const upgradeCommandHandler: CommandHandler = {
  name: "upgrade",
  responseType: ResponseType.Ephemeral,
  handle: async (slackCommandData) => {
    return {
      responseType: ResponseType.Ephemeral,
      blocks: await upgradeCommand(
        slackCommandData.userId,
        slackCommandData.slackBotToken ?? "",
        slackCommandData.subscriptionsWorkerUrl
      ),
    };
  },
};
