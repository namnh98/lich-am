import { ChoiceRow, type ChoiceOption } from "./ChoiceRow";
import { SettingCard } from "./SettingCard";
import type { ThemePreference } from "./types";

const OPTIONS: readonly ChoiceOption<ThemePreference>[] = [
  { value: "system", label: "Hệ thống" },
  { value: "light", label: "Sáng" },
  { value: "dark", label: "Tối" },
];

export function ThemeSettingsCard({
  onSelect,
  selected,
}: {
  onSelect: (theme: ThemePreference) => void;
  selected: ThemePreference;
}) {
  return (
    <SettingCard description="Theo hệ thống hoặc chọn chế độ cố định." title="Giao diện">
      <ChoiceRow onSelect={onSelect} options={OPTIONS} selected={selected} />
    </SettingCard>
  );
}
