import axios, { AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';
import { ApiResponse } from '../types/api';

// 创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('发送请求:', config.url, '使用token:', token.substring(0, 20) + '...');
    } else {
      console.log('发送请求:', config.url, '无token');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    console.log('收到响应:', response.config.url, '状态码:', data.code);
    
    // 检查业务状态码
    if (data.code === 200) {
      return response;
    } else if (data.code === 401) {
      // 未授权，清除token并跳转到登录页
      console.error('401错误 - 清除token并跳转登录页:', response.config.url);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      window.location.href = '/login';
      message.error('登录已过期，请重新登录');
      return Promise.reject(new Error('Unauthorized'));
    } else {
      // 其他业务错误
      console.error('业务错误:', data.code, data.message);
      // 不在这里显示message，让组件自己处理错误显示
      return Promise.reject(new Error(data.message || '请求失败'));
    }
  },
  (error: AxiosError) => {
    // 网络错误或其他错误
    console.error('请求错误:', error.config?.url, '状态码:', error.response?.status);
    console.error('错误响应数据:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.error('HTTP 401错误 - 清除token并跳转登录页');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      window.location.href = '/login';
      message.error('登录已过期，请重新登录');
      return Promise.reject(error);
    } else if (error.response?.status === 403) {
      message.error('权限不足');
      return Promise.reject(error);
    } else if (error.response?.status === 400) {
      // 400错误，尝试从响应数据中获取具体错误信息
      const responseData = error.response.data as any;
      const errorMessage = responseData?.message || '请求参数错误';
      console.error('400错误详情:', errorMessage);
      return Promise.reject(new Error(errorMessage));
    } else if (error.response?.status === 404) {
      message.error('请求的资源不存在');
      return Promise.reject(error);
    } else if (error.response?.status === 500) {
      message.error('服务器内部错误');
      return Promise.reject(error);
    } else if (error.code === 'ECONNABORTED') {
      message.error('请求超时');
      return Promise.reject(error);
    } else {
      message.error(error.message || '网络错误');
      return Promise.reject(error);
    }
  }
);

export default request; 