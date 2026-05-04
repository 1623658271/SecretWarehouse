use crate::crypto;
use crate::models::*;
use crate::db::DbState;
use rusqlite::params;

impl DbState {
    pub fn search_secrets(&self, query: &str) -> Result<Vec<SecretEntry>, String> {
        let key = crypto::get_encryption_key();
        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        let fts_query = format!("{}*", query);

        let mut stmt = conn
            .prepare(
                "SELECT s.id, s.secret_type, s.title, s.encrypted_fields, s.tags, s.created_at, s.updated_at, s.favorite
                 FROM secrets s
                 INNER JOIN secrets_fts f ON s.rowid = f.rowid
                 WHERE secrets_fts MATCH ?1
                 ORDER BY rank",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map(params![fts_query], |row| {
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
                let secret_type =
                    SecretType::from_str(&type_str).unwrap_or(SecretType::SecureNote);

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
}
