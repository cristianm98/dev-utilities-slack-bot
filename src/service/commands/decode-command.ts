import { CommandHandler, ResponseType } from "@utils/types";

export function decodeCommand(args: string[]): string {
  if (args.length === 0) return "";
  try {
    const decoded = args
      .map((arg) => {
        try {
          // Check if arg is valid base64 by decoding and re-encoding
          const buf = Buffer.from(arg, "base64");
          // If the input is not valid base64, re-encoding won't match (ignoring padding)
          const normalizedInput = arg.replace(/=+$/, "");
          const normalizedOutput = buf.toString("base64").replace(/=+$/, "");
          if (normalizedInput !== normalizedOutput) throw new Error();
          return buf.toString("utf-8");
        } catch {
          throw new Error();
        }
      })
      .join(" ");
    return decoded;
  } catch {
    return "Invalid Base64 input";
  }
}

export const decodeCommandHandler: CommandHandler = {
  name: "decode",
  responseType: ResponseType.InChannel,
  handle: (slackCommandData) => {
    return {
      responseType: ResponseType.InChannel,
      text: decodeCommand(slackCommandData.commandArgs),
    };
  },
};
