import { CommandHandler, ResponseType } from "@utils/types";

interface RandomStringOptions {
  length: number;
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  special?: boolean;
}

export function generateRandomString(options: RandomStringOptions): string {
  const {
    length,
    uppercase = true,
    lowercase = true,
    numbers = true,
    special = false,
  } = options;

  if (length <= 0) {
    throw new Error("Length must be a positive integer.");
  }

  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const specialChars = "!@#$%^&*()_+[]{}|;:,.<>?";

  let characters = "";

  if (uppercase) characters += uppercaseChars;
  if (lowercase) characters += lowercaseChars;
  if (numbers) characters += numberChars;
  if (special) characters += specialChars;

  if (!characters) {
    throw new Error("At least one character set must be selected.");
  }

  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}

export const generateRandomStringCommandHandler: CommandHandler = {
  name: "random-string",
  responseType: ResponseType.InChannel,
  handle: (slackCommandData) => {
    const args = slackCommandData.commandArgs;
    if (args.length === 0) {
      throw new Error(
        "Usage: random-string <length> [uppercase] [lowercase] [numbers] [special]"
      );
    }

    const length = parseInt(args[0], 10);
    if (isNaN(length) || length < 0) {
      throw new Error("Length must be a non-negative integer.");
    }

    const opts = {
      length,
      uppercase: args[1] !== undefined ? args[1] === "true" : true,
      lowercase: args[2] !== undefined ? args[2] === "true" : true,
      numbers: args[3] !== undefined ? args[3] === "true" : true,
      special: args[4] !== undefined ? args[4] === "true" : true,
    };

    return {
      responseType: ResponseType.InChannel,
      text: generateRandomString(opts),
    };
  },
};
