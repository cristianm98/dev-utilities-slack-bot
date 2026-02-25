import { generateRandomString } from "@service/commands/random-string-generator-command";

describe("generateRandomString", () => {
  it("should generate a string of the specified length", () => {
    expect(generateRandomString({ length: 16 })).toHaveLength(16);
    expect(generateRandomString({ length: 1 })).toHaveLength(1);
    expect(generateRandomString({ length: 32 })).toHaveLength(32);
  });

  it("should only use uppercase letters if only uppercase is true", () => {
    const str = generateRandomString({
      length: 20,
      uppercase: true,
      lowercase: false,
      numbers: false,
      special: false,
    });
    expect(str).toMatch(/^[A-Z]+$/);
  });

  it("should only use lowercase letters if only lowercase is true", () => {
    const str = generateRandomString({
      length: 20,
      uppercase: false,
      lowercase: true,
      numbers: false,
      special: false,
    });
    expect(str).toMatch(/^[a-z]+$/);
  });

  it("should only use numbers if only numbers is true", () => {
    const str = generateRandomString({
      length: 20,
      uppercase: false,
      lowercase: false,
      numbers: true,
      special: false,
    });
    expect(str).toMatch(/^[0-9]+$/);
  });

  it("should only use special characters if only special is true", () => {
    const str = generateRandomString({
      length: 20,
      uppercase: false,
      lowercase: false,
      numbers: false,
      special: true,
    });
    expect(str).toMatch(/^[!@#$%^&*()_+\[\]{}|;:,.<>?]+$/);
  });

  it("should use all character sets if all options are true", () => {
    const str = generateRandomString({
      length: 100,
      uppercase: true,
      lowercase: true,
      numbers: true,
      special: true,
    });
    expect(str).toMatch(/^[A-Za-z0-9!@#$%^&*()_+\[\]{}|;:,.<>?]+$/);
    // Should contain at least one of each type
    expect(str).toMatch(/[A-Z]/);
    expect(str).toMatch(/[a-z]/);
    expect(str).toMatch(/[0-9]/);
    expect(str).toMatch(/[!@#$%^&*()_+\[\]{}|;:,.<>?]/);
  });

  it("should throw if no character sets are selected", () => {
    expect(() =>
      generateRandomString({
        length: 10,
        uppercase: false,
        lowercase: false,
        numbers: false,
        special: false,
      })
    ).toThrow("At least one character set must be selected.");
  });

  it("should default to uppercase, lowercase, and numbers", () => {
    const str = generateRandomString({ length: 50 });
    expect(str).toMatch(/^[A-Za-z0-9]+$/);
  });

  it("should allow generating a string of length 0", () => {
    expect(() => generateRandomString({ length: 0 })).toThrow(
      "Length must be a positive integer."
    );
  });
});
