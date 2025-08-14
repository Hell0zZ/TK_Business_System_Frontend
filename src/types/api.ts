// API响应的通用接口
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页响应接口
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 请求参数接口
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
} 