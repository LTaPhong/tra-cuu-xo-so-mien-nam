
export enum DayOfWeek {
  SUNDAY = 0, // Sunday
  MONDAY = 1, // Monday
  TUESDAY = 2, // Tuesday
  WEDNESDAY = 3, // Wednesday
  THURSDAY = 4, // Thursday
  FRIDAY = 5, // Friday
  SATURDAY = 6  // Saturday
}

export interface Province {
  name: string;
  code: string;
  days: DayOfWeek[];
}

export interface ApiLotteryResultItem {
  id?: number; 
  turnNum: string; // Format DD/MM/YYYY
  code?: string; 
  detail: string; // JSON string array of prize numbers
  provinceName?: string; 
  openNum?: string; 
  openTime?: string; 
  openTimeStamp?: number; 
  status?: number; 
  replayUrl?: string | null;
  n11?: string | null; 
  jackpot?: number; 
}

// Renamed from ApiLotteryResponseData, represents the structure of the 't' field in the API response
export interface ApiLotteryPayload {
  issueList: ApiLotteryResultItem[];
  name?: string; // Province name from API
  turnNum?: string; // Current turn number from API (might be different from selected date)
  openTime?: string; // Current open time from API
  serverTime?: string;
  code?: string; // Province code from API
  sort?: number; // e.g., 30.0
  navCate?: string;
}

// Updated to match the new API response structure
export interface ApiLotteryResponse {
  success: boolean; // New field indicating overall success
  code: number;     // API status code (0 for success in conjunction with success:true)
  msg: string;      // API message
  t?: ApiLotteryPayload | null; // The main data payload, nested under 't'
}

export interface ParsedPrizeDetail {
  prizeName: string;
  numbers: string[]; 
}

export interface WinningResult {
  prizeName: string;
  matchedNumber: string;
  userNumber: string;
  prizeValue: string; // Added to store the value of the prize
}

export interface PrizeCategory {
  name: string;
  digits: number; 
  prizeIndex: number; 
  value: string; // Added to store the monetary value of the prize (e.g., "2.000.000 VNĐ")
}