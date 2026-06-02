export const SCREENSHOT_SECRETS: Array<{
  name: string;
  value: string;
  description?: string;
}> = [
  {
    name: "OPENAI_API_KEY",
    value: "sk-screenshot-placeholder",
    description: "OpenAI API key for LLM requests",
  },
  {
    name: "GITHUB_TOKEN",
    value: "ghp-screenshot-placeholder",
    description: "GitHub personal access token",
  },
  {
    name: "SLACK_WEBHOOK_URL",
    value: "https://hooks.slack.com/services/example",
    description: "Slack incoming webhook for notifications",
  },
  {
    name: "STRIPE_SECRET_KEY",
    value: "sk_live_screenshot_placeholder",
    description: "Stripe secret key for payment webhooks",
  },
];
