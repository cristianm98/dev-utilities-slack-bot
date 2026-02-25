import {
  CTX_SLACK_COMMAND_REQUEST,
  CTX_SLACK_INTERACTION_REQUEST,
} from "./context-keys";

export interface Env {
  SLACK_SIGNING_SECRET: string;
  SLACK_BOT_TOKEN: string;
  SLACK_VERIFICATION_ENABLED?: string;
  RATE_LIMITER_KV: KVNamespace;
  SUBSCRIPTION_PLANS_KV: KVNamespace;
  UTILIO_DB: D1Database;
  UPGRADE_URL: string;
  JWT_SIGNING_SECRET: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
  SLACK_CLIENT_ID: string;
  SLACK_CLIENT_SECRET: string;
  SLACK_OAUTH_REDIRECT_URI: string;
}

export interface SlackCommandRequest {
  user_id: string;
  team_id: string;
  token?: string;
  team_domain?: string;
  channel_id?: string;
  channel_name?: string;
  user_name?: string;
  command?: string;
  text?: string;
  response_url?: string;
  trigger_id?: string;
}

export interface SlackCommandData {
  commandName: string;
  commandArgs: string[];
  slackBotToken?: string;
  userId: string;
  subscriptionsWorkerUrl: string;
}

export interface SlackInteractionRequest {
  type: string;
  user?: {
    id: string;
  };
  team?: {
    id: string;
  };
  actions?: any[];
  event?: any;
  [key: string]: any;
}

export interface CommandHandler {
  name: string;
  responseType: ResponseType;
  handle(
    slackCommandData: SlackCommandData
  ): Promise<SlackCommandHandlerResult> | SlackCommandHandlerResult;
}

export interface SubscriptionPlan {
  name: SubscriptionPlanName;
  rateLimit: number; // requests per window
  windowMs: number; // window size in milliseconds
}

export enum SubscriptionPlanName {
  FREE = "FREE",
  PREMIUM = "PREMIUM",
  BETA = "BETA",
}

export interface SlackCommandHandlerResult {
  responseType: ResponseType;
  text?: string;
  blocks?: any[];
}

export type ContextVariables = {
  [CTX_SLACK_COMMAND_REQUEST]?: SlackCommandRequest;
  [CTX_SLACK_INTERACTION_REQUEST]?: SlackInteractionRequest;
};

export const ResponseType = {
  InChannel: "in_channel",
  Ephemeral: "ephemeral",
} as const;

export type ResponseType = (typeof ResponseType)[keyof typeof ResponseType];

export interface SlackInteractionData {
  userId: string;
  workspaceId: string;
  jwtSigningSecret: string;
}

export interface UpgradeTokenPayload {
  iss: string;
  aud: string;
  workspaceId: string;
  userId: string;
  priceId: string;
  subscriptionPlan: string;
  iat: number;
  exp: number;
}

export interface SlackOAuthResponse {
  ok: boolean;
  access_token: string;
  team: {
    id: string;
    name: string;
  };
  authed_user?: {
    id: string;
  };
}

export const CONTENT_TYPES = {
  FORM: "application/x-www-form-urlencoded",
  JSON: "application/json",
  MULTIPART: "multipart/form-data",
} as const;

export interface Subscription {
  team_id: string;
  plan: string;
  plan_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_current_period_end: number | null;
  created_at: number;
  updated_at: number;
}

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: "Free",
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,
  },
  PRO: {
    name: "Pro",
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
  },
  ULTIMATE: {
    name: "Ultimate",
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 1000,
  },
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;
