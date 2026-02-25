import { jwtDecode } from "jwt-decode";
import { CommandHandler, ResponseType } from "@utils/types";

export function decodeJWT(token: string): any {
  try {
    return jwtDecode(token);
  } catch (error) {
    throw new Error(`Invalid JWT token. Error: ${(error as Error).message}`);
  }
}

export const jwtDecodeCommandHandler: CommandHandler = {
  name: "decode-jwt",
  responseType: ResponseType.InChannel,
  handle: (slackCommandData) => {
    if (slackCommandData.commandArgs.length === 0) {
      throw new Error("Usage: jwt <token>");
    }
    const decoded = decodeJWT(slackCommandData.commandArgs[0]);
    return {
      responseType: ResponseType.InChannel,
      text: JSON.stringify(decoded, null, 2),
    };
  },
};
