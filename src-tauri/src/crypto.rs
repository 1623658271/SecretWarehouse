use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, AeadCore, Nonce,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use hmac::Hmac;
use indexmap::IndexMap;
use rand::RngCore;
use sha2::{Sha256, Digest};
use std::sync::Mutex;

/// 全局加密密钥（运行时由主密码派生）
static ENCRYPTION_KEY: Mutex<Option<[u8; 32]>> = Mutex::new(None);

/// 盐值文件路径
const SALT_FILE: &str = "data/.salt";
/// 密钥哈希验证文件路径
const KEY_HASH_FILE: &str = "data/.key_hash";

/// 检查是否已设置主密码
pub fn is_master_password_set() -> bool {
    std::path::Path::new(KEY_HASH_FILE).exists()
}

/// 从主密码派生加密密钥（使用 PBKDF2-SHA256）
fn derive_key_from_password(password: &str, salt: &[u8]) -> [u8; 32] {
    let mut key = [0u8; 32];
    // PBKDF2 with 100,000 iterations
    pbkdf2::pbkdf2::<Hmac<Sha256>>(password.as_bytes(), salt, 100_000, &mut key)
        .expect("PBKDF2 derivation failed");
    key
}

/// 生成随机盐值
fn generate_salt() -> [u8; 32] {
    let mut salt = [0u8; 32];
    OsRng.fill_bytes(&mut salt);
    salt
}

/// 保存盐值到文件
fn save_salt(salt: &[u8]) -> Result<(), String> {
    std::fs::create_dir_all("data")
        .map_err(|e| format!("创建data目录失败: {}", e))?;
    std::fs::write(SALT_FILE, BASE64.encode(salt))
        .map_err(|e| format!("保存盐值失败: {}", e))
}

/// 从文件读取盐值
fn load_salt() -> Result<[u8; 32], String> {
    let encoded = std::fs::read_to_string(SALT_FILE)
        .map_err(|e| format!("读取盐值失败: {}", e))?;
    let salt_bytes = BASE64.decode(encoded.trim())
        .map_err(|e| format!("解码盐值失败: {}", e))?;
    if salt_bytes.len() != 32 {
        return Err("盐值长度错误".to_string());
    }
    let mut salt = [0u8; 32];
    salt.copy_from_slice(&salt_bytes);
    Ok(salt)
}

/// 保存密钥哈希（用于验证密码）
fn save_key_hash(key: &[u8; 32]) -> Result<(), String> {
    let mut hasher = Sha256::new();
    hasher.update(key);
    let hash = hasher.finalize();
    std::fs::write(KEY_HASH_FILE, BASE64.encode(hash))
        .map_err(|e| format!("保存密钥哈希失败: {}", e))
}

/// 验证密钥是否正确
fn verify_key(key: &[u8; 32]) -> Result<bool, String> {
    let stored_hash = std::fs::read_to_string(KEY_HASH_FILE)
        .map_err(|e| format!("读取密钥哈希失败: {}", e))?;
    let mut hasher = Sha256::new();
    hasher.update(key);
    let hash = hasher.finalize();
    Ok(BASE64.encode(hash) == stored_hash.trim())
}

/// 设置主密码（首次使用）
pub fn set_master_password(password: &str) -> Result<(), String> {
    if password.len() < 8 {
        return Err("密码长度至少8位".to_string());
    }
    if is_master_password_set() {
        return Err("主密码已设置".to_string());
    }

    let salt = generate_salt();
    save_salt(&salt)?;

    let key = derive_key_from_password(password, &salt);
    save_key_hash(&key)?;

    // 设置全局密钥
    let mut global_key = ENCRYPTION_KEY.lock().map_err(|e| e.to_string())?;
    *global_key = Some(key);

    Ok(())
}

/// 验证主密码
pub fn verify_master_password(password: &str) -> Result<bool, String> {
    let salt = load_salt()?;
    let key = derive_key_from_password(password, &salt);

    if verify_key(&key)? {
        // 设置全局密钥
        let mut global_key = ENCRYPTION_KEY.lock().map_err(|e| e.to_string())?;
        *global_key = Some(key);
        Ok(true)
    } else {
        Ok(false)
    }
}

/// 获取当前加密密钥
pub fn get_encryption_key() -> [u8; 32] {
    let global_key = ENCRYPTION_KEY.lock().expect("获取密钥锁失败");
    global_key.expect("加密密钥未初始化，请先验证主密码")
}

/// 清除内存中的密钥（退出时调用）
pub fn clear_encryption_key() {
    let mut global_key = ENCRYPTION_KEY.lock().expect("获取密钥锁失败");
    *global_key = None;
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
