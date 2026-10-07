import type { Holiday } from "./types";

/**
 * Bundled baseline data. Keep sourceVersion explicit so a future app release
 * can update local holiday definitions without requiring an API.
 */
export const DEFAULT_HOLIDAYS: readonly Holiday[] = [
  {
    id: "tet-duong-lich",
    name: "Tết Dương lịch",
    calendarType: "solar",
    month: 1,
    day: 1,
    year: null,
    official: true,
    note: null,
    sourceVersion: "2026.1",
  },
  {
    id: "tet-nguyen-dan",
    name: "Tết Nguyên Đán",
    calendarType: "lunar",
    month: 1,
    day: 1,
    year: null,
    official: true,
    note: null,
    sourceVersion: "2026.1",
  },
  {
    id: "gio-to-hung-vuong",
    name: "Giỗ Tổ Hùng Vương",
    calendarType: "lunar",
    month: 3,
    day: 10,
    year: null,
    official: true,
    note: null,
    sourceVersion: "2026.1",
  },
  {
    id: "giai-phong-mien-nam",
    name: "Ngày Giải phóng miền Nam",
    calendarType: "solar",
    month: 4,
    day: 30,
    year: null,
    official: true,
    note: null,
    sourceVersion: "2026.1",
  },
  {
    id: "quoc-te-lao-dong",
    name: "Ngày Quốc tế Lao động",
    calendarType: "solar",
    month: 5,
    day: 1,
    year: null,
    official: true,
    note: null,
    sourceVersion: "2026.1",
  },
  {
    id: "quoc-khanh",
    name: "Quốc khánh Việt Nam",
    calendarType: "solar",
    month: 9,
    day: 2,
    year: null,
    official: true,
    note: null,
    sourceVersion: "2026.1",
  },
];
