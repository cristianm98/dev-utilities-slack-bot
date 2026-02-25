import { CommandHandler, ResponseType } from "@utils/types";

export async function hashCommand(args: string[]): Promise<string> {
  const [input, algo = "sha256"] = args;
  if (!input) return "Usage: /utilio hash [text] [algorithm]";

  switch (algo.toLowerCase()) {
    case "sha1":
      return await subtleHash(input, "SHA-1");
    case "md5":
      return md5Hash(input);
    case "sha256":
    default:
      return await subtleHash(input, "SHA-256");
  }
}

async function subtleHash(
  input: string,
  algorithm: "SHA-1" | "SHA-256"
): Promise<string> {
  const buf = await crypto.subtle.digest(
    algorithm,
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// MD5 must be implemented manually (Workers SubtleCrypto doesn’t support MD5)
function md5Hash(input: string): string {
  const { createHash } = require("crypto"); // nodejs_compat flag required
  return createHash("md5").update(input).digest("hex");
}

export const hashCommandHandler: CommandHandler = {
  name: "hash",
  responseType: ResponseType.InChannel,
  handle: async (slackCommandData) => {
    return {
      responseType: ResponseType.InChannel,
      text: await hashCommand(slackCommandData.commandArgs),
    };
  },
};
