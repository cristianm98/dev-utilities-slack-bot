export const SLACK_API_BASE_URL = "https://slack.com/api";

export type ViewsOpenResponse = ViewsPublishResponse;

export interface ViewsPublishResponse {
  ok: boolean;
  view?: View;
  error?: string;
}

interface View {
  id: string;
  team_id: string;
  type: string;
  blocks: any[];
  private_metadata: string;
  callback_id: string;
  hash: string;
  previous_view_id: string | null;
  root_view_id: string;
  app_id: string;
  external_id: string;
  bot_id: string;
  app_installed_team_id: string;
}

export interface SlackUserInfoResponse {
  ok: boolean;
  user?: {
    is_admin: boolean;
    is_owner: boolean;
    is_primary_owner: boolean;
  };
  error?: string;
}
