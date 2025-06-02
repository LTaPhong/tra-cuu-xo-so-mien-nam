
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Province } from '../types';
import { DayOfWeek } from '../types'; 
import { DAY_OF_WEEK_MAP_VI, PROVINCES } from '../constants';
import { ImageUploadIcon, SearchIcon, CalendarIcon, TicketIcon, RefreshIcon } from './icons/FormIcons';
import { performOcrWithGemini, OcrResult } from '../services/ocrService'; // Import Gemini OCR service

interface LotteryFormProps {
  provinces: Province[];
  selectedProvince: Province | null;
  setSelectedProvince: (province: Province | null) => void;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  lotteryNumber: string;
  setLotteryNumber: (number: string) => void;
  onLookup: () => void;
  isLoading: boolean;
  resetFormAndResults: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]); // Get base64 part
    reader.onerror = error => reject(error);
  });
};

// Helper to normalize text for province matching (optional, if Gemini struggles with exact names)
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/đ/g, "d");
};


export const LotteryForm: React.FC<LotteryFormProps> = ({
  provinces,
  selectedProvince,
  setSelectedProvince,
  selectedDate,
  setSelectedDate,
  lotteryNumber,
  setLotteryNumber,
  onLookup,
  isLoading,
  resetFormAndResults
}) => {
  const [availableProvinces, setAvailableProvinces] = useState<Province[]>(provinces);
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrSuccessMessage, setOcrSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDayOfWeekFromDate = (dateString: string): DayOfWeek | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const localDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return localDate.getDay() as DayOfWeek;
  };

  useEffect(() => {
    const dayOfWeek = getDayOfWeekFromDate(selectedDate);
    if (dayOfWeek !== null) {
      const filteredProvinces = provinces.filter(p => p.days.includes(dayOfWeek));
      setAvailableProvinces(filteredProvinces);
      if (selectedProvince && !filteredProvinces.find(p => p.code === selectedProvince.code)) {
        setSelectedProvince(null);
      }
    } else {
      setAvailableProvinces(provinces);
    }
  }, [selectedDate, provinces, selectedProvince, setSelectedProvince]);
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    // setLotteryNumber(''); // User might want to keep number if only changing date
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceCode = e.target.value;
    const province = provinces.find(p => p.code === provinceCode) || null;
    setSelectedProvince(province);
    // setLotteryNumber(''); // User might want to keep number if only changing province
  };

  const handleLotteryNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setLotteryNumber(value);
    }
  };
  
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOcrLoading(true);
      setOcrError(null);
      setOcrSuccessMessage(null);
      try {
        const base64ImageData = await fileToBase64(file);
        const provinceNamesForPrompt = PROVINCES.map(p => p.name);
        
        const result: OcrResult = await performOcrWithGemini(base64ImageData, file.type, provinceNamesForPrompt);

        if (result.error) {
          setOcrError(result.error);
        } else {
          let messages: string[] = [];
          if (result.lotteryNumber && /^\d{2,6}$/.test(result.lotteryNumber)) {
            setLotteryNumber(result.lotteryNumber);
            messages.push(`Số vé: ${result.lotteryNumber}`);
          } else if (result.lotteryNumber) {
             messages.push(`Số vé OCR (cần kiểm tra): ${result.lotteryNumber}`);
          }


          if (result.provinceName) {
            // Try to find an exact match first (Gemini should return one from the list)
            let foundProvince = provinces.find(p => p.name === result.provinceName);
            
            // Fallback: If no exact match, try a normalized comparison (more robust)
            if (!foundProvince) {
                const normalizedOcrProvince = normalizeString(result.provinceName);
                foundProvince = provinces.find(p => normalizeString(p.name) === normalizedOcrProvince);
            }

            if (foundProvince) {
              setSelectedProvince(foundProvince);
              messages.push(`Tỉnh/Thành: ${foundProvince.name}`);
            } else {
              messages.push(`Tỉnh/Thành OCR (cần kiểm tra): ${result.provinceName}`);
            }
          }

          if (result.drawDate && /^\d{4}-\d{2}-\d{2}$/.test(result.drawDate)) {
             // Basic validation: check if date is plausible (e.g., not too far in past/future)
            const dateParts = result.drawDate.split('-').map(Number);
            const ocrDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            const currentYear = new Date().getFullYear();
            if (ocrDate.getFullYear() >= currentYear - 5 && ocrDate.getFullYear() <= currentYear + 5) {
                 setSelectedDate(result.drawDate);
                 messages.push(`Ngày: ${new Date(result.drawDate + 'T00:00:00').toLocaleDateString('vi-VN')}`);
            } else {
                messages.push(`Ngày OCR (không hợp lệ): ${result.drawDate}`);
            }
          } else if (result.drawDate) {
              messages.push(`Ngày OCR (cần kiểm tra định dạng): ${result.drawDate}`);
          }

          if (messages.length > 0) {
            setOcrSuccessMessage(`Đã nhận diện từ ảnh: ${messages.join('; ')}. Vui lòng kiểm tra lại.`);
          } else {
            setOcrError("Không nhận diện được thông tin nào từ ảnh. Vui lòng thử ảnh rõ hơn.");
          }
          // console.log("Gemini Raw Text:", result.rawText); // For debugging
        }
      } catch (err) {
        console.error("OCR Processing Error:", err);
        setOcrError("Lỗi xử lý ảnh OCR: " + (err instanceof Error ? err.message : "Lỗi không xác định"));
      } finally {
        setOcrLoading(false);
        if(fileInputRef.current) {
            fileInputRef.current.value = ""; 
        }
      }
    }
  }, [setLotteryNumber, setSelectedProvince, setSelectedDate, provinces]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLookup();
  };
  
  const currentDayOfWeek = getDayOfWeekFromDate(selectedDate);

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          <CalendarIcon /> Ngày quay thưởng
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out"
          required
        />
        {selectedDate && currentDayOfWeek !== null && (
          <p className="text-xs text-gray-500 mt-1">
            Ngày được chọn: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('vi-VN')} ({DAY_OF_WEEK_MAP_VI[currentDayOfWeek as DayOfWeek]})
          </p>
        )}
      </div>

      <div>
        <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
          <TicketIcon /> Tỉnh/Thành phố
        </label>
        <select
          id="province"
          value={selectedProvince?.code || ''}
          onChange={handleProvinceChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out"
          required
          disabled={!selectedDate || availableProvinces.length === 0}
        >
          <option value="" disabled>{availableProvinces.length === 0 && selectedDate ? "Không có đài nào quay hôm nay" : "-- Chọn tỉnh --"}</option>
          {availableProvinces.map(p => (
            <option key={p.code} value={p.code}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="lotteryNumber" className="block text-sm font-medium text-gray-700 mb-1">
          <TicketIcon /> Số dự thưởng (2-6 chữ số)
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            id="lotteryNumber"
            value={lotteryNumber}
            onChange={handleLotteryNumberChange}
            placeholder="Nhập số vé"
            className="flex-grow w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out"
            required
            pattern="\d{2,6}"
            title="Nhập từ 2 đến 6 chữ số"
            maxLength={6}
          />
          <label htmlFor="ocrUpload" className={`cursor-pointer p-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition duration-150 ease-in-out shadow-sm ${ocrLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Tải ảnh vé số để nhận diện bằng Gemini"
          >
            <ImageUploadIcon />
          </label>
          <input 
            type="file" 
            id="ocrUpload" 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="hidden"
            ref={fileInputRef}
            disabled={ocrLoading} 
          />
        </div>
        {ocrLoading && (
          <div className="mt-2 text-center">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-xs text-sky-600">Đang phân tích ảnh bằng Gemini...</p>
            </div>
          </div>
        )}
        {ocrError && <p className="text-xs text-red-600 mt-1 animate-fadeIn">{ocrError}</p>}
        {ocrSuccessMessage && <p className="text-xs text-green-600 mt-1 animate-fadeIn">{ocrSuccessMessage}</p>}
      </div>
      
      <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0 pt-2">
        <button
          type="submit"
          disabled={isLoading || ocrLoading || !selectedProvince || !selectedDate || !lotteryNumber || !/^\d{2,6}$/.test(lotteryNumber)}
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          <SearchIcon />
          {isLoading ? 'Đang tra cứu...' : 'Tra Cứu Kết Quả'}
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedDate('');
            setSelectedProvince(null);
            setLotteryNumber('');
            resetFormAndResults(); 
            if(fileInputRef.current) fileInputRef.current.value = "";
            setOcrError(null);
            setOcrSuccessMessage(null);
          }}
          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition duration-150 ease-in-out"
        >
         <RefreshIcon /> Đặt lại
        </button>
      </div>
    </form>
  );
};
