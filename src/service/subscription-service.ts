import { Subscription, SubscriptionPlan } from "@utils/types";

export async function getSubscriptionPlan(
  db: D1Database,
  teamId: string
): Promise<Subscription | null> {
  return await db
    .prepare("SELECT * FROM subscriptions WHERE team_id = ? LIMIT 1")
    .bind(teamId)
    .first<Subscription>();
}
