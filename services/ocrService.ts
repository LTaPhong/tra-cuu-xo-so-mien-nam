
// Import GoogleGenAI as named, and HarmCategory/HarmBlockThreshold as named.
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, GenerateContentResponse } from "@google/genai";

export interface OcrResult {
  lotteryNumber?: string | null;
  provinceName?: string | null;
  drawDate?: string | null; // YYYY-MM-DD
  error?: string;
  rawText?: string; // For debugging
}
export const performOcrWithGemini = async (
  base64ImageData: string,
  mimeType: string,
  provinceNames: string[]
): Promise<OcrResult> => {
  try {
    const response = await fetch('https://ocr-backend-jdbq.onrender.com/api/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64ImageData, mimeType, provinceNames })
    });
    const data = await response.json();
    return data;
  } catch (error: any) {
    return { error: 'Lỗi kết nối tới OCR backend: ' + (error?.message || 'Không xác định') };
  }
};
