export const CTX_SLACK_COMMAND_REQUEST = "slackCommandRequest" as const;
export const CTX_SLACK_INTERACTION_REQUEST = "slackInteractionRequest" as const;

export const SLACK_EVENT_CALLBACK = "event_callback" as const;
export const SLACK_APP_HOME_OPENED = "app_home_opened" as const;
export const SLACK_BLOCK_ACTIONS = "block_actions" as const;
export const SLACK_ACTION_UPGRADE = "upgrade_action" as const;

export type ContextKeySlackCommand = typeof CTX_SLACK_COMMAND_REQUEST;
export type ContextKeySlackInteraction = typeof CTX_SLACK_INTERACTION_REQUEST;

export type SlackEventCallback = typeof SLACK_EVENT_CALLBACK;
export type SlackAppHomeOpened = typeof SLACK_APP_HOME_OPENED;
export type SlackBlockActions = typeof SLACK_BLOCK_ACTIONS;
export type SlackActionUpgrade = typeof SLACK_ACTION_UPGRADE;
