const SENSITIVE_KEYWORDS = ['password', '密码', 'secret', '密钥', 'key', 'token', 'cvv', 'pin']

export function isFieldSensitive(key: string): boolean {
  return SENSITIVE_KEYWORDS.some(kw => key.toLowerCase().includes(kw))
}
