import request from '../utils/request';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../types/api';
import { TikTokAccount, CreateTikTokAccountRequest, UpdateTikTokAccountRequest } from '../types/tiktokAccount';

// 获取TikTok账号列表
export const getTikTokAccounts = async (params: PaginationParams = {}): Promise<PaginatedResponse<TikTokAccount>> => {
  const response = await request.get<ApiResponse<PaginatedResponse<TikTokAccount>>>('/tiktok-accounts', { params });
  return response.data.data;
};

// 获取单个TikTok账号
export const getTikTokAccount = async (id: number): Promise<TikTokAccount> => {
  const response = await request.get<ApiResponse<TikTokAccount>>(`/tiktok-accounts/${id}`);
  return response.data.data;
};

// 创建TikTok账号
export const createTikTokAccount = async (data: CreateTikTokAccountRequest): Promise<TikTokAccount> => {
  const response = await request.post<ApiResponse<TikTokAccount>>('/tiktok-accounts', data);
  return response.data.data;
};

// 更新TikTok账号
export const updateTikTokAccount = async (id: number, data: UpdateTikTokAccountRequest): Promise<TikTokAccount> => {
  const response = await request.put<ApiResponse<TikTokAccount>>(`/tiktok-accounts/${id}`, data);
  return response.data.data;
};

// 管理员编辑TikTok账号
export const adminEditTikTokAccount = async (id: number, data: UpdateTikTokAccountRequest): Promise<TikTokAccount> => {
  const response = await request.put<ApiResponse<TikTokAccount>>(`/admin/tiktok-accounts/${id}/edit`, data);
  return response.data.data;
};

// 删除TikTok账号
export const deleteTikTokAccount = async (id: number): Promise<void> => {
  await request.delete(`/tiktok-accounts/${id}`);
};

// 组长获取组内账号（按成员分组）
export const getGroupAccounts = async (): Promise<any> => {
  const response = await request.get<ApiResponse<any>>('/leader/group-accounts');
  const data = response.data.data;
  
  // 转换后端数据结构为前端期望的格式
  if (data && data.members_data) {
    return data.members_data.map((member: any) => ({
      id: member.user.id,
      username: member.user.username,
      phone: member.user.phone,
      group_name: member.user.group_name,
      account_count: member.account_count,
      accounts: member.accounts || []
    }));
  }
  
  return [];
};

// 组长获取指定组员的账号
export const getMemberAccounts = async (memberId: number): Promise<TikTokAccount[]> => {
  const response = await request.get<ApiResponse<any>>(`/leader/member/${memberId}/accounts`);
  const data = response.data.data;
  
  // 后端返回的是 { member, accounts, account_count }，我们只需要 accounts
  return data.accounts || [];
};

// 组长批量更新账号
export const batchUpdateAccounts = async (data: { account_ids: number[]; updates: UpdateTikTokAccountRequest }): Promise<void> => {
  await request.post('/leader/batch-update-accounts', data);
}; 