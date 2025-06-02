
import { API_BASE_URL } from '../constants';
import type { ApiLotteryResponse, ApiLotteryPayload } from '../types';

export const fetchLotteryResults = async (provinceCode: string): Promise<ApiLotteryResponse> => {
  const url = `${API_BASE_URL}${provinceCode}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Lỗi API: ${response.status} ${response.statusText} (URL: ${url})`);
    }

    const responseBody: ApiLotteryResponse = await response.json();

    // Primary check for overall success from API
    if (!responseBody.success || responseBody.code !== 0) {
      console.error("API error response (!success or code !== 0):", responseBody, "URL:", url);
      const apiMessage = responseBody.msg ? String(responseBody.msg).trim().toLowerCase() : "";
      let userFriendlyMessage: string;

      if (apiMessage && apiMessage !== "ok" && apiMessage !== "success") {
        userFriendlyMessage = responseBody.msg!;
      } else {
        userFriendlyMessage = `Lỗi từ API (success: ${responseBody.success}, code: ${responseBody.code}, URL: ${url}). Dữ liệu nhận được không hợp lệ hoặc có sự cố phía máy chủ.`;
      }
      throw new Error(userFriendlyMessage);
    }

    // At this point, responseBody.success === true AND responseBody.code === 0

    // Handle cases where 't' field itself might be missing or null
    if (!responseBody.t) { 
      console.warn(
        `API success (success:true, code:0) for ${provinceCode} but 't' object is null or missing. Interpreting as no data available. Original response:`, 
        responseBody, 
        "URL:", url
      );
      // Synthesize a valid ApiLotteryPayload structure with empty issueList
      const synthesizedPayload: ApiLotteryPayload = {
        issueList: [],
        name: provinceCode, // Use input provinceCode as fallback
        code: provinceCode, // Use input provinceCode as fallback
      };
      // Return a full ApiLotteryResponse structure, putting synthesized payload into 't'
      return {
        success: responseBody.success, // Should be true
        code: responseBody.code,       // Should be 0
        msg: responseBody.msg,
        t: synthesizedPayload,
      };
    }

    // If responseBody.t exists, proceed with issueList checks on responseBody.t.issueList
    // The 't' object is present, now ensure 'issueList' within it is an array.
    if (responseBody.t.issueList === null || typeof responseBody.t.issueList === 'undefined') {
      console.warn(
        `API success (success:true, code:0) for ${provinceCode}, 't' object is present, but 't.issueList' is null/undefined. Normalizing to []. Original data:`, 
        responseBody, 
        "URL:", url
      );
      responseBody.t.issueList = []; // Normalize to an empty array
    } 
    else if (!Array.isArray(responseBody.t.issueList)) {
      console.error("API success (success:true, code:0) but 't.issueList' is not an array:", responseBody, "URL:", url);
      throw new Error("Dữ liệu trả về từ API có định dạng không đúng ('t.issueList' phải là một mảng).");
    }

    // Now, responseBody.t.issueList is guaranteed to be an array (possibly empty).
    return responseBody;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error in fetchLotteryResults for ${provinceCode} (URL: ${url}):`, errorMessage, error);

    // Preserve specific error messages thrown from within the try block
    if (error instanceof Error && (
        error.message.startsWith("Lỗi API:") || 
        error.message.startsWith("Lỗi từ API (success:") || // Updated prefix
        error.message.startsWith("Dữ liệu trả về từ API không đầy đủ") || // This specific one might be less likely now due to synthesis
        error.message.startsWith("Dữ liệu trả về từ API có định dạng không đúng")
    )) {
        throw error; 
    }
    
    // Generic fallback error message
    throw new Error(`Không thể tải dữ liệu cho ${provinceCode}: ${errorMessage}`);
  }
};