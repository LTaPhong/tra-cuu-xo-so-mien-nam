
import React from 'react';
import type { ParsedPrizeDetail } from '../types';
import { PRIZE_CATEGORIES } from '../constants';

interface PrizeTableProps {
  parsedDetails: ParsedPrizeDetail[];
  userLotteryNumber?: string; // Full user input number
}

export const PrizeTable: React.FC<PrizeTableProps> = ({ parsedDetails, userLotteryNumber }) => {
  if (!parsedDetails || parsedDetails.length === 0) {
    return <p className="text-center text-gray-600">Không có dữ liệu bảng kết quả.</p>;
  }

  const highlightNumber = (prizeNum: string, userInput: string | undefined): React.ReactNode => {
    if (!userInput || userInput.length === 0 || prizeNum.length === 0) {
      return prizeNum;
    }

    let prizeIdx = prizeNum.length - 1;
    let userInputIdx = userInput.length - 1;
    let trailingMatchesCount = 0;

    // Count consecutive matching characters from the right
    while (prizeIdx >= 0 && userInputIdx >= 0) {
      if (prizeNum[prizeIdx] === userInput[userInputIdx]) {
        trailingMatchesCount++;
        prizeIdx--;
        userInputIdx--;
      } else {
        break; // Stop if a mismatch is found
      }
    }

    if (trailingMatchesCount > 0) {
      const nonMatchedPart = prizeNum.substring(0, prizeNum.length - trailingMatchesCount);
      const matchedPart = prizeNum.substring(prizeNum.length - trailingMatchesCount);
      return (
        <>
          {nonMatchedPart}
          <span className="bg-yellow-300 text-red-700 font-bold px-1 rounded">
            {matchedPart}
          </span>
        </>
      );
    }

    return prizeNum; // No trailing match, return original number
  };


  return (
    <div className="overflow-x-auto bg-white shadow-xl rounded-lg p-2 sm:p-4">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
        <thead className="bg-sky-500">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Giải
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Số Trúng Thưởng
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {PRIZE_CATEGORIES.map((category) => {
            const detail = parsedDetails.find(d => d.prizeName === category.name);
            if (!detail || detail.numbers.length === 0) {
              return (
                <tr key={category.name} className={category.prizeIndex % 2 === 0 ? 'bg-white' : 'bg-sky-50'}>
                  <td className="px-4 py-3 whitespace-nowrap text-base font-medium text-gray-800">{category.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-base text-gray-500 italic">Không có</td>
                </tr>
              );
            }
            return (
              <tr key={category.name} className={category.prizeIndex % 2 === 0 ? 'bg-white' : 'bg-sky-50 hover:bg-sky-100 transition-colors duration-150'}>
                <td className="px-4 py-3 whitespace-nowrap text-base font-medium text-gray-800 align-top">
                  {category.name}
                </td>
                <td className="px-4 py-3 text-gray-700"> {/* Removed text-sm from here as individual spans control it */}
                  <div className="flex flex-wrap gap-2">
                    {detail.numbers.map((num, index) => (
                      <span key={index} className="p-2 border border-gray-300 rounded-md text-center bg-gray-50 shadow-sm font-mono tracking-wider text-2xl font-semibold">
                        {highlightNumber(num, userLotteryNumber)}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
