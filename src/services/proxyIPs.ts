import request from '../utils/request';
import { ApiResponse } from '../types/api';
import { 
  ProxyIP, 
  CreateProxyIPRequest, 
  UpdateProxyIPRequest, 
  ProxyIPListParams, 
  ProxyIPListResponse 
} from '../types/proxyIP';

// 获取代理IP列表
export const getProxyIPs = async (params: ProxyIPListParams = {}): Promise<ProxyIPListResponse> => {
  const response = await request.get<ApiResponse<ProxyIPListResponse>>('/proxy-ips', { params });
  return response.data.data;
};

// 获取可用代理IP列表
export const getAvailableProxyIPs = async (): Promise<ProxyIP[]> => {
  const response = await request.get<ApiResponse<ProxyIP[]>>('/proxy-ips/available');
  return response.data.data;
};

// 获取单个代理IP
export const getProxyIP = async (id: number): Promise<ProxyIP> => {
  const response = await request.get<ApiResponse<ProxyIP>>(`/proxy-ips/${id}`);
  return response.data.data;
};

// 创建代理IP
export const createProxyIP = async (data: CreateProxyIPRequest): Promise<ProxyIP> => {
  const response = await request.post<ApiResponse<ProxyIP>>('/proxy-ips', data);
  return response.data.data;
};

// 更新代理IP
export const updateProxyIP = async (id: number, data: UpdateProxyIPRequest): Promise<ProxyIP> => {
  const response = await request.put<ApiResponse<ProxyIP>>(`/proxy-ips/${id}`, data);
  return response.data.data;
};

// 删除代理IP
export const deleteProxyIP = async (id: number): Promise<void> => {
  await request.delete(`/proxy-ips/${id}`);
};

// 测试代理IP连通性
export const testProxyIP = async (id: number): Promise<any> => {
  const response = await request.post<ApiResponse<any>>(`/proxy-ips/${id}/test`);
  return response.data.data;
}; 