declare const MACRO: {
  VERSION: string
  BUILD_TIME: string | undefined
  FEEDBACK_CHANNEL: string
  ISSUES_EXPLAINER: string
  NATIVE_PACKAGE_URL: string | undefined
  PACKAGE_URL: string
  VERSION_CHANGELOG: string | undefined
}

declare module '*.md' {
  const content: string
  export default content
}
