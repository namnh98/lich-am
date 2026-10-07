import {
  VIETNAMESE_SOLAR_TERMS,
  type AuspiciousHour,
  type CanChiDate,
  type LunarDate,
  type SolarDate,
  type SolarTerm,
  type VietnameseCalendarDate,
} from "./types";

export const DEFAULT_TIME_ZONE = 7;

const STEMS = [
  "Giáp",
  "Ất",
  "Bính",
  "Đinh",
  "Mậu",
  "Kỷ",
  "Canh",
  "Tân",
  "Nhâm",
  "Quý",
] as const;

const BRANCHES = [
  "Tý",
  "Sửu",
  "Dần",
  "Mão",
  "Thìn",
  "Tỵ",
  "Ngọ",
  "Mùi",
  "Thân",
  "Dậu",
  "Tuất",
  "Hợi",
] as const;

// Six repeating auspicious-hour patterns indexed by the day's earthly branch.
const AUSPICIOUS_HOUR_PATTERNS = [
  "110100101100",
  "001101001011",
  "110011010010",
  "101100110100",
  "001011001101",
  "010010110011",
] as const;

const INT = Math.floor;
const PI = Math.PI;

export function julianDayFromDate(day: number, month: number, year: number): number {
  validateSolarDate(day, month, year);
  const a = INT((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jd = day + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;

  if (jd < 2299161) {
    jd = day + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }

  return jd;
}

export function dateFromJulianDay(julianDay: number): SolarDate {
  let a: number;
  let b: number;

  if (julianDay > 2299160) {
    a = julianDay + 32044;
    b = INT((4 * a + 3) / 146097);
    a -= INT((b * 146097) / 4);
  } else {
    b = 0;
    a = julianDay + 32082;
  }

  const c = INT((4 * a + 3) / 1461);
  const d = a - INT((1461 * c) / 4);
  const e = INT((5 * d + 2) / 153);
  const day = d - INT((153 * e + 2) / 5) + 1;
  const month = e + 3 - 12 * INT(e / 10);
  const year = b * 100 + c - 4800 + INT(e / 10);

  return { day, month, year };
}

function newMoon(k: number): number {
  const time = k / 1236.85;
  const time2 = time * time;
  const time3 = time2 * time;
  const radians = PI / 180;
  let result = 2415020.75933 + 29.53058868 * k + 0.0001178 * time2 - 0.000000155 * time3;
  result += 0.00033 * Math.sin((166.56 + 132.87 * time - 0.009173 * time2) * radians);

  const meanAnomalySun = 359.2242 + 29.10535608 * k - 0.0000333 * time2 - 0.00000347 * time3;
  const meanAnomalyMoon = 306.0253 + 385.81691806 * k + 0.0107306 * time2 + 0.00001236 * time3;
  const argumentLatitude = 21.2964 + 390.67050646 * k - 0.0016528 * time2 - 0.00000239 * time3;

  let correction = (0.1734 - 0.000393 * time) * Math.sin(meanAnomalySun * radians);
  correction += 0.0021 * Math.sin(2 * meanAnomalySun * radians);
  correction -= 0.4068 * Math.sin(meanAnomalyMoon * radians);
  correction += 0.0161 * Math.sin(2 * meanAnomalyMoon * radians);
  correction -= 0.0004 * Math.sin(3 * meanAnomalyMoon * radians);
  correction += 0.0104 * Math.sin(2 * argumentLatitude * radians);
  correction -= 0.0051 * Math.sin((meanAnomalySun + meanAnomalyMoon) * radians);
  correction -= 0.0074 * Math.sin((meanAnomalySun - meanAnomalyMoon) * radians);
  correction += 0.0004 * Math.sin((2 * argumentLatitude + meanAnomalySun) * radians);
  correction -= 0.0004 * Math.sin((2 * argumentLatitude - meanAnomalySun) * radians);
  correction -= 0.0006 * Math.sin((2 * argumentLatitude + meanAnomalyMoon) * radians);
  correction += 0.001 * Math.sin((2 * argumentLatitude - meanAnomalyMoon) * radians);
  correction += 0.0005 * Math.sin((2 * meanAnomalyMoon + meanAnomalySun) * radians);

  const deltaTime = time < -11
    ? 0.001 + 0.000839 * time + 0.0002261 * time2 - 0.00000845 * time3 - 0.000000081 * time * time3
    : -0.000278 + 0.000265 * time + 0.000262 * time2;

  return result + correction - deltaTime;
}

function sunLongitude(julianDay: number): number {
  const time = (julianDay - 2451545) / 36525;
  const time2 = time * time;
  const radians = PI / 180;
  const meanAnomaly = 357.5291 + 35999.0503 * time - 0.0001559 * time2 - 0.00000048 * time * time2;
  const meanLongitude = 280.46645 + 36000.76983 * time + 0.0003032 * time2;
  let deltaLongitude = (1.9146 - 0.004817 * time - 0.000014 * time2) * Math.sin(radians * meanAnomaly);
  deltaLongitude += (0.019993 - 0.000101 * time) * Math.sin(2 * radians * meanAnomaly);
  deltaLongitude += 0.00029 * Math.sin(3 * radians * meanAnomaly);

  let longitude = (meanLongitude + deltaLongitude) * radians;
  longitude -= PI * 2 * INT(longitude / (PI * 2));
  return longitude;
}

function newMoonDay(k: number, timeZone: number): number {
  return INT(newMoon(k) + 0.5 + timeZone / 24);
}

function sunLongitudeSector(dayNumber: number, timeZone: number): number {
  return INT((sunLongitude(dayNumber - 0.5 - timeZone / 24) / PI) * 6);
}

function lunarMonth11(year: number, timeZone: number): number {
  const offset = julianDayFromDate(31, 12, year) - 2415021;
  const k = INT(offset / 29.530588853);
  let newMoonDate = newMoonDay(k, timeZone);
  if (sunLongitudeSector(newMoonDate, timeZone) >= 9) {
    newMoonDate = newMoonDay(k - 1, timeZone);
  }
  return newMoonDate;
}

function leapMonthOffset(month11: number, timeZone: number): number {
  const k = INT(0.5 + (month11 - 2415021.076998695) / 29.530588853);
  let index = 1;
  let lastArc = sunLongitudeSector(newMoonDay(k + index, timeZone), timeZone);
  let arc: number;

  do {
    index += 1;
    arc = sunLongitudeSector(newMoonDay(k + index, timeZone), timeZone);
    if (arc === lastArc || index >= 14) break;
    lastArc = arc;
  } while (true);

  return index - 1;
}

export function solarToLunar(
  day: number,
  month: number,
  year: number,
  timeZone = DEFAULT_TIME_ZONE,
): LunarDate {
  const dayNumber = julianDayFromDate(day, month, year);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = newMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) monthStart = newMoonDay(k, timeZone);

  let month11A = lunarMonth11(year, timeZone);
  let month11B = month11A;
  let lunarYear: number;

  if (month11A >= monthStart) {
    lunarYear = year;
    month11A = lunarMonth11(year - 1, timeZone);
  } else {
    lunarYear = year + 1;
    month11B = lunarMonth11(year + 1, timeZone);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const difference = INT((monthStart - month11A) / 29);
  let lunarMonth = difference + 11;
  let isLeapMonth = false;

  if (month11B - month11A > 365) {
    const leapOffset = leapMonthOffset(month11A, timeZone);
    if (difference >= leapOffset) {
      lunarMonth = difference + 10;
      if (difference === leapOffset) isLeapMonth = true;
    }
  }

  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && difference < 4) lunarYear -= 1;

  return { day: lunarDay, month: lunarMonth, year: lunarYear, isLeapMonth };
}

export function lunarToSolar(
  day: number,
  month: number,
  year: number,
  isLeapMonth = false,
  timeZone = DEFAULT_TIME_ZONE,
): SolarDate {
  if (!Number.isInteger(day) || day < 1 || day > 30 || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError("Invalid lunar date");
  }

  let month11A: number;
  let month11B: number;
  if (month < 11) {
    month11A = lunarMonth11(year - 1, timeZone);
    month11B = lunarMonth11(year, timeZone);
  } else {
    month11A = lunarMonth11(year, timeZone);
    month11B = lunarMonth11(year + 1, timeZone);
  }

  const k = INT(0.5 + (month11A - 2415021.076998695) / 29.530588853);
  let offset = month - 11;
  if (offset < 0) offset += 12;

  if (month11B - month11A > 365) {
    const leapOffset = leapMonthOffset(month11A, timeZone);
    let leapMonth = leapOffset - 2;
    if (leapMonth < 0) leapMonth += 12;

    if (isLeapMonth && month !== leapMonth) {
      throw new RangeError(`Month ${month}/${year} is not a leap lunar month`);
    }
    if (isLeapMonth || offset >= leapOffset) offset += 1;
  } else if (isLeapMonth) {
    throw new RangeError(`Lunar year ${year} has no leap month at month ${month}`);
  }

  const monthStart = newMoonDay(k + offset, timeZone);
  const result = dateFromJulianDay(monthStart + day - 1);
  const roundTrip = solarToLunar(result.day, result.month, result.year, timeZone);

  if (
    roundTrip.day !== day ||
    roundTrip.month !== month ||
    roundTrip.year !== year ||
    roundTrip.isLeapMonth !== isLeapMonth
  ) {
    throw new RangeError("The lunar day does not exist in the selected month");
  }

  return result;
}

export function getCanChi(
  day: number,
  month: number,
  year: number,
  timeZone = DEFAULT_TIME_ZONE,
): CanChiDate {
  const julianDay = julianDayFromDate(day, month, year);
  const lunar = solarToLunar(day, month, year, timeZone);
  const dayStem = positiveModulo(julianDay + 9, 10);
  const dayBranch = positiveModulo(julianDay + 1, 12);
  const monthStem = positiveModulo(lunar.year * 12 + lunar.month + 3, 10);
  const monthBranch = positiveModulo(lunar.month + 1, 12);
  const yearStem = positiveModulo(lunar.year + 6, 10);
  const yearBranch = positiveModulo(lunar.year + 8, 12);

  return {
    day: `${STEMS[dayStem]} ${BRANCHES[dayBranch]}`,
    month: `${STEMS[monthStem]} ${BRANCHES[monthBranch]}`,
    year: `${STEMS[yearStem]} ${BRANCHES[yearBranch]}`,
  };
}

/**
 * Returns the solar term active at 12:00 local time on a Gregorian date.
 *
 * A solar-term boundary is an instant, so a civil date can contain portions
 * of two terms. Evaluating at local noon gives the date-only API an explicit,
 * deterministic meaning and avoids depending on the device clock.
 */
export function getSolarTerm(
  day: number,
  month: number,
  year: number,
  timeZone = DEFAULT_TIME_ZONE,
): SolarTerm {
  const dayNumber = julianDayFromDate(day, month, year);
  validateTimeZone(timeZone);

  // A Julian day number is anchored at 12:00 UTC. Subtracting the time-zone
  // offset evaluates the Sun at 12:00 in the requested local time zone.
  const longitudeDegrees = positiveModulo(
    sunLongitude(dayNumber - timeZone / 24) * 180 / PI,
    360,
  );
  const index = INT(longitudeDegrees / 15);

  return {
    index,
    name: VIETNAMESE_SOLAR_TERMS[index]!,
    longitudeDegrees,
  };
}

/** Convert a Gregorian date to the complete Vietnamese calendar view. */
export function getVietnameseCalendarDate(
  day: number,
  month: number,
  year: number,
  timeZone = DEFAULT_TIME_ZONE,
): VietnameseCalendarDate {
  const solar = { day, month, year };

  return {
    solar,
    lunar: solarToLunar(day, month, year, timeZone),
    canChi: getCanChi(day, month, year, timeZone),
    solarTerm: getSolarTerm(day, month, year, timeZone),
    timeZone,
  };
}

export function getAuspiciousHours(day: number, month: number, year: number): AuspiciousHour[] {
  const julianDay = julianDayFromDate(day, month, year);
  const dayStem = positiveModulo(julianDay + 9, 10);
  const dayBranch = positiveModulo(julianDay + 1, 12);
  const pattern = AUSPICIOUS_HOUR_PATTERNS[dayBranch % 6];

  return BRANCHES.flatMap((branch, branchIndex) => {
    if (pattern[branchIndex] !== "1") return [];
    const stem = positiveModulo((dayStem % 5) * 2 + branchIndex, 10);
    const start = positiveModulo(branchIndex * 2 - 1, 24);
    const end = positiveModulo(branchIndex * 2 + 1, 24);
    return [{
      branchIndex,
      name: `${STEMS[stem]} ${branch}`,
      range: `${padHour(start)}:00–${padHour(end)}:00`,
    }];
  });
}

function validateSolarDate(day: number, month: number, year: number): void {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new RangeError("Date parts must be integers");
  }
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth) {
    throw new RangeError("Invalid solar date");
  }
}

function validateTimeZone(timeZone: number): void {
  if (!Number.isFinite(timeZone) || timeZone < -14 || timeZone > 14) {
    throw new RangeError("Time zone must be between UTC-14 and UTC+14");
  }
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function padHour(hour: number): string {
  return hour.toString().padStart(2, "0");
}
