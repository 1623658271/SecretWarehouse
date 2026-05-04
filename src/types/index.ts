export type SecretType =
  | 'website'
  | 'api_key'
  | 'bank_card'
  | 'secure_note'
  | 'ssh_key'
  | 'license'

export interface FieldInfo {
  key: string
  label: string
}

export interface TypeInfo {
  type_name: SecretType
  label: string
  fields: FieldInfo[]
}

export interface SecretEntry {
  id: string
  secret_type: SecretType
  title: string
  fields: Record<string, string>
  tags: string[]
  created_at: number
  updated_at: number
  favorite: boolean
}

export interface CreateSecretRequest {
  secret_type: string
  title: string
  fields: Record<string, string>
  tags?: string[]
}

export interface UpdateSecretRequest {
  id: string
  title?: string
  fields?: Record<string, string>
  tags?: string[]
  favorite?: boolean
}

export interface ListSecretsRequest {
  secret_type?: string
  favorite?: boolean
  limit?: number
  offset?: number
}
