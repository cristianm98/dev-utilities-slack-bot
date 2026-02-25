import {
  adjectives,
  generateName,
  nouns,
} from "@service/commands/name-generator-command";

describe("generateName", () => {
  it("should return a string that is a concatenation of an adjective and a noun", () => {
    const name = generateName();
    const regex = new RegExp(`^(${adjectives.join("|")})(${nouns.join("|")})$`);
    expect(name).toMatch(regex);
  });

  it("should generate different names on multiple calls", () => {
    const names = new Set(Array.from({ length: 20 }, () => generateName()));
    expect(names.size).toBeGreaterThan(1);
  });

  it("should always start with a valid adjective", () => {
    for (let i = 0; i < 20; i++) {
      const name = generateName();
      const found = adjectives.some((adj) => name.startsWith(adj));
      expect(found).toBe(true);
    }
  });

  it("should always end with a valid noun", () => {
    for (let i = 0; i < 20; i++) {
      const name = generateName();
      const found = nouns.some((noun) => name.endsWith(noun));
      expect(found).toBe(true);
    }
  });

  it("should generate all possible combinations over many calls", () => {
    // This is probabilistic, but with 2000 tries, most combos should appear
    const combos = new Set();
    for (let i = 0; i < 2000; i++) {
      combos.add(generateName());
    }
    expect(combos.size).toBeGreaterThan(50); // 10x10=100 possible
  });
});
