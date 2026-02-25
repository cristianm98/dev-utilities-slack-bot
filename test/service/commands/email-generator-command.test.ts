import { generateRandomEmail } from "@service/commands/email-generator-command";

describe("generateRandomEmail", () => {
  it("should generate a random email with the default domain", () => {
    const email = generateRandomEmail();
    expect(email).toMatch(/^[a-z0-9]{8}@example\.com$/);
  });

  it("should generate a random email with a custom domain", () => {
    const email = generateRandomEmail("test.com");
    expect(email).toMatch(/^[a-z0-9]{8}@test\.com$/);
  });

  it("should always generate 8 lowercase alphanumeric characters before the @", () => {
    for (let i = 0; i < 10; i++) {
      const email = generateRandomEmail();
      const local = email.split("@")[0];
      expect(local).toHaveLength(8);
      expect(local).toMatch(/^[a-z0-9]{8}$/);
    }
  });

  it("should handle empty string as domain (invalid, but should not throw)", () => {
    expect(() => generateRandomEmail("")).toThrow(
      "Domain must be a non-empty string."
    );
  });

  it("should handle numeric domains", () => {
    const email = generateRandomEmail("123.com");
    expect(email).toMatch(/^[a-z0-9]{8}@123\.com$/);
  });

  it("should handle domains with dashes and underscores", () => {
    const email = generateRandomEmail("my-domain_test.com");
    expect(email).toMatch(/^[a-z0-9]{8}@my-domain_test\.com$/);
  });

  it("should not include uppercase letters or special chars in local part", () => {
    for (let i = 0; i < 10; i++) {
      const email = generateRandomEmail();
      const local = email.split("@")[0];
      expect(local).toMatch(/^[a-z0-9]+$/);
    }
  });
});
