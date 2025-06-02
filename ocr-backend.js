
// Simple Express backend for Gemini OCR (ESM style)
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors({
  origin: 'https://ltaphong.github.io',
}));
app.use(express.json({ limit: '10mb' }));

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables.');
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

app.post('/api/ocr', async (req, res) => {
  const { base64ImageData, mimeType, provinceNames } = req.body;
  if (!base64ImageData || !mimeType || !provinceNames) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  const model = 'gemini-2.5-flash-preview-04-17';
  const provinceListString = provinceNames.join(', ');
  const prompt = `\nTừ hình ảnh vé số Việt Nam được cung cấp, vui lòng trích xuất các thông tin sau và trả về dưới dạng một đối tượng JSON:\n1. \"lotteryNumber\": Chuỗi số dự thưởng, là một số có 5 hoặc 6 chữ số. Nếu có nhiều số, ưu tiên số dài nhất và rõ ràng nhất.\n2. \"provinceName\": Tên tỉnh/thành phố. Phải là một trong các tên sau: ${provinceListString}. Chọn tên phù hợp nhất và chính xác nhất từ danh sách.\n3. \"drawDate\": Ngày quay thưởng được ghi trên vé (ví dụ: dd/mm/yyyy, dd.mm.yyyy, dd-mm-yy). Chuyển đổi sang định dạng YYYY-MM-DD.\n\nVí dụ đối tượng JSON mong muốn:\n{\n  \"lotteryNumber\": \"123456\",\n  \"provinceName\": \"TP. HCM\",\n  \"drawDate\": \"2024-07-15\"\n}\n\nNếu không tìm thấy một trường thông tin nào đó một cách rõ ràng, hãy đặt giá trị của trường đó là null trong đối tượng JSON.\nChỉ trả về đối tượng JSON hợp lệ, không có bất kỳ văn bản giải thích nào khác bao quanh nó.\n`;
  const imagePart = { inlineData: { mimeType, data: base64ImageData } };
  const textPart = { text: prompt };
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [imagePart, textPart] }],
      config: { responseMimeType: 'application/json' }
    });
    let rawResponseText = response.text ?? '';
    rawResponseText = rawResponseText.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = rawResponseText.match(fenceRegex);
    if (match && match[2]) rawResponseText = match[2].trim();
    let parsedData;
    try {
      parsedData = JSON.parse(rawResponseText);
    } catch (e) {
      return res.status(500).json({ error: 'Lỗi phân tích dữ liệu OCR từ Gemini. Dữ liệu trả về không phải JSON hợp lệ.', rawText: rawResponseText });
    }
    res.json({ ...parsedData, rawText: response.text });
  } catch (error) {
    let errorMessage = 'Lỗi gọi Gemini API: ';
    if (error.message) errorMessage += error.message;
    else if (error.toString) errorMessage += error.toString();
    else errorMessage += 'Lỗi không xác định.';
    return res.status(500).json({ error: errorMessage });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`OCR backend listening on port ${PORT}`);
});
