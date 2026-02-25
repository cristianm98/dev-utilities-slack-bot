import { CommandHandler, ResponseType } from "@utils/types";

export function helpCommand(): string {
  return `Utilio - Developer utilities without leaving Slack 🚀

Available commands:
  /utilio help — 📖 Show this message
  /utilio encode [text] — 🔐 Base64 encode text
  /utilio decode [text] — 🗝️ Base64 decode text
  /utilio hash [text] [algorithm] — 🧩 Hash text with sha256|sha1|md5
  /utilio uuid — 🎲 Generate v4 UUID
  /utilio timestamp [milliseconds|nanoseconds] — ⏱️ Current timestamp
  /utilio parse-cron [expression] — 📅 Human-readable cron description
  /utilio generate-email [domain] — ✉️ Generate a random email (default example.com)
  /utilio decode-jwt [token] — 🔓 Decode a JWT and print payload
  /utilio random-name — 📝 Generate a random adjective+noun name
  /utilio random-string <length> [uppercase] [lowercase] [numbers] [special] — 🎲 Generate a random string`;
}

export const helpCommandHandler: CommandHandler = {
  name: "help",
  responseType: ResponseType.InChannel,
  handle: () => {
    return {
      responseType: ResponseType.InChannel,
      text: helpCommand(),
    };
  },
};
