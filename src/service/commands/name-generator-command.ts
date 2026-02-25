export const adjectives = [
  "Quick",
  "Lazy",
  "Happy",
  "Sad",
  "Brave",
  "Clever",
  "Witty",
  "Calm",
  "Bright",
  "Charming",
];
export const nouns = [
  "Fox",
  "Dog",
  "Cat",
  "Mouse",
  "Lion",
  "Tiger",
  "Bear",
  "Wolf",
  "Eagle",
  "Shark",
];

import { CommandHandler, ResponseType } from "@utils/types";

export function generateName(): string {
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdjective}${randomNoun}`;
}

export const generateNameCommandHandler: CommandHandler = {
  name: "random-name",
  responseType: ResponseType.InChannel,
  handle: () => {
    return {
      responseType: ResponseType.InChannel,
      text: generateName(),
    };
  },
};
