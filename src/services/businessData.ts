import request from '../utils/request';
import { ApiResponse } from '../types/api';
import { 
  BusinessData, 
  MonthlyHistory, 
  BusinessDataStats,
  MonthlyStats,
  MonthlyHistoryStats,
  MonthPeriodInfo,
  BusinessDataListParams,
  MonthlyHistoryListParams,
  MonthlyHistoryStatsParams,
  DailyHistory,
  DayPeriodInfo,
  DailyHistoryListParams,
  MonthPeriod
} from '../types/businessData';

// 获取商业数据列表
export const getBusinessData = async (params: BusinessDataListParams = {}): Promise<BusinessData[]> => {
  const response = await request.get<ApiResponse<BusinessData[]>>('/business-data', { params });
  return response.data.data;
};

// 获取商业数据统计信息
export const getBusinessDataStats = async (): Promise<BusinessDataStats> => {
  const response = await request.get<ApiResponse<BusinessDataStats>>('/business-data/stats');
  return response.data.data;
};

// 删除商业数据
export const deleteBusinessData = async (id: number): Promise<void> => {
  await request.delete(`/business-data/${id}`);
};

// 获取月度历史数据列表
export const getMonthlyHistory = async (params: MonthlyHistoryListParams = {}): Promise<MonthlyHistory[]> => {
  const response = await request.get<ApiResponse<MonthlyHistory[]>>('/monthly-history', { params });
  return response.data.data;
};

// 获取月度历史数据统计信息
export const getMonthlyHistoryStats = async (monthPeriods: number[]): Promise<MonthlyHistoryStats[]> => {
  const params = monthPeriods.map(period => `month_periods=${period}`).join('&');
  const url = `/monthly-history/stats?${params}`;
  const response = await request.get<ApiResponse<MonthlyHistoryStats[]>>(url);
  return response.data.data;
};

// 获取可用的月份列表
export const getAvailableMonthPeriods = async (): Promise<MonthPeriod[]> => {
  const response = await request.get<ApiResponse<MonthPeriodInfo[]>>('/monthly-history/periods');
  // 转换后端返回的格式为前端期望的格式
  return response.data.data.map(item => ({
    monthPeriod: item.month_period,
    accountCount: item.account_count
  }));
};

// 新增：获取每日历史数据列表
export const getDailyHistory = async (params: DailyHistoryListParams = {}): Promise<DailyHistory[]> => {
  const response = await request.get<ApiResponse<DailyHistory[]>>('/daily-history', { params });
  return response.data.data;
};

// 新增：获取每日历史数据统计信息（支持 account/member/group 聚合）
export const getDailyHistoryStats = async (dayPeriods: number[] = [], detailLevel: 'account' | 'member' | 'group' = 'account', countryId?: number) => {
  const searchParams = new URLSearchParams();
  dayPeriods.forEach(dp => searchParams.append('day_periods', String(dp)));
  if (detailLevel) searchParams.set('detail_level', detailLevel);
  if (countryId) searchParams.set('country_id', String(countryId));
  const url = `/daily-history/stats?${searchParams.toString()}`;
  const response = await request.get<ApiResponse<any>>(url);
  return response.data.data;
};

// 新增：获取可用的日期列表
export const getAvailableDayPeriods = async (): Promise<DayPeriodInfo[]> => {
  const response = await request.get<ApiResponse<DayPeriodInfo[]>>('/daily-history/periods');
  return response.data.data;
};