// 商业数据类型定义
export interface BusinessData {
  id: number;
  tiktok_account_id: number;
  today_revenue?: number;
  today_orders?: number;
  today_views?: number;
  today_clicks?: number;
  month_revenue?: number;
  month_orders?: number;
  month_views?: number;
  month_clicks?: number;
  last_violation_time?: string;
  last_violation_reason?: string;
  last_violation_result?: string;
  appeal_status?: string;
  account_deleted_at?: string;
  audit_status: string;
  tiktok_name: string;
  tiktok_cookie: string;
  country: string;
  account_status: string;
  proxy_ip_id?: number;
  proxy_ip?: ProxyIP;
  crawler_status?: string;
  crawler_updated_at?: string;
  created_at: string;
  updated_at: string;
  tiktok_account: TikTokAccount;
}

// 月度历史数据类型定义
export interface MonthlyHistory {
  id: number;
  tiktok_account_id: number;
  month_period: number;
  month_revenue?: number;
  month_orders?: number;
  month_views?: number;
  month_clicks?: number;
  tiktok_name: string;
  country: string;
  crawler_status?: string;
  crawler_updated_at?: string;
  created_at: string;
  updated_at: string;
  tiktok_account?: TikTokAccount;
}

// 统计数据类型定义
export interface BusinessDataStats {
  total_accounts: number;
  today_revenue: number;
  month_revenue: number;
  today_orders: number;
  month_orders: number;
  violation_accounts: number;
}

// 月度统计数据类型定义
export interface MonthlyStats {
  month_period: number;
  total_revenue: number;
  total_orders: number;
  account_count: number;
}

// 月度历史统计数据类型定义（用于表格显示）
export interface MonthlyHistoryStats {
  id: number;
  tiktok_account_id: number;
  month_period: number;
  month_revenue?: number;
  month_orders?: number;
  month_views?: number;
  month_clicks?: number;
  tiktok_name: string;
  country: string;
  crawler_status?: string;
  crawler_updated_at?: string;
  created_at: string;
  updated_at: string;
}

// 月份信息类型定义
export interface MonthPeriod {
  monthPeriod: number;
  accountCount: number;
}

// 兼容性别名
export interface MonthPeriodInfo {
  month_period: number;
  account_count: number;
}

// 导入其他需要的类型
import { ProxyIP } from './proxyIP';

// 前向声明，避免循环依赖
export interface TikTokAccount {
  id: number;
  tiktok_name?: string;
  // 其他字段根据需要添加
}

// 查询参数类型定义
export interface BusinessDataListParams {
  tiktok_account_id?: number;
  violation_reason_category?: string;
  page?: number;
  page_size?: number;
}

export interface MonthlyHistoryListParams {
  tiktok_account_id?: number;
  month_period?: string;
  page?: number;
  page_size?: number;
}

export interface MonthlyHistoryStatsParams {
  month_periods?: number[];
} 