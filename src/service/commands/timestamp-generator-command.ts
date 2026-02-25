import { CommandHandler, ResponseType } from "@utils/types";

export function timestampCommand(args: string[]): string {
  const unit = args[0]?.toLowerCase() || "milliseconds";
  const now = Date.now();
  if (unit.startsWith("nano")) {
    return (now * 1_000_000).toString();
  }
  return now.toString();
}

export const timestampCommandHandler: CommandHandler = {
  name: "timestamp",
  responseType: ResponseType.InChannel,
  handle: (slackCommandData) => {
    return {
      responseType: ResponseType.InChannel,
      text: timestampCommand(slackCommandData.commandArgs),
    };
  },
};
