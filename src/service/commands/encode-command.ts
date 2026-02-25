import { CommandHandler, ResponseType } from "@utils/types";

export function encodeCommand(args: string[]): string {
  return Buffer.from(args.join(" "), "utf-8").toString("base64");
}

export const encodeCommandHandler: CommandHandler = {
  name: "encode",
  responseType: ResponseType.InChannel,
  handle: (slackCommandData) => {
    return {
      responseType: ResponseType.InChannel,
      text: encodeCommand(slackCommandData.commandArgs),
    };
  },
};
