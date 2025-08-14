// 代理类型枚举
export enum ProxyType {
  HTTP = 'http',
  HTTPS = 'https',
  SOCKS5 = 'socks5'
}

// 代理状态枚举
export enum ProxyStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  ERROR = 'error'
}

// 代理IP接口
export interface ProxyIP {
  id: number;
  name: string;
  country: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  proxy_type: string;
  status: string;
  description: string;
  last_test_at?: string;
  test_result: string;
  response_time?: number;
  created_at: string;
  updated_at: string;
}

// 创建代理IP请求接口
export interface CreateProxyIPRequest {
  name: string;
  country: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  proxy_type: string;
  status: string;
  description?: string;
}

// 更新代理IP请求接口
export interface UpdateProxyIPRequest {
  name?: string;
  country?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  proxy_type?: string;
  status?: string;
  description?: string;
}

// 代理IP列表查询参数
export interface ProxyIPListParams {
  country?: string;
  status?: string;
  proxy_type?: string;
  page?: number;
  page_size?: number;
}

// 代理IP列表响应
export interface ProxyIPListResponse {
  list: ProxyIP[];
  total: number;
  page: number;
  page_size: number;
}

// 代理IP状态枚举
export enum ProxyIPStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  ERROR = 'error'
}

// 代理IP类型枚举
export enum ProxyIPType {
  HTTP = 'http',
  HTTPS = 'https',
  SOCKS5 = 'socks5'
}

// 测试结果枚举
export enum TestResult {
  SUCCESS = 'success',
  FAILED = 'failed',
  TIMEOUT = 'timeout'
}

// 代理IP测试结果接口
export interface ProxyTestResult {
  success: boolean;
  response_time?: number;
  error_message?: string;
} 