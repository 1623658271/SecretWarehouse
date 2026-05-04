use serde::{Deserialize, Serialize};
use indexmap::IndexMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecretEntry {
    pub id: String,
    pub title: String,
    pub description: String,
    pub fields: IndexMap<String, String>,
    #[serde(default, rename = "sensitiveFields")]
    pub sensitive_fields: Vec<String>,
    pub tags: Vec<String>,
    pub icon: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub favorite: bool,
}

#[derive(Debug, Deserialize)]
pub struct CreateSecretRequest {
    pub title: String,
    #[serde(default)]
    pub description: String,
    pub fields: IndexMap<String, String>,
    #[serde(default, rename = "sensitiveFields")]
    pub sensitive_fields: Vec<String>,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default = "default_icon")]
    pub icon: String,
}

fn default_icon() -> String {
    "key".to_string()
}

#[derive(Debug, Deserialize)]
pub struct UpdateSecretRequest {
    pub id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub fields: Option<IndexMap<String, String>>,
    #[serde(rename = "sensitiveFields")]
    pub sensitive_fields: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
    pub icon: Option<String>,
    pub favorite: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct ListSecretsRequest {
    pub tag: Option<String>,
    pub favorite: Option<bool>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

// 模板相关
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Template {
    pub id: String,
    pub name: String,
    pub description: String,
    pub fields: Vec<String>,  // 字段名列表
    pub tags: Vec<String>,
    pub icon: String,
    pub created_at: i64,
}

#[derive(Debug, Deserialize)]
pub struct CreateTemplateRequest {
    pub name: String,
    #[serde(default)]
    pub description: String,
    pub fields: Vec<String>,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default = "default_icon")]
    pub icon: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTemplateRequest {
    pub id: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub fields: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
    pub icon: Option<String>,
}
