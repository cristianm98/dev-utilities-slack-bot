import { helpCommand } from "@service/commands/help-command";
import {
  CommandHandler,
  ResponseType,
  SlackCommandData,
  SlackCommandHandlerResult,
} from "@utils/types";
import { parseCronCommandHandler } from "@service/commands/cron-parser-command";
import { decodeCommandHandler } from "@service/commands/decode-command";
import { generateEmailCommandHandler } from "@service/commands/email-generator-command";
import { encodeCommandHandler } from "@service/commands/encode-command";
import { hashCommandHandler } from "@service/commands/hash-command";
import { helpCommandHandler } from "@service/commands/help-command";
import { jwtDecodeCommandHandler } from "@service/commands/jwt-decode-command";
import { generateNameCommandHandler } from "@service/commands/name-generator-command";
import { generateRandomStringCommandHandler } from "@service/commands/random-string-generator-command";
import { timestampCommandHandler } from "@service/commands/timestamp-generator-command";
import { uuidCommandHandler } from "@service/commands/uuidv4-generator-command";
import { upgradeCommandHandler } from "./upgrade-command";

class CommandCoordinator {
  private commands: Map<string, CommandHandler> = new Map();

  register(handler: CommandHandler): this {
    this.commands.set(handler.name.toLowerCase(), handler);
    return this;
  }

  async execute(
    slackCommandData: SlackCommandData
  ): Promise<SlackCommandHandlerResult> {
    console.log(slackCommandData);
    const handler = this.commands.get(
      slackCommandData.commandName.toLowerCase()
    );

    if (!handler) {
      return {
        responseType: ResponseType.InChannel,
        text: `Unknown command: ${slackCommandData.commandName}\n\n${helpCommand()}`,
      };
    }

    try {
      const commandResult = await handler.handle(slackCommandData);
      return commandResult;
    } catch (e: any) {
      return e.message;
    }
  }
}

const commandHandlerRegistry = new CommandCoordinator()
  .register(helpCommandHandler)
  .register(encodeCommandHandler)
  .register(decodeCommandHandler)
  .register(hashCommandHandler)
  .register(uuidCommandHandler)
  .register(timestampCommandHandler)
  .register(parseCronCommandHandler)
  .register(generateEmailCommandHandler)
  .register(jwtDecodeCommandHandler)
  .register(generateNameCommandHandler)
  .register(generateRandomStringCommandHandler)
  .register(upgradeCommandHandler);
export { commandHandlerRegistry };
