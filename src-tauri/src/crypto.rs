use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, AeadCore, Nonce,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use indexmap::IndexMap;

/// 开发模式固定密钥（32字节）
const DEV_KEY: &[u8; 32] = b"dev_key_32_bytes_for_testing_!!1";

/// 获取加密密钥（开发模式返回固定密钥）
pub fn get_encryption_key() -> [u8; 32] {
    // TODO: 生产模式使用 Argon2id 从主密码派生
    *DEV_KEY
}

/// 加密单个值，返回 base64(nonce + ciphertext)
pub fn encrypt_value(plaintext: &str, key: &[u8; 32]) -> Result<String, String> {
    let cipher = Aes256Gcm::new(key.into());
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let ciphertext = cipher
        .encrypt(&nonce, plaintext.as_bytes())
        .map_err(|e| format!("加密失败: {}", e))?;

    // 拼接 nonce + ciphertext，然后 base64 编码
    let mut combined = Vec::with_capacity(12 + ciphertext.len());
    combined.extend_from_slice(&nonce);
    combined.extend_from_slice(&ciphertext);

    Ok(BASE64.encode(combined))
}

/// 解密单个值，输入 base64(nonce + ciphertext)
pub fn decrypt_value(encoded: &str, key: &[u8; 32]) -> Result<String, String> {
    let combined = BASE64
        .decode(encoded)
        .map_err(|e| format!("base64 解码失败: {}", e))?;

    if combined.len() < 12 {
        return Err("密文数据太短".to_string());
    }

    let (nonce_bytes, ciphertext) = combined.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);
    let cipher = Aes256Gcm::new(key.into());

    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("解密失败: {}", e))?;

    String::from_utf8(plaintext).map_err(|e| format!("UTF-8 解码失败: {}", e))
}

/// 加密整个 IndexMap<String, String>
pub fn encrypt_fields(
    fields: &IndexMap<String, String>,
    key: &[u8; 32],
) -> Result<String, String> {
    let json = serde_json::to_string(fields).map_err(|e| e.to_string())?;
    encrypt_value(&json, key)
}

/// 解密到 IndexMap<String, String>
pub fn decrypt_fields(
    encrypted: &str,
    key: &[u8; 32],
) -> Result<IndexMap<String, String>, String> {
    let json = decrypt_value(encrypted, key)?;
    serde_json::from_str(&json).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt() {
        let key = get_encryption_key();
        let plaintext = "hello world";
        let encrypted = encrypt_value(plaintext, &key).unwrap();
        let decrypted = decrypt_value(&encrypted, &key).unwrap();
        assert_eq!(plaintext, decrypted);
    }

    #[test]
    fn test_encrypt_decrypt_fields() {
        let key = get_encryption_key();
        let mut fields = IndexMap::new();
        fields.insert("password".to_string(), "super_secret_123".to_string());
        fields.insert("username".to_string(), "admin".to_string());

        let encrypted = encrypt_fields(&fields, &key).unwrap();
        let decrypted = decrypt_fields(&encrypted, &key).unwrap();
        assert_eq!(fields, decrypted);
    }
}
