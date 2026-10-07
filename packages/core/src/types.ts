/** A Gregorian calendar date. Month is one-based (January = 1). */
export interface SolarDate {
  day: number;
  month: number;
  year: number;
}

/** A Vietnamese lunar date in the requested time zone. */
export interface LunarDate extends SolarDate {
  isLeapMonth: boolean;
}

/** Heavenly stem and earthly branch labels for a solar date. */
export interface CanChiDate {
  day: string;
  month: string;
  year: string;
}

/** The 24 solar terms, ordered by apparent solar longitude from 0 degrees. */
export const VIETNAMESE_SOLAR_TERMS = [
  "Xuân phân",
  "Thanh minh",
  "Cốc vũ",
  "Lập hạ",
  "Tiểu mãn",
  "Mang chủng",
  "Hạ chí",
  "Tiểu thử",
  "Đại thử",
  "Lập thu",
  "Xử thử",
  "Bạch lộ",
  "Thu phân",
  "Hàn lộ",
  "Sương giáng",
  "Lập đông",
  "Tiểu tuyết",
  "Đại tuyết",
  "Đông chí",
  "Tiểu hàn",
  "Đại hàn",
  "Lập xuân",
  "Vũ thủy",
  "Kinh trập",
] as const;

export type SolarTermName = (typeof VIETNAMESE_SOLAR_TERMS)[number];

/** Solar term containing local noon of the requested Gregorian date. */
export interface SolarTerm {
  /** Index into VIETNAMESE_SOLAR_TERMS. */
  index: number;
  name: SolarTermName;
  /** Apparent ecliptic longitude normalized to [0, 360). */
  longitudeDegrees: number;
}

/** Complete offline calendar result for one Gregorian date. */
export interface VietnameseCalendarDate {
  solar: SolarDate;
  lunar: LunarDate;
  canChi: CanChiDate;
  solarTerm: SolarTerm;
  timeZone: number;
}

/** One auspicious two-hour period for a given solar date. */
export interface AuspiciousHour {
  /** Earthly branch index, where Tý = 0 and Hợi = 11. */
  branchIndex: number;
  /** Can Chi name of the hour, for example “Bính Dần”. */
  name: string;
  /** Local 24-hour range, for example “03:00–05:00”. */
  range: string;
}
