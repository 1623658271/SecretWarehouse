use crate::crypto;
use crate::models::*;
use rusqlite::{params, Connection};
use std::sync::Mutex;

pub struct DbState {
    pub conn: Mutex<Connection>,
}

impl DbState {
    pub fn new() -> Result<Self, String> {
        let conn = Connection::open("secret_warehouse.db")
            .map_err(|e| format!("打开数据库失败: {}", e))?;

        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS secrets (
                id TEXT PRIMARY KEY,
                secret_type TEXT NOT NULL,
                title TEXT NOT NULL,
                encrypted_fields TEXT NOT NULL,
                tags TEXT DEFAULT '[]',
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                favorite INTEGER DEFAULT 0
            );

            CREATE VIRTUAL TABLE IF NOT EXISTS secrets_fts USING fts5(
                title,
                content='secrets',
                content_rowid='rowid'
            );

            CREATE TRIGGER IF NOT EXISTS secrets_ai AFTER INSERT ON secrets BEGIN
                INSERT INTO secrets_fts(rowid, title) VALUES (new.rowid, new.title);
            END;

            CREATE TRIGGER IF NOT EXISTS secrets_ad AFTER DELETE ON secrets BEGIN
                INSERT INTO secrets_fts(secrets_fts, rowid, title) VALUES ('delete', old.rowid, old.title);
            END;

            CREATE TRIGGER IF NOT EXISTS secrets_au AFTER UPDATE ON secrets BEGIN
                INSERT INTO secrets_fts(secrets_fts, rowid, title) VALUES ('delete', old.rowid, old.title);
                INSERT INTO secrets_fts(rowid, title) VALUES (new.rowid, new.title);
            END;"
        ).map_err(|e| format!("创建表失败: {}", e))?;

        Ok(DbState {
            conn: Mutex::new(conn),
        })
    }

    pub fn create_secret(&self, req: CreateSecretRequest) -> Result<SecretEntry, String> {
        let secret_type = SecretType::from_str(&req.secret_type)
            .ok_or_else(|| format!("未知的类型: {}", req.secret_type))?;

        let key = crypto::get_encryption_key();
        let encrypted_fields = crypto::encrypt_fields(&req.fields, &key)?;
        let now = chrono::Utc::now().timestamp();
        let id = uuid::Uuid::new_v4().to_string();
        let tags_json = serde_json::to_string(&req.tags).unwrap_or_default();

        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "INSERT INTO secrets (id, secret_type, title, encrypted_fields, tags, created_at, updated_at, favorite)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0)",
            params![id, req.secret_type, req.title, encrypted_fields, tags_json, now, now],
        ).map_err(|e| format!("插入失败: {}", e))?;

        Ok(SecretEntry {
            id,
            secret_type,
            title: req.title,
            fields: req.fields,
            tags: req.tags,
            created_at: now,
            updated_at: now,
            favorite: false,
        })
    }

    pub fn get_secret(&self, id: &str) -> Result<SecretEntry, String> {
        let key = crypto::get_encryption_key();
        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        conn.query_row(
            "SELECT id, secret_type, title, encrypted_fields, tags, created_at, updated_at, favorite FROM secrets WHERE id = ?1",
            params![id],
            |row| {
                let id: String = row.get(0)?;
                let type_str: String = row.get(1)?;
                let title: String = row.get(2)?;
                let encrypted_fields: String = row.get(3)?;
                let tags_json: String = row.get(4)?;
                let created_at: i64 = row.get(5)?;
                let updated_at: i64 = row.get(6)?;
                let favorite: bool = row.get::<_, i64>(7)? != 0;

                let fields = crypto::decrypt_fields(&encrypted_fields, &key)
                    .unwrap_or_default();
                let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();
                let secret_type = SecretType::from_str(&type_str).unwrap_or(SecretType::SecureNote);

                Ok(SecretEntry {
                    id,
                    secret_type,
                    title,
                    fields,
                    tags,
                    created_at,
                    updated_at,
                    favorite,
                })
            },
        ).map_err(|e| format!("查询失败: {}", e))
    }

    pub fn list_secrets(&self, req: ListSecretsRequest) -> Result<Vec<SecretEntry>, String> {
        let key = crypto::get_encryption_key();
        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        let mut query = String::from(
            "SELECT id, secret_type, title, encrypted_fields, tags, created_at, updated_at, favorite FROM secrets WHERE 1=1",
        );
        let mut params_vec: Vec<String> = Vec::new();

        if let Some(ref st) = req.secret_type {
            query.push_str(" AND secret_type = ?");
            params_vec.push(st.clone());
        }
        if let Some(fav) = req.favorite {
            query.push_str(" AND favorite = ?");
            params_vec.push(if fav { "1".to_string() } else { "0".to_string() });
        }

        query.push_str(" ORDER BY updated_at DESC");

        if let Some(limit) = req.limit {
            query.push_str(&format!(" LIMIT {}", limit));
        }
        if let Some(offset) = req.offset {
            query.push_str(&format!(" OFFSET {}", offset));
        }

        let params_ref: Vec<&dyn rusqlite::ToSql> = params_vec
            .iter()
            .map(|s| s as &dyn rusqlite::ToSql)
            .collect();

        let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map(params_ref.as_slice(), |row| {
                let id: String = row.get(0)?;
                let type_str: String = row.get(1)?;
                let title: String = row.get(2)?;
                let encrypted_fields: String = row.get(3)?;
                let tags_json: String = row.get(4)?;
                let created_at: i64 = row.get(5)?;
                let updated_at: i64 = row.get(6)?;
                let favorite: bool = row.get::<_, i64>(7)? != 0;

                let fields = crypto::decrypt_fields(&encrypted_fields, &key).unwrap_or_default();
                let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();
                let secret_type = SecretType::from_str(&type_str).unwrap_or(SecretType::SecureNote);

                Ok(SecretEntry {
                    id,
                    secret_type,
                    title,
                    fields,
                    tags,
                    created_at,
                    updated_at,
                    favorite,
                })
            })
            .map_err(|e| e.to_string())?;

        let mut results = Vec::new();
        for row in rows {
            results.push(row.map_err(|e| e.to_string())?);
        }
        Ok(results)
    }

    pub fn update_secret(&self, req: UpdateSecretRequest) -> Result<SecretEntry, String> {
        let key = crypto::get_encryption_key();
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().timestamp();

        // 先获取现有条目
        let existing = self.get_secret(&req.id)?;

        let title = req.title.unwrap_or(existing.title);
        let fields = req.fields.unwrap_or(existing.fields);
        let tags = req.tags.unwrap_or(existing.tags);
        let favorite = req.favorite.unwrap_or(existing.favorite);

        let encrypted_fields = crypto::encrypt_fields(&fields, &key)?;
        let tags_json = serde_json::to_string(&tags).unwrap_or_default();

        conn.execute(
            "UPDATE secrets SET title = ?1, encrypted_fields = ?2, tags = ?3, updated_at = ?4, favorite = ?5 WHERE id = ?6",
            params![title, encrypted_fields, tags_json, now, if favorite { 1 } else { 0 }, req.id],
        ).map_err(|e| format!("更新失败: {}", e))?;

        Ok(SecretEntry {
            id: req.id,
            secret_type: existing.secret_type,
            title,
            fields,
            tags,
            created_at: existing.created_at,
            updated_at: now,
            favorite,
        })
    }

    pub fn delete_secret(&self, id: &str) -> Result<bool, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let affected = conn
            .execute("DELETE FROM secrets WHERE id = ?1", params![id])
            .map_err(|e| format!("删除失败: {}", e))?;
        Ok(affected > 0)
    }
}
