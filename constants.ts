
import { Province, DayOfWeek, PrizeCategory } from './types';

export const API_BASE_URL = "https://xoso188.net/api/front/open/lottery/history/list/5/";

export const PROVINCES: Province[] = [
  { name: "TP. HCM", code: "tphc", days: [DayOfWeek.MONDAY, DayOfWeek.SATURDAY] },
  { name: "Đồng Tháp", code: "doth", days: [DayOfWeek.MONDAY] },
  { name: "Cà Mau", code: "cama", days: [DayOfWeek.MONDAY] },
  { name: "Bến Tre", code: "betr", days: [DayOfWeek.TUESDAY] },
  { name: "Vũng Tàu", code: "vuta", days: [DayOfWeek.TUESDAY] },
  { name: "Bạc Liêu", code: "bali", days: [DayOfWeek.TUESDAY] },
  { name: "Đồng Nai", code: "dona", days: [DayOfWeek.WEDNESDAY] },
  { name: "Cần Thơ", code: "cath", days: [DayOfWeek.WEDNESDAY] },
  { name: "Sóc Trăng", code: "sotr", days: [DayOfWeek.WEDNESDAY] },
  { name: "Tây Ninh", code: "tani", days: [DayOfWeek.THURSDAY] },
  { name: "An Giang", code: "angi", days: [DayOfWeek.THURSDAY] },
  { name: "Bình Thuận", code: "bith", days: [DayOfWeek.THURSDAY] },
  { name: "Vĩnh Long", code: "vilo", days: [DayOfWeek.FRIDAY] },
  { name: "Bình Dương", code: "bidu", days: [DayOfWeek.FRIDAY] },
  { name: "Trà Vinh", code: "trav", days: [DayOfWeek.FRIDAY] },
  { name: "Long An", code: "loan", days: [DayOfWeek.SATURDAY] },
  { name: "Bình Phước", code: "biph", days: [DayOfWeek.SATURDAY] },
  { name: "Hậu Giang", code: "hagi", days: [DayOfWeek.SATURDAY] },
  { name: "Tiền Giang", code: "tigi", days: [DayOfWeek.SUNDAY] },
  { name: "Kiên Giang", code: "kigi", days: [DayOfWeek.SUNDAY] },
  { name: "Đà Lạt (Lâm Đồng)", code: "dala", days: [DayOfWeek.SUNDAY] },
];

// IMPORTANT: Prize values are placeholders and may not reflect actual prize amounts.
// These should be verified and updated from an official source for accuracy.
export const PRIZE_CATEGORIES: PrizeCategory[] = [
  { name: "Giải Đặc Biệt", digits: 6, prizeIndex: 0, value: "2.000.000.000 VNĐ" },
  { name: "Giải Nhất", digits: 5, prizeIndex: 1, value: "30.000.000 VNĐ" },
  { name: "Giải Nhì", digits: 5, prizeIndex: 2, value: "15.000.000 VNĐ" },
  { name: "Giải Ba", digits: 5, prizeIndex: 3, value: "10.000.000 VNĐ" },
  { name: "Giải Tư", digits: 5, prizeIndex: 4, value: "3.000.000 VNĐ" },
  { name: "Giải Năm", digits: 4, prizeIndex: 5, value: "1.000.000 VNĐ" },
  { name: "Giải Sáu", digits: 4, prizeIndex: 6, value: "400.000 VNĐ" },
  { name: "Giải Bảy", digits: 3, prizeIndex: 7, value: "200.000 VNĐ" },
  { name: "Giải Tám", digits: 2, prizeIndex: 8, value: "100.000 VNĐ" },
];

export const DAY_OF_WEEK_MAP_VI: { [key in DayOfWeek]: string } = {
  [DayOfWeek.SUNDAY]: "Chủ Nhật",
  [DayOfWeek.MONDAY]: "Thứ Hai",
  [DayOfWeek.TUESDAY]: "Thứ Ba",
  [DayOfWeek.WEDNESDAY]: "Thứ Tư",
  [DayOfWeek.THURSDAY]: "Thứ Năm",
  [DayOfWeek.FRIDAY]: "Thứ Sáu",
  [DayOfWeek.SATURDAY]: "Thứ Bảy",
};