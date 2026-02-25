import { publishAppHome } from "@service/actions/app-home-service";
import { upgradeAction } from "@service/actions/upgrade-action-service";
import {
  CTX_SLACK_INTERACTION_REQUEST,
  SLACK_ACTION_UPGRADE,
  SLACK_APP_HOME_OPENED,
  SLACK_BLOCK_ACTIONS,
  SLACK_EVENT_CALLBACK,
} from "@utils/context-keys";
import { Context } from "hono";
import { ContextVariables, Env, SlackInteractionRequest } from "../utils/types";
import { getSubscriptionPlan } from "@service/subscription-service";

export async function slackInteractionsRoute(
  c: Context<{ Bindings: Env; Variables: ContextVariables }>
) {
  try {
    const payload = c.get(
      CTX_SLACK_INTERACTION_REQUEST
    ) as SlackInteractionRequest;

    if (
      payload.type === SLACK_EVENT_CALLBACK &&
      payload.event?.type === SLACK_APP_HOME_OPENED
    ) {
      // TODO fetch workspace data
      const subscription = await getSubscriptionPlan(
        c.env.UTILIO_DB,
        payload.event.team
      );
      await publishAppHome(
        payload.event.user,
        c.env.SLACK_BOT_TOKEN, // TODO replace with bot token for the specific workspace
        subscription?.plan || "Free"
      );
      return c.text("OK", 200);
    }

    if (
      payload.type === SLACK_BLOCK_ACTIONS &&
      payload.actions?.[0]?.action_id === SLACK_ACTION_UPGRADE
    ) {
      const upgradeActionOutcome = await upgradeAction(
        payload,
        c.env.JWT_SIGNING_SECRET,
        c.env.SLACK_BOT_TOKEN,
        c.env.UPGRADE_URL,
        c.env.JWT_ISSUER,
        c.env.JWT_AUDIENCE
      );
      return c.json(upgradeActionOutcome);
    }

    return c.text("Unsupported interaction", 400);
  } catch (error) {
    console.error("Error in slack interactions api:", error);
    return c.text("Internal Server Error", 500);
  }
}
