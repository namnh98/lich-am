import { View } from "react-native";
import { AppText } from "../primitives/AppText";
import { ActionButton } from "../primitives/ActionButton";
import { ChoiceRow, type ChoiceOption } from "./ChoiceRow";
import { SettingCard } from "./SettingCard";
import type { WidgetDensity, WidgetDisplay } from "./types";

const DISPLAY_OPTIONS: readonly ChoiceOption<WidgetDisplay>[] = [
  { value: "month", label: "Cả tháng" },
  { value: "compact", label: "Gọn" },
  { value: "detail", label: "Chi tiết" },
  { value: "agenda", label: "Lịch hẹn" },
];

const THEME_OPTIONS: readonly ChoiceOption<"light" | "dark">[] = [
  { value: "light", label: "Sáng" },
  { value: "dark", label: "Tối" },
];

const DENSITY_OPTIONS: readonly ChoiceOption<WidgetDensity>[] = [
  { value: "compact", label: "Gọn (Itel / máy nhỏ)" },
  { value: "balanced", label: "Cân đối" },
  { value: "spacious", label: "Thoải mái" },
];

export function WidgetSettingsCard({
  available,
  mobilePlatform,
  onAddWidget,
  onSelect,
  selected,
  widgetTheme,
  onThemeSelect,
  widgetDensity = "compact",
  onDensitySelect,
}: {
  available: boolean;
  mobilePlatform?: "android" | "ios";
  onAddWidget?: () => void;
  onSelect: (display: WidgetDisplay) => void;
  selected: WidgetDisplay;
  widgetTheme: "light" | "dark";
  onThemeSelect: (theme: "light" | "dark") => void;
  widgetDensity?: WidgetDensity;
  onDensitySelect?: (density: WidgetDensity) => void;
}) {
  const description =
    available && mobilePlatform === "ios"
      ? "Chọn cách hiển thị, sau đó xem hướng dẫn để đặt Lịch Việt lên màn hình chính."
      : available
        ? "Tùy chỉnh kiểu hiển thị, phong cách và mật độ hiển thị tối ưu cho từng dòng máy."
        : "Widget ngoài màn hình chưa khả dụng trong bản build hoặc trên nền tảng này.";

  const renderAddWidgetButton = () => {
    if (!available || !onAddWidget) {
      return null;
    }

    const label =
      mobilePlatform === "ios"
        ? "Xem cách thêm widget"
        : "Thêm ra màn hình chính";

    return <ActionButton label={label} onPress={onAddWidget} />;
  };

  const isDark = widgetTheme === "dark";
  const bg = isDark ? "#20211F" : "#F7F7F4";
  const textColor = isDark ? "#F1F2ED" : "#20211F";
  const mutedColor = isDark ? "#BEC1B7" : "#73766F";
  const accentColor = isDark ? "#F2A797" : "#A33A2B";
  const previewPadding = widgetDensity === "compact" ? 10 : widgetDensity === "spacious" ? 18 : 14;

  return (
    <SettingCard description={description} title="Widget màn hình chính">
      <AppText tone="muted">Chế độ hiển thị</AppText>
      <ChoiceRow
        disabled={!available}
        onSelect={onSelect}
        options={DISPLAY_OPTIONS}
        selected={selected}
      />

      <AppText tone="muted">Màu sắc widget</AppText>
      <ChoiceRow
        disabled={!available}
        options={THEME_OPTIONS}
        selected={widgetTheme}
        onSelect={onThemeSelect}
      />

      <AppText tone="muted">Mật độ viền (tối ưu khoảng cách trên/dưới)</AppText>
      <ChoiceRow
        disabled={!available || !onDensitySelect}
        options={DENSITY_OPTIONS}
        selected={widgetDensity}
        onSelect={(density) => onDensitySelect?.(density)}
      />

      {/* Preview Card */}
      <View
        style={{
          backgroundColor: bg,
          borderRadius: 16,
          padding: previewPadding,
          gap: 6,
          borderWidth: 1,
          borderColor: isDark ? "#333530" : "#E2E4DC",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <AppText style={{ color: accentColor, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 }}>
            {selected === "month" ? "LỊCH VIỆT · THÁNG NÀY" : "LỊCH VIỆT · HÔM NAY"}
          </AppText>
          <AppText style={{ color: mutedColor, fontSize: 10 }}>
            {widgetDensity === "compact" ? "Viền gọn" : widgetDensity === "spacious" ? "Viền rộng" : "Chuẩn"}
          </AppText>
        </View>

        {selected === "month" ? (
          <View style={{ gap: 4, marginTop: 2 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((w, i) => (
                <AppText
                  key={w}
                  style={{
                    color: i === 6 ? accentColor : mutedColor,
                    fontSize: 10,
                    fontWeight: "600",
                    width: 32,
                    textAlign: "center",
                  }}
                >
                  {w}
                </AppText>
              ))}
            </View>
            {[
              [
                { s: "28", l: "18", out: true },
                { s: "29", l: "19", out: true },
                { s: "30", l: "20", out: true },
                { s: "1", l: "1/9", today: false },
                { s: "2", l: "2" },
                { s: "3", l: "3" },
                { s: "4", l: "4" },
              ],
              [
                { s: "5", l: "5" },
                { s: "6", l: "6" },
                { s: "7", l: "7", today: true },
                { s: "8", l: "8" },
                { s: "9", l: "9" },
                { s: "10", l: "10" },
                { s: "11", l: "11" },
              ],
              [
                { s: "12", l: "12" },
                { s: "13", l: "13" },
                { s: "14", l: "14" },
                { s: "15", l: "15" },
                { s: "16", l: "16" },
                { s: "17", l: "17" },
                { s: "18", l: "18" },
              ],
              [
                { s: "19", l: "19" },
                { s: "20", l: "20" },
                { s: "21", l: "21" },
                { s: "22", l: "22" },
                { s: "23", l: "23" },
                { s: "24", l: "24" },
                { s: "25", l: "25" },
              ],
              [
                { s: "26", l: "26" },
                { s: "27", l: "27" },
                { s: "28", l: "28" },
                { s: "29", l: "29" },
                { s: "30", l: "30" },
                { s: "31", l: "1/10" },
                { s: "1", l: "2", out: true },
              ],
            ].map((week, wIdx) => (
              <View key={wIdx} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                {week.map((day, dIdx) => (
                  <View
                    key={dIdx}
                    style={{
                      width: 32,
                      alignItems: "center",
                      backgroundColor: day.today ? (isDark ? "#3D2420" : "#FCEEEA") : "transparent",
                      borderRadius: 6,
                      paddingVertical: 1,
                    }}
                  >
                    <AppText
                      style={{
                        color: day.today ? accentColor : day.out ? (isDark ? "#555852" : "#B8BBB2") : textColor,
                        fontSize: 10,
                        fontWeight: day.today ? "700" : "500",
                      }}
                    >
                      {day.s}
                    </AppText>
                    <AppText
                      style={{
                        color: day.today ? accentColor : day.out ? (isDark ? "#454842" : "#C8CBC2") : mutedColor,
                        fontSize: 8,
                      }}
                    >
                      {day.l}
                    </AppText>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : (
          <>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
              <AppText style={{ color: textColor, fontSize: selected === "agenda" ? 28 : 40, fontWeight: "300" }}>
                15
              </AppText>
              <View>
                <AppText style={{ color: mutedColor, fontSize: 10 }}>DƯƠNG LỊCH</AppText>
                <AppText style={{ color: textColor, fontSize: 12, fontWeight: "600" }}>15/10/2026</AppText>
              </View>
            </View>
            <View style={{ alignSelf: "flex-start", backgroundColor: isDark ? "#3D2420" : "#FCEEEA", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
              <AppText style={{ color: accentColor, fontSize: 12, fontWeight: "600" }}>Âm lịch 15/9</AppText>
            </View>
            {selected === "detail" ? <AppText style={{ color: mutedColor, fontSize: 11 }}>Ngày Giáp Tý · Giờ Hoàng Đạo</AppText> : null}
            <AppText style={{ color: textColor, fontSize: 12 }}>08:00 · Họp giao ban đầu tuần</AppText>
            {selected === "agenda" ? <AppText style={{ color: mutedColor, fontSize: 11 }}>14:00 · Sinh nhật · Chuẩn bị quà</AppText> : null}
          </>
        )}
      </View>

      <AppText tone="muted" variant="caption">
        {selected === "month"
          ? "Chế độ Cả tháng hiển thị trọn vẹn cả ngày dương và ngày âm của tháng đang chọn. Các ô ngày tự động dãn đều vừa khít khung widget, loại bỏ khoảng trắng thừa."
          : "Chế độ Gọn và Chi tiết căn giữa nội dung theo chiều dọc, tối ưu hiển thị cho mọi tỷ lệ màn hình."}
      </AppText>
      <AppText tone="muted" variant="caption">Áp dụng tức thì cho widget trên màn hình chính.</AppText>
      {renderAddWidgetButton()}
    </SettingCard>
  );
}
