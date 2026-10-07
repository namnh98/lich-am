import { ChoiceRow, type ChoiceOption } from "./ChoiceRow";
import { SettingCard } from "./SettingCard";

const OPTIONS: readonly ChoiceOption<"true" | "false">[] = [
  { value: "true", label: "Bật" },
  { value: "false", label: "Tắt" },
];

export function DesktopSettingsCard({
  onSelect,
  selected,
}: {
  onSelect: (value: "true" | "false") => void;
  selected: "true" | "false";
}) {
  return (
    <SettingCard
      description="Ghim Lịch Việt vào thanh menu (macOS status bar) / khay hệ thống (Windows tray) và ẩn biểu tượng dưới thanh Dock / Taskbar."
      title="Ghim vào thanh menu & ẩn ở Dock/Taskbar"
    >
      <ChoiceRow onSelect={onSelect} options={OPTIONS} selected={selected} />
    </SettingCard>
  );
}
