export const HOME_COMPOSER_MODE = {
  code: "code",
  automation: "automation",
} as const;

export type HomeComposerMode =
  (typeof HOME_COMPOSER_MODE)[keyof typeof HOME_COMPOSER_MODE];
