import request from '../utils/request';
import { ApiResponse } from '../types/api';
import { Role } from '../types/user';

// 获取角色列表
export const getRoles = async (): Promise<Role[]> => {
  const response = await request.get<ApiResponse<Role[]>>('/roles');
  return response.data.data;
};

// 获取单个角色
export const getRole = async (id: number): Promise<Role> => {
  const response = await request.get<ApiResponse<Role>>(`/roles/${id}`);
  return response.data.data;
}; 