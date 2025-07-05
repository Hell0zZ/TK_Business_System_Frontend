import request from '../utils/request';
import { ApiResponse } from '../types/api';

// 通用选项接口
export interface Option {
  id: number;
  name: string;
}

// 获取分类列表
export const getCategories = async (): Promise<Option[]> => {
  const response = await request.get<ApiResponse<Option[]>>('/categories');
  return response.data.data;
};

// 获取手机型号列表
export const getPhoneModels = async (): Promise<Option[]> => {
  const response = await request.get<ApiResponse<Option[]>>('/phone-models');
  return response.data.data;
};

// 获取银行卡列表
export const getBankCards = async (): Promise<Option[]> => {
  const response = await request.get<ApiResponse<Option[]>>('/bank-cards');
  return response.data.data;
};

// 获取角色列表
export const getRoles = async (): Promise<Option[]> => {
  const response = await request.get<ApiResponse<Option[]>>('/roles');
  return response.data.data;
}; 