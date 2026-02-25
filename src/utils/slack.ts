import {
  SlackUserInfoResponse,
  SLACK_API_BASE_URL,
} from "@utils/slack-api-types";

export async function verifySlackRequest(
  req: Request,
  env: { SLACK_SIGNING_SECRET: string }
): Promise<boolean> {
  const timestamp = req.headers.get("x-slack-request-timestamp");
  const signature = req.headers.get("x-slack-signature");
  if (!timestamp || !signature) return false;

  const body = await req.clone().text();
  const baseString = `v0:${timestamp}:${body}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(env.SLACK_SIGNING_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(baseString)
  );
  const mySig =
    "v0=" +
    Array.from(new Uint8Array(sigBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  return mySig === signature;
}

export async function isSlackAdmin(
  userId: string,
  botToken: string
): Promise<boolean> {
  const res = await fetch(
    `${SLACK_API_BASE_URL}/users.info?user=${encodeURIComponent(userId)}`,
    {
      headers: {
        Authorization: `Bearer ${botToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = (await res.json()) as SlackUserInfoResponse;

  if (!data.ok || !data.user) {
    console.error("Slack users.info failed:", data.error);
    return false;
  }

  return data.user.is_admin || data.user.is_owner || data.user.is_primary_owner;
}
