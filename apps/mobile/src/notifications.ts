import * as Notifications from "expo-notifications";

import type { LocalEvent } from "@lich-oi/core";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function prepareNotifications(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleEventNotification(
  event: LocalEvent,
): Promise<void> {
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
  if (date.getTime() <= Date.now()) return;

  await cancelEventNotification(event.id);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: event.title,
      body: event.notes ?? "Đến giờ nhắc nhở của bạn.",
      data: { eventId: event.id },
    },
    identifier: event.id,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });
}

export async function cancelEventNotification(eventId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(eventId).catch(
    () => undefined,
  );
}
