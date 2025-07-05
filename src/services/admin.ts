import request from '../utils/request';
import { ApiResponse } from '../types/api';

export interface OperationStatsParams {
  time_type: 'month' | 'day' | 'range';
  date?: string;
  start_date?: string;
  end_date?: string;
  group_id?: number;
  country_id?: number;
  detail_level?: 'group' | 'member';
}

export interface ViolationCount {
  count: number;
  percentage: number;
  name: string;
}

export interface OperationSummary {
  total_accounts: number;
  total_revenue: number;
  total_orders: number;
  violation_accounts: number;
  shop_expired_accounts: number;
  login_expired_accounts: number;
  normal_rate: number;
  violation_reasons: Record<string, ViolationCount>;
}

export interface MemberStats {
  user_id: number;
  username: string;
  accounts: number;
  revenue: number;
  orders: number;
  violations: number;
  normal_rate: number;
}

export interface GroupStats {
  group_id?: number;
  group_name?: string;
  leader_name?: string;
  leader_id?: number;
  country_code?: string;
  country_name?: string;
  accounts: number;
  revenue: number;
  orders: number;
  violations: number;
  shop_expired: number;
  login_expired: number;
  normal_rate: number;
  members?: MemberStats[];
}

export interface OperationStatsData {
  summary: OperationSummary;
  groups: GroupStats[];
}

// 获取运营统计数据
export const getOperationStats = (params: OperationStatsParams): Promise<ApiResponse<OperationStatsData>> => {
  return request.get('/admin/operation-stats', { params });
};

// 获取组长运营统计数据（简化版本）
export const getLeaderOperationStats = (params: OperationStatsParams): Promise<ApiResponse<OperationStatsData>> => {
  return request.get('/leader/operation-stats', { params });
};

// 违规统计相关类型
export interface ViolationStatsParams {
  time_type: 'month' | 'day' | 'range';
  date?: string;
  start_date?: string;
  end_date?: string;
  country_id?: number;
  group_name?: string;
  detail_level?: 'category' | 'account';
  page?: number;
  page_size?: number;
}

export interface ViolationSummary {
  total_accounts: number;
  violated_accounts: number;
  normal_accounts: number;
  violation_rate: number;
  updated_at: string;
}

export interface ViolationCategory {
  category_name: string;
  category_key: string;
  count: number;
  percentage: number;
  accounts?: ViolationAccount[];
}

export interface ViolationAccount {
  account_id: number;
  tiktok_name: string;
  violation_reason: string;
}

export interface ViolationTrend {
  date: string;
  total_count: number;
  categories: Record<string, number>;
}

export interface ViolationDetail {
  account_id: number;
  tiktok_name: string;
  country: string;
  group_name: string;
  username: string;
  violation_reason: string;
  category_name: string;
  violated_at: string;
  account_status: string;
}

export interface PaginationInfo {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface ViolationStatsData {
  summary: ViolationSummary;
  categories: ViolationCategory[];
  trends?: ViolationTrend[];
  details?: ViolationDetail[];
  pagination?: PaginationInfo;
  permission_scope: string;
}

// 获取违规统计数据
export const getViolationStats = (params: ViolationStatsParams): Promise<ApiResponse<ViolationStatsData>> => {
  return request.get('/admin/violation-stats', { params });
};

// 获取组员运营统计数据
export const getMemberOperationStats = (params: OperationStatsParams): Promise<ApiResponse<OperationStatsData>> => {
  return request.get('/member/operation-stats', { params });
}; 