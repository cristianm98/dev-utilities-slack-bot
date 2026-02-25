import { randomUUID } from "crypto";
import { CommandHandler, ResponseType } from "@utils/types";

export function uuidCommand(): string {
  return randomUUID();
}

export const uuidCommandHandler: CommandHandler = {
  name: "uuid",
  responseType: ResponseType.InChannel,
  handle: () => {
    return {
      responseType: ResponseType.InChannel,
      text: uuidCommand(),
    };
  },
};
