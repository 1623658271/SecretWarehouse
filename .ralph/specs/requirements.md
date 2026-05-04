# SecretWarehouse 技术规格

## 数据模型

### SecretEntry (秘密条目)
```rust
struct SecretEntry {
    id: String,              // UUID v4
    secret_type: SecretType, // 类型枚举
    title: String,           // 显示标题（不加密，用于搜索和列表展示）
    fields: HashMap<String, String>,  // 加密存储的字段
    tags: Vec<String>,       // 标签（可选）
    created_at: i64,         // 创建时间戳
    updated_at: i64,         // 更新时间戳
    favorite: bool,          // 收藏标记
}
```

### SecretType (类型枚举)
```rust
enum SecretType {
    Website,    // 网站账号: url, username, password
    ApiKey,     // API Key: service, key, note
    BankCard,   // 银行卡: bank, card_number, holder, expiry, cvv
    SecureNote, // 安全笔记: content
    SshKey,     // SSH密钥: title, private_key, public_key, note
    License,    // 软件许可: software, license_key, email, note
}
```

## 加密方案

### 密钥派生
- 算法: Argon2id
- 参数: m=65536, t=3, p=4
- 测试模式: 使用固定密钥 `b"dev_key_32_bytes_for_testing!!"` (32字节)

### 字段加密
- 算法: AES-256-GCM
- Nonce: 12字节随机生成，与密文一起存储
- 存储格式: base64(nonce + ciphertext + tag)

### 加密范围
- `title` 字段: 不加密（用于搜索和列表展示）
- `fields` 中所有值: 加密
- 元数据 (created_at, updated_at, favorite): 不加密

## 数据库 Schema

```sql
CREATE TABLE secrets (
    id TEXT PRIMARY KEY,
    secret_type TEXT NOT NULL,
    title TEXT NOT NULL,
    encrypted_fields TEXT NOT NULL,
    tags TEXT DEFAULT '[]',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    favorite INTEGER DEFAULT 0
);

CREATE VIRTUAL TABLE secrets_fts USING fts5(
    title,
    content='secrets',
    content_rowid='rowid'
);
```

## Tauri 命令列表

| 命令 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `create_secret` | `{secret_type, title, fields, tags}` | `SecretEntry` | 创建条目 |
| `get_secret` | `{id}` | `SecretEntry` | 获取条目 |
| `list_secrets` | `{secret_type?, favorite?, limit?, offset?}` | `Vec<SecretEntry>` | 列出条目 |
| `update_secret` | `{id, title?, fields?, tags?, favorite?}` | `SecretEntry` | 更新条目 |
| `delete_secret` | `{id}` | `bool` | 删除条目 |
| `search_secrets` | `{query}` | `Vec<SecretEntry>` | 全文搜索 |
| `generate_password` | `{length?, use_upper?, use_lower?, use_digits?, use_symbols?}` | `String` | 生成密码 |
| `get_secret_types` | 无 | `Vec<{type, label, fields}>` | 获取类型定义 |

## 前端路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Home | 主页面 (侧边栏 + 条目列表 + 详情) |
| `/settings` | Settings | 设置页面 |
