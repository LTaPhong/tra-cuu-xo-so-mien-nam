
import React from 'react';
import type { WinningResult, ParsedPrizeDetail } from '../types';
import { PrizeTable } from './PrizeTable';
import { TrophyIcon, SadFaceIcon } from './icons/ResultIcons'; // Removed InfoIcon

interface ResultsDisplayProps {
  winningResult: WinningResult | null;
  fullResults: ParsedPrizeDetail[] | null;
  provinceName?: string;
  lookupDate?: string; // YYYY-MM-DD
  userLotteryNumberInput: string; // Added prop for the original user input
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
    winningResult, 
    fullResults, 
    provinceName, 
    lookupDate,
    userLotteryNumberInput 
}) => {
  // App.tsx ensures this component is rendered only when (winningResult !== null || fullResults !== null)
  // So, the initial check for (!fullResults && !winningResult) is no longer needed here.

  return (
    <div className="mt-8 space-y-6">
      {winningResult ? (
        <div className="p-6 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-lg animate-fadeIn">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrophyIcon />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-green-800">Chúc mừng! Bạn đã trúng thưởng!</h3>
              <p className="mt-1 text-lg text-green-700">
                Số vé: <span className="font-semibold">{winningResult.userNumber}</span>
              </p>
              <p className="text-lg text-green-700">
                Giải thưởng: <span className="font-semibold">{winningResult.prizeName}</span>
              </p>
              <p className="text-lg text-green-700">
                Số trúng khớp: <span className="font-semibold">{winningResult.matchedNumber}</span>
              </p>
              <p className="mt-2 text-xl font-bold text-green-700">
                Giá trị giải thưởng: <span className="text-green-600 underline">{winningResult.prizeValue}</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
         // This block is rendered if winningResult is null.
         // Given App.tsx's rendering condition, fullResults should be non-null here.
         // The "fullResults &&" check is a safe guard.
         fullResults && ( 
            <div className="p-6 bg-red-50 border-l-4 border-red-400 rounded-r-lg shadow-md animate-fadeIn">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                <SadFaceIcon />
                </div>
                <div className="ml-4">
                <h3 className="text-2xl font-bold text-red-800">Rất tiếc!</h3>
                <p className="mt-1 text-lg text-red-700">
                    Số vé <span className="font-semibold">{userLotteryNumberInput}</span> không trúng thưởng lần này.
                </p>
                <p className="text-base text-gray-600">Chúc bạn may mắn lần sau!</p>
                </div>
            </div>
            </div>
         )
      )}

      {fullResults && fullResults.length > 0 && (
        <div className="mt-6 animate-fadeInUp">
          <h4 className="text-2xl font-semibold text-gray-700 mb-3 text-center">
            Bảng Kết Quả Xổ Số {provinceName ? `${provinceName} - ` : ''}
            {lookupDate ? `Ngày ${new Date(lookupDate + 'T00:00:00').toLocaleDateString('vi-VN')}` : ''}
          </h4>
          <PrizeTable parsedDetails={fullResults} userLotteryNumber={userLotteryNumberInput} />
        </div>
      )}
    </div>
  );
};
