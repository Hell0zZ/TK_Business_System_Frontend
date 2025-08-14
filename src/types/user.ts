// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',
  LEADER = 'leader', 
  MEMBER = 'member'
}

// 角色接口
export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  level: number;
  is_active: boolean;
}

// 用户接口
export interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  role_id: number;
  role: Role;
  parent_id?: number;
  parent?: User;
  group_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 登录请求接口
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应接口
export interface LoginResponse {
  token: string;
  user: User;
}

// 创建用户请求接口
export interface CreateUserRequest {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  role_id: number;
  parent_id?: number;
  group_name?: string;
}

// 更新用户请求接口
export interface UpdateUserRequest {
  username?: string;
  password?: string;
  email?: string;
  phone?: string;
  role_id?: number;
  parent_id?: number;
  group_name?: string;
  is_active?: boolean;
}

// 修改密码请求接口
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
} 