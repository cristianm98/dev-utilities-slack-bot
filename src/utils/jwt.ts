import { SignJWT, jwtVerify } from "jose";
import { UpgradeTokenPayload } from "./types";

function encodeSecret(secret: string) {
  return new TextEncoder().encode(secret);
}

export async function signUpgradeToken(
  payload: Omit<UpgradeTokenPayload, "iat" | "exp">,
  jwtSigningSecret: string,
  ttlSeconds = 300 // 5 minutes
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    ...payload,
    iat: now,
    exp: now + ttlSeconds,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(payload.iss)
    .setAudience(payload.aud)
    .sign(encodeSecret(jwtSigningSecret));
}
