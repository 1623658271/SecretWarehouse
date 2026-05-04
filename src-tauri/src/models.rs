use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SecretType {
    Website,
    ApiKey,
    BankCard,
    SecureNote,
    SshKey,
    License,
}

impl fmt::Display for SecretType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SecretType::Website => write!(f, "website"),
            SecretType::ApiKey => write!(f, "api_key"),
            SecretType::BankCard => write!(f, "bank_card"),
            SecretType::SecureNote => write!(f, "secure_note"),
            SecretType::SshKey => write!(f, "ssh_key"),
            SecretType::License => write!(f, "license"),
        }
    }
}

impl SecretType {
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "website" => Some(SecretType::Website),
            "api_key" => Some(SecretType::ApiKey),
            "bank_card" => Some(SecretType::BankCard),
            "secure_note" => Some(SecretType::SecureNote),
            "ssh_key" => Some(SecretType::SshKey),
            "license" => Some(SecretType::License),
            _ => None,
        }
    }

    pub fn required_fields(&self) -> Vec<(&str, &str)> {
        match self {
            SecretType::Website => vec![
                ("url", "网址"),
                ("username", "用户名"),
                ("password", "密码"),
            ],
            SecretType::ApiKey => vec![
                ("service", "服务名称"),
                ("key", "API Key"),
                ("note", "备注"),
            ],
            SecretType::BankCard => vec![
                ("bank", "银行名称"),
                ("card_number", "卡号"),
                ("holder", "持卡人"),
                ("expiry", "有效期"),
                ("cvv", "CVV"),
            ],
            SecretType::SecureNote => vec![("content", "内容")],
            SecretType::SshKey => vec![
                ("title", "标题"),
                ("private_key", "私钥"),
                ("public_key", "公钥"),
                ("note", "备注"),
            ],
            SecretType::License => vec![
                ("software", "软件名称"),
                ("license_key", "许可证密钥"),
                ("email", "邮箱"),
                ("note", "备注"),
            ],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecretEntry {
    pub id: String,
    pub secret_type: SecretType,
    pub title: String,
    pub fields: HashMap<String, String>,
    pub tags: Vec<String>,
    pub created_at: i64,
    pub updated_at: i64,
    pub favorite: bool,
}

#[derive(Debug, Deserialize)]
pub struct CreateSecretRequest {
    pub secret_type: String,
    pub title: String,
    pub fields: HashMap<String, String>,
    #[serde(default)]
    pub tags: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateSecretRequest {
    pub id: String,
    pub title: Option<String>,
    pub fields: Option<HashMap<String, String>>,
    pub tags: Option<Vec<String>>,
    pub favorite: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct ListSecretsRequest {
    pub secret_type: Option<String>,
    pub favorite: Option<bool>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct SearchRequest {
    pub query: String,
}

#[derive(Debug, Deserialize)]
pub struct GeneratePasswordRequest {
    pub length: Option<usize>,
    pub use_upper: Option<bool>,
    pub use_lower: Option<bool>,
    pub use_digits: Option<bool>,
    pub use_symbols: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct TypeInfo {
    pub type_name: String,
    pub label: String,
    pub fields: Vec<FieldInfo>,
}

#[derive(Debug, Serialize)]
pub struct FieldInfo {
    pub key: String,
    pub label: String,
}
