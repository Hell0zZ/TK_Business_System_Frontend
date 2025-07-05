import { BusinessData } from './businessData';
import { ProxyIP } from './proxyIP';

// TikTok账号状态枚举
export enum AccountStatus {
  PENDING = '待检测',
  NORMAL = '正常',
  ABNORMAL = '异常',
  BANNED = '封禁',
  LIMITED = '限流'
}

// 审核状态枚举
export enum AuditStatus {
  PENDING = '待审核',
  APPROVED = '审核通过',
  REJECTED = '审核拒绝'
}

// TikTok账号接口
export interface TikTokAccount {
  id: number;
  user_id: number;
  user?: {
    id: number;
    username: string;
  };
  group_name?: string;
  username: string;
  phone_model_id?: number;
  phone_model?: {
    id: number;
    name: string;
  };
  phone_model_name?: string;
  node?: string;
  account_status: AccountStatus;
  category_id?: number;
  category?: {
    id: number;
    name: string;
  };
  category_name?: string;
  bank_card_id?: number;
  bank_card?: {
    id: number;
    bank_name: string;
    card_holder: string;
    card_number: string;
  };
  bank_card_number?: string;
  country?: string;
  device_number?: string;
  remarks?: string;
  audit_status: AuditStatus;
  audit_comment?: string;
  audit_user_id?: number;
  audit_time?: string;
  phone_review?: string;
  tiktok_name?: string;
  proxy_ip_id?: number;
  proxy_ip?: ProxyIP;
  tiktok_cookie?: string;
  business_data?: BusinessData;
  created_at: string;
  updated_at: string;
}



// 创建TikTok账号请求接口
export interface CreateTikTokAccountRequest {
  phone_model_id?: number;
  node?: string;
  account_status: AccountStatus;
  category_id?: number;
  bank_card_id?: number;
  country?: string;
  device_number?: string;
  remarks?: string;
  tiktok_cookie?: string;
  phone_review?: string;
  tiktok_name?: string;
  proxy_ip_id?: number | null;
}

// 更新TikTok账号请求接口
export interface UpdateTikTokAccountRequest {
  phone_model_id?: number;
  node?: string;
  account_status?: AccountStatus;
  category_id?: number;
  bank_card_id?: number;
  country?: string;
  device_number?: string;
  remarks?: string;
  audit_status?: AuditStatus;
  audit_comment?: string;
  tiktok_cookie?: string;
  phone_review?: string;
  tiktok_name?: string;
  proxy_ip_id?: number | null;
} 