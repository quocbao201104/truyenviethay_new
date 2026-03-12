/**
 * Chuẩn hóa HTTP status cho API (Phase 6)
 * 400: Bad Request - dữ liệu không hợp lệ
 * 403: Forbidden - không có quyền
 * 404: Not Found - tài nguyên không tồn tại
 * 429: Too Many Requests - rate limit (trả từ rate-limit middleware)
 */
module.exports = {
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
};
