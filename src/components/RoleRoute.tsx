import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../types/user';
import { Result } from 'antd';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  // 直接从localStorage获取角色信息，更可靠
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(userRole as UserRole)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问此页面。"
      />
    );
  }
  
  return <>{children}</>;
};

export default RoleRoute; 