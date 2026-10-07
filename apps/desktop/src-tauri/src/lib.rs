#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    use std::sync::atomic::{AtomicBool, Ordering};
    use tauri_plugin_global_shortcut::GlobalShortcutExt;

    let app = tauri::Builder::default()
        .manage(AtomicBool::new(false))
        .invoke_handler(tauri::generate_handler![
            open_main_window,
            quit_application,
            set_pin_to_menu_bar,
            set_tray_lunar_date
        ])
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            use tauri::menu::{Menu, MenuItem};
            use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder};
            use tauri::{Manager, WebviewUrl, WebviewWindowBuilder, WindowEvent};

            let show = MenuItem::with_id(app, "show", "Mở Lịch Việt", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit — Thoát ứng dụng", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;
            let tray_app = app.handle().clone();

            TrayIconBuilder::with_id("main-tray")
                .icon(tauri::include_image!("icons/icon.png"))
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_tray_icon_event(move |_tray, event| {
                    if let tauri::tray::TrayIconEvent::Click {
                        position,
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_quick_view(&tray_app, position);
                    }
                })
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => show_main_window(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?
                .set_visible(false)?;

            let quick_view =
                WebviewWindowBuilder::new(app, "quick-view", WebviewUrl::App("index.html".into()))
                    .title("Lịch Việt")
                    .inner_size(380.0, 510.0)
                    .resizable(false)
                    .decorations(false)
                    .shadow(false)
                    .always_on_top(true)
                    .skip_taskbar(true)
                    .visible(false)
                    .build()?;
            let quick_view_for_events = quick_view.clone();
            quick_view.on_window_event(move |event| {
                if matches!(event, WindowEvent::Focused(false)) {
                    let _ = quick_view_for_events.hide();
                }
            });

            let app_handle = app.handle().clone();
            app.global_shortcut().on_shortcut(
                "CmdOrCtrl+Shift+L",
                move |_app, _shortcut, _event| {
                    show_main_window(&app_handle);
                },
            )?;

            if let Some(window) = app.get_webview_window("main") {
                let close_window = window.clone();
                let app_handle = app.handle().clone();
                window.on_window_event(move |event| {
                    if let WindowEvent::CloseRequested { api, .. } = event {
                        if app_handle.state::<AtomicBool>().load(Ordering::Relaxed) {
                            api.prevent_close();
                            let _ = close_window.hide();
                        } else {
                            app_handle.exit(0);
                        }
                    }
                });
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building the Tauri application");

    app.run(|app_handle, event| {
        match event {
            #[cfg(target_os = "macos")]
            tauri::RunEvent::Reopen { .. } => {
                show_main_window(app_handle);
            }
            _ => {}
        }
    });
}

#[tauri::command]
fn open_main_window<R: tauri::Runtime>(app: tauri::AppHandle<R>) -> Result<(), String> {
    use tauri::Manager;

    let main = app
        .get_webview_window("main")
        .ok_or_else(|| "Main window is not available".to_owned())?;
    show_main_window(&app);
    if let Some(quick_view) = app.get_webview_window("quick-view") {
        let _ = quick_view.hide();
    }
    main.set_focus().map_err(|error| error.to_string())
}

#[tauri::command]
fn quit_application<R: tauri::Runtime>(app: tauri::AppHandle<R>) {
    app.exit(0);
}

#[tauri::command]
fn set_pin_to_menu_bar<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
    pinned: bool,
) -> Result<(), String> {
    use tauri::Manager;

    if pinned {
        if let Some(main) = app.get_webview_window("main") {
            let _ = main.hide();
        }
    }
    #[cfg(target_os = "macos")]
    app.set_activation_policy(if pinned {
        tauri::ActivationPolicy::Accessory
    } else {
        tauri::ActivationPolicy::Regular
    })
    .map_err(|error| error.to_string())?;
    app.tray_by_id("main-tray")
        .ok_or_else(|| "Main tray icon is not available".to_owned())?
        .set_visible(pinned)
        .map_err(|error| error.to_string())?;
    if !pinned {
        if let Some(main) = app.get_webview_window("main") {
            if !main.is_visible().unwrap_or(false) {
                show_main_window(&app);
            }
        }
    }
    app.state::<std::sync::atomic::AtomicBool>()
        .store(pinned, std::sync::atomic::Ordering::Relaxed);
    Ok(())
}

#[tauri::command]
fn set_tray_lunar_date<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
    title: String,
) -> Result<(), String> {
    app.tray_by_id("main-tray")
        .ok_or_else(|| "Main tray icon is not available".to_owned())?
        .set_title(Some(title))
        .map_err(|error| error.to_string())
}

fn show_main_window<R: tauri::Runtime>(app: &tauri::AppHandle<R>) {
    use tauri::{Emitter, Manager};

    let _ = app.emit("desktop:show-calendar", ());
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

fn show_quick_view<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    tray_position: tauri::PhysicalPosition<f64>,
) {
    use tauri::{Emitter, Manager, PhysicalPosition};

    let Some(window) = app.get_webview_window("quick-view") else {
        return;
    };
    if window.is_visible().unwrap_or(false) {
        let _ = window.hide();
        return;
    }

    let (Ok(size), Ok(monitors)) = (window.outer_size(), window.available_monitors()) else {
        return;
    };
    let _ = app.emit("desktop:show-quick-view", ());
    let monitor = monitors
        .iter()
        .find(|monitor| {
            let position = monitor.position();
            let dimensions = monitor.size();
            tray_position.x >= position.x as f64
                && tray_position.x < position.x as f64 + dimensions.width as f64
                && tray_position.y >= position.y as f64
                && tray_position.y < position.y as f64 + dimensions.height as f64
        })
        .or_else(|| monitors.first());
    let Some(monitor) = monitor else {
        return;
    };

    let work_area = monitor.work_area();
    let width = size.width as i32;
    let height = size.height as i32;
    let click_x = tray_position.x.round() as i32;
    let click_y = tray_position.y.round() as i32;
    let preferred_x = click_x - width / 2;
    #[cfg(target_os = "macos")]
    let preferred_y = click_y + 16;
    #[cfg(not(target_os = "macos"))]
    let preferred_y = if click_y > work_area.position.y + work_area.size.height as i32 / 2 {
        click_y - height - 12
    } else {
        click_y + 12
    };
    let max_x =
        (work_area.position.x + work_area.size.width as i32 - width).max(work_area.position.x);
    let max_y =
        (work_area.position.y + work_area.size.height as i32 - height).max(work_area.position.y);
    let x = preferred_x.clamp(work_area.position.x, max_x);
    let y = preferred_y.clamp(work_area.position.y, max_y);

    let _ = window.set_position(PhysicalPosition::new(x, y));
    let _ = window.show();
    let _ = window.set_focus();
}
