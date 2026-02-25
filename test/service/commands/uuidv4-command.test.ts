import { uuidCommand } from "@service/commands/uuidv4-generator-command";

describe("uuidv4Command", () => {
  it("should generate a valid UUID v4", () => {
    const uuid = uuidCommand();
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidV4Regex.test(uuid)).toBe(true);
  });
});
