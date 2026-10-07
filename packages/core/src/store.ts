import { createStore } from "zustand/vanilla";

export interface LunarReminder {
  id: string;
  title: string;
  lunarDay: number;
  lunarMonth: number;
  repeatYearly: boolean;
}

export interface AppState {
  selectedDate: string;
  visibleMonth: string;
  reminders: LunarReminder[];
  selectDate: (isoDate: string) => void;
  showMonth: (isoMonth: string) => void;
  addReminder: (reminder: LunarReminder) => void;
  removeReminder: (id: string) => void;
}

export const appStore = createStore<AppState>()((set) => ({
  selectedDate: formatLocalDate(new Date()),
  visibleMonth: formatLocalDate(new Date()).slice(0, 7),
  reminders: [],
  selectDate: (selectedDate) => set({ selectedDate, visibleMonth: selectedDate.slice(0, 7) }),
  showMonth: (visibleMonth) => set({ visibleMonth }),
  addReminder: (reminder) => set((state) => ({ reminders: [...state.reminders, reminder] })),
  removeReminder: (id) => set((state) => ({
    reminders: state.reminders.filter((reminder) => reminder.id !== id),
  })),
}));

function formatLocalDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
