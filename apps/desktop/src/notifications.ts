import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

import type { LocalEvent } from "@lich-oi/core";

const timers = new Map<string, ReturnType<typeof setTimeout>>();

export async function prepareNotifications(): Promise<boolean> {
  if (await isPermissionGranted()) return true;
  await requestPermission();
  return isPermissionGranted();
}

export async function scheduleEventNotification(
  event: LocalEvent,
): Promise<void> {
  cancelEventNotification(event.id);
  if (
    !event.enabled ||
    event.allDay ||
    !event.solarDate ||
    !event.notificationTime
  )
    return;
  const [year, month, day] = event.solarDate.split("-").map(Number);
  const [hour, minute] = event.notificationTime.split(":").map(Number);
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  const delay = date.getTime() - Date.now();
  if (delay <= 0) return;

  await prepareNotifications();
  const timer = setTimeout(() => {
    try {
      sendNotification({
        title: event.title,
        body: event.notes ?? "Đến giờ nhắc nhở của bạn.",
      });
    } catch (error) {
      console.error("Unable to send desktop notification", error);
    }
    timers.delete(event.id);
  }, delay);
  timers.set(event.id, timer);
}

export function cancelEventNotification(eventId: string): void {
  const timer = timers.get(eventId);
  if (timer) clearTimeout(timer);
  timers.delete(eventId);
}
