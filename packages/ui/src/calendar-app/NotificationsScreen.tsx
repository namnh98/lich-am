import type { LocalEvent } from "@lich-oi/core";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "../primitives/AppText";
import { Card } from "../primitives/Card";
import { theme } from "../theme";
import type { EventStore } from "./types";

export function NotificationsScreen({
  eventStore,
}: {
  eventStore?: EventStore;
}) {
  const [events, setEvents] = useState<LocalEvent[]>([]);

  useEffect(() => {
    let active = true;
    if (!eventStore) return undefined;
    void eventStore.list().then((items) => {
      if (active)
        setEvents(
          items.filter((event) => event.enabled && event.notificationTime),
        );
    });
    return () => {
      active = false;
    };
  }, [eventStore]);

  return (
    <View style={styles.content}>
      <AppText variant="title">Thông báo</AppText>
      <AppText tone="muted">Các ngày bạn đã ghi chú và đặt giờ nhắc.</AppText>
      {!eventStore ? (
        <AppText tone="muted">Chưa kết nối bộ nhớ sự kiện.</AppText>
      ) : null}
      {eventStore && events.length === 0 ? (
        <AppText tone="muted">Chưa có ngày nào được nhắc.</AppText>
      ) : null}
      {events.map((event) => (
        <Card key={event.id} style={styles.card}>
          <View style={styles.row}>
            <AppText style={styles.title}>{event.title}</AppText>
            <AppText tone="accent">{event.notificationTime}</AppText>
          </View>
          <AppText tone="muted">{event.solarDate}</AppText>
          {event.notes ? <AppText>{event.notes}</AppText> : null}
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: theme.spacing.md,
    maxWidth: 860,
    width: "100%",
  },
  card: { gap: theme.spacing.xs },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: { fontWeight: "700" },
});
