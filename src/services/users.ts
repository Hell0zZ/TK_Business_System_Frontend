import request from '../utils/request';
import { ApiResponse } from '../types/api';
import { User, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest } from '../types/user';

// 获取用户列表
export const getUsers = async (params?: any): Promise<User[]> => {
  const response = await request.get<ApiResponse<User[]>>('/users', { params });
  return response.data.data;
};

// 获取单个用户
export const getUser = async (id: number): Promise<User> => {
  const response = await request.get<ApiResponse<User>>(`/users/${id}`);
  return response.data.data;
};

// 创建用户
export const createUser = async (data: CreateUserRequest): Promise<User> => {
  const response = await request.post<ApiResponse<User>>('/users', data);
  return response.data.data;
};

// 更新用户
export const updateUser = async (id: number, data: UpdateUserRequest): Promise<User> => {
  const response = await request.put<ApiResponse<User>>(`/users/${id}`, data);
  return response.data.data;
};

// 删除用户
export const deleteUser = async (id: number): Promise<void> => {
  await request.delete(`/users/${id}`);
};

// 修改密码
export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  await request.post('/user/change-password', data);
}; 