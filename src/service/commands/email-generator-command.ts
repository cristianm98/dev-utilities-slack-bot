import { CommandHandler, ResponseType, SlackCommandData } from "@utils/types";

export function generateRandomEmail(domain: string = "example.com"): string {
  if (!domain) {
    throw new Error("Domain must be a non-empty string.");
  }
  const randomString = Math.random().toString(36).substring(2, 10);
  return `${randomString}@${domain}`;
}

export const generateEmailCommandHandler: CommandHandler = {
  name: "generate-email",
  responseType: ResponseType.InChannel,
  handle: (slackCommandData) => {
    const domain = slackCommandData.commandArgs[0] || undefined;
    return {
      responseType: ResponseType.InChannel,
      text: generateRandomEmail(domain),
    };
  },
};
