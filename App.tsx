
import React, { useState, useCallback, useEffect } from 'react';
import { LotteryForm } from './components/LotteryForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { PROVINCES, PRIZE_CATEGORIES } from './constants';
// Updated import: ApiLotteryPayload instead of ApiLotteryResponseData
import type { Province, WinningResult, ParsedPrizeDetail, ApiLotteryResponse, ApiLotteryResultItem, ApiLotteryPayload } from './types';
import { fetchLotteryResults } from './services/lotteryService';

const App: React.FC = () => {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [lotteryNumber, setLotteryNumber] = useState<string>('');
  const [winningResult, setWinningResult] = useState<WinningResult | null>(null);
  const [fullResults, setFullResults] = useState<ParsedPrizeDetail[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Full reset for the reset button
  const fullReset = useCallback(() => {
    setSelectedProvince(null);
    setSelectedDate('');
    setLotteryNumber('');
    setWinningResult(null);
    setFullResults(null);
    setError(null);
    setIsLoading(false);
  }, []);

  // Partial reset before lookup, keeps form inputs for retry or if lookup fails early
  const resetResultsAndError = useCallback(() => {
    setWinningResult(null);
    setFullResults(null);
    setError(null);
  }, []);


  const parsePrizeDetails = (detailString: string): ParsedPrizeDetail[] => {
    try {
      const rawDetails: string[] = JSON.parse(detailString);
      return PRIZE_CATEGORIES.map((category) => {
        const numbersString = rawDetails[category.prizeIndex] || "";
        return {
          prizeName: category.name,
          numbers: numbersString.split(',').map(num => num.trim()).filter(num => num),
        };
      });
    } catch (e) {
      console.error("Failed to parse prize details:", e);
      return [];
    }
  };
  
  const checkWinningNumber = (userNumber: string, prizes: ParsedPrizeDetail[]): WinningResult | null => {
    if (!userNumber || userNumber.length < 2) return null;

    for (const category of PRIZE_CATEGORIES) { 
        const prizeDetail = prizes.find(p => p.prizeName === category.name);
        if (prizeDetail && prizeDetail.numbers.length > 0) {
            const requiredDigits = category.digits;
            
            if (userNumber.length < requiredDigits) {
                continue;
            }

            const userSuffix = userNumber.slice(-requiredDigits);

            for (const winningNum of prizeDetail.numbers) {
                if (winningNum.length >= requiredDigits) { 
                    const winningSuffix = winningNum.slice(-requiredDigits);
                    if (userSuffix === winningSuffix) {
                        return { 
                            prizeName: category.name, 
                            matchedNumber: winningNum, 
                            userNumber,
                            prizeValue: category.value // Add prize value here
                        };
                    }
                }
            }
        }
    }
    return null;
  };

  const handleLookup = useCallback(async () => {
    if (!selectedProvince || !selectedDate || !lotteryNumber) {
      setError("Vui lòng chọn tỉnh, ngày và nhập số vé.");
      return;
    }
    if (!/^\d{2,6}$/.test(lotteryNumber)) { 
        setError("Số vé không hợp lệ. Phải là 2-6 chữ số.");
        return;
    }

    setIsLoading(true);
    resetResultsAndError(); 

    try {
      const [year, month, day] = selectedDate.split('-');
      const apiDate = `${day}/${month}/${year}`;
      
      const results: ApiLotteryResponse = await fetchLotteryResults(selectedProvince.code);
      
      // Access data via results.t (payload is now in 't' field)
      // The service ensures results.t exists and results.t.issueList is an array.
      if (!results.t) {
        // This case should ideally be handled by the service synthesizing 't',
        // but as a fallback:
        setError(`Không nhận được dữ liệu kết quả cho ${selectedProvince.name} ngày ${apiDate}.`);
        setFullResults(null);
        setIsLoading(false); // Ensure loading is stopped
        return;
      }

      const dailyResult: ApiLotteryResultItem | undefined = results.t.issueList.find(item => item.turnNum === apiDate);

      if (dailyResult) {
        const parsedPrizes = parsePrizeDetails(dailyResult.detail);
        if (parsedPrizes.length === 0 && dailyResult.detail !== "[]") { 
             setError("Lỗi xử lý dữ liệu kết quả. Dữ liệu có thể không đúng định dạng.");
             setFullResults(null);
        } else {
            setFullResults(parsedPrizes);
            const win = checkWinningNumber(lotteryNumber, parsedPrizes);
            setWinningResult(win);
        }
      } else {
        setError(`Không tìm thấy kết quả cho ${selectedProvince.name} ngày ${apiDate}. Vui lòng kiểm tra lại ngày hoặc thử một ngày khác.`);
        setFullResults(null);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định khi tra cứu.");
      setFullResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProvince, selectedDate, lotteryNumber, resetResultsAndError]);


  useEffect(() => {
    setWinningResult(null);
    setFullResults(null);
  }, [selectedProvince, selectedDate]);


  return (
    // Thay đổi min-h-screen thành flex-grow để hoạt động với #root { display: flex; flex-direction: column; }
    // Màn hình tổng thể vẫn sẽ có chiều cao ít nhất bằng viewport do cài đặt body/html/root.
    // Thêm overflow-y-auto ở đây để div cụ thể này tự cuộn nội dung nếu nó vượt quá viewport,
    // vì #root và body giờ đây chủ yếu dùng cho cấu trúc.
    <div className="flex-grow bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 py-6 flex flex-col items-center sm:py-12 overflow-y-auto">
      <div className="relative py-3 sm:max-w-xl md:max-w-4xl lg:max-w-5xl w-full px-4"> {/* Adjusted overall card width from previous steps */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-indigo-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-2xl sm:rounded-3xl sm:p-10 md:p-12">
          <div className="w-full"> {/* Changed from max-w-md mx-auto to w-full */}
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-sky-600 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
              </svg>
              <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Tra Cứu Xổ Số</h1>
              <p className="mt-2 text-sm text-gray-600">Kiểm tra kết quả xổ số miền Nam nhanh chóng</p>
            </div>
            <LotteryForm
              provinces={PROVINCES}
              selectedProvince={selectedProvince}
              setSelectedProvince={setSelectedProvince}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              lotteryNumber={lotteryNumber}
              setLotteryNumber={setLotteryNumber}
              onLookup={handleLookup}
              isLoading={isLoading}
              resetFormAndResults={fullReset} 
            />
            {isLoading && <LoadingSpinner />}
            {error && !isLoading && <ErrorMessage message={error} onClose={() => setError(null)} />}
            
            {!isLoading && !error && (winningResult !== null || fullResults !== null) && (
              <ResultsDisplay
                winningResult={winningResult}
                fullResults={fullResults}
                provinceName={selectedProvince?.name}
                lookupDate={selectedDate}
                userLotteryNumberInput={lotteryNumber} 
              />
            )}
          </div>
        </div>
      </div>
       <footer className="text-center mt-8 text-sm text-gray-500 px-4 pb-6"> {/* Thêm pb-6 để có thêm không gian */}
        <p>&copy; {new Date().getFullYear()} Tra Cứu Xổ Số. Dữ liệu tham khảo từ xoso188.net.</p>
        <p>Kết quả chỉ mang tính chất tham khảo. Không dùng cho mục đích cá cược, cờ bạc.</p>
      </footer>
    </div>
  );
};

export default App;
