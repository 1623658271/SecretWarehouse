#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod crypto;
mod db;
mod models;
mod search;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::create_secret,
            commands::get_secret,
            commands::list_secrets,
            commands::update_secret,
            commands::delete_secret,
            commands::search_secrets,
            commands::generate_password,
            commands::get_secret_types,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
