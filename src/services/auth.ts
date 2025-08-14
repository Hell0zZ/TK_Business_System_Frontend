import request from '../utils/request';
import { ApiResponse } from '../types/api';
import { LoginRequest, LoginResponse, User } from '../types/user';

// 登录
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await request.post<ApiResponse<LoginResponse>>('/auth/login', data);
  return response.data.data;
};

// 获取当前用户信息
export const getCurrentUserInfo = async (): Promise<User> => {
  const response = await request.get<ApiResponse<User>>('/auth/me');
  return response.data.data;
};

// 登出
export const logout = async (): Promise<void> => {
  await request.post('/auth/logout');
}; 