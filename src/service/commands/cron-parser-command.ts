import cronstrue from "cronstrue";
import { CommandHandler, ResponseType } from "@utils/types";

export function parseCronExpression(expression: string): string {
  try {
    return cronstrue.toString(expression, { use24HourTimeFormat: true });
  } catch (error) {
    throw new Error(`Unable to parse the cron expression: ${expression}.`);
  }
}

export const parseCronCommandHandler: CommandHandler = {
  name: "parse-cron",
  responseType: ResponseType.InChannel,
  handle: (slackCommandData) => {
    if (slackCommandData.commandArgs.length === 0) {
      throw new Error("Usage: cron-parser <cron_expression>");
    }
    return {
      responseType: ResponseType.InChannel,
      text: parseCronExpression(slackCommandData.commandArgs[0]),
    };
  },
};
