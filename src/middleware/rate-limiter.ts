import { WorkersKVStore } from "@hono-rate-limiter/cloudflare";
import { getSubscriptionPlan } from "@service/subscription-service";
import { CTX_SLACK_COMMAND_REQUEST } from "@utils/context-keys";
import { Context, Next } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import {
  ContextVariables,
  Env,
  PlanType,
  ResponseType,
  SlackCommandRequest,
  SUBSCRIPTION_PLANS,
} from "../utils/types";

export const rateLimiterMiddleware = async (
  c: Context<{ Bindings: Env; Variables: ContextVariables }>,
  next: Next
) => {
  const form = c.get(CTX_SLACK_COMMAND_REQUEST) as SlackCommandRequest;
  const userId = `user:${form.user_id}`;

  // 1. Fetch subscription from DB
  const subscription = await getSubscriptionPlan(c.env.UTILIO_DB, form.team_id);
  if (!subscription) {
    console.warn(
      `No subscription plan found for team ${form.team_id}. Applying default rate limit.`
    );
  }

  // 2. Determine the plan config (default to FREE if not found or invalid)
  const planKey = (subscription?.plan?.toUpperCase() as PlanType) || "FREE";
  const planConfig = SUBSCRIPTION_PLANS[planKey] || SUBSCRIPTION_PLANS.FREE;

  // 3. Apply the rate limiter
  return rateLimiter({
    windowMs: planConfig.windowMs,
    limit: planConfig.limit,
    keyGenerator: () => userId,
    store: new WorkersKVStore({ namespace: c.env.RATE_LIMITER_KV }),
    handler: (c) => {
      return c.json(
        {
          response_type: ResponseType.InChannel,
          text: `You have hit the rate limit for the ${planConfig.name} plan.`,
        },
        200
      );
    },
  })(c as any, next);
};
