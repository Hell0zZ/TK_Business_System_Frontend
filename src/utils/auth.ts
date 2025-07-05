import { User, UserRole } from '../types/user';

// 获取存储的token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// 设置token
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// 移除token
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// 获取当前用户信息
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('解析用户信息失败:', error);
      return null;
    }
  }
  return null;
};

// 设置当前用户信息
export const setCurrentUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

// 移除当前用户信息
export const removeCurrentUser = (): void => {
  localStorage.removeItem('user');
};

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// 检查用户角色
export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user?.role?.name === role;
};

// 检查是否为管理员
export const isAdmin = (): boolean => {
  return hasRole(UserRole.ADMIN);
};

// 检查是否为组长
export const isLeader = (): boolean => {
  return hasRole(UserRole.LEADER);
};

// 检查是否为组员
export const isMember = (): boolean => {
  return hasRole(UserRole.MEMBER);
};

// 检查是否有权限访问管理员功能
export const canAccessAdmin = (): boolean => {
  return isAdmin();
};

// 检查是否有权限访问组长功能
export const canAccessLeader = (): boolean => {
  return isAdmin() || isLeader();
};

// 登出
export const logout = (): void => {
  removeToken();
  removeCurrentUser();
  window.location.href = '/login';
}; 