import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import Login from '../pages/Login';
import AdminUsers from '../pages/admin/Users';
import AdminProxyIPs from '../pages/admin/ProxyIPs';
import AdminCategories from '../pages/admin/Categories';
import AdminPhoneModels from '../pages/admin/PhoneModels';
import AdminBankCards from '../pages/admin/BankCards';
import AdminTikTokAccounts from '../pages/admin/TikTokAccounts';
import AdminBusinessData from '../pages/admin/BusinessData';
import AdminOperationStats from '../pages/admin/OperationStats';
import LeaderMembers from '../pages/leader/Members';
import LeaderAccounts from '../pages/leader/Accounts';
import LeaderBusinessData from '../pages/leader/BusinessData';
import LeaderOperationStats from '../pages/leader/OperationStats';
import MemberAccounts from '../pages/member/Accounts';
import MemberBusinessData from '../pages/member/BusinessData';
import MemberOperationStats from '../pages/member/OperationStats';

// 权限检查组件
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const Router: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* 管理员页面 */}
      <Route path="/admin" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route path="users" element={<AdminUsers />} />
        <Route path="proxy-ips" element={<AdminProxyIPs />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="phone-models" element={<AdminPhoneModels />} />
        <Route path="bank-cards" element={<AdminBankCards />} />
        <Route path="tiktok-accounts" element={<AdminTikTokAccounts />} />
        <Route path="business-data" element={<AdminBusinessData />} />
        <Route path="operation-stats" element={<AdminOperationStats />} />
      </Route>

      {/* 组长页面 */}
      <Route path="/leader" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route path="members" element={<LeaderMembers />} />
        <Route path="accounts" element={<LeaderAccounts />} />
        <Route path="proxy-ips" element={<AdminProxyIPs />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="phone-models" element={<AdminPhoneModels />} />
        <Route path="bank-cards" element={<AdminBankCards />} />
        <Route path="business-data" element={<LeaderBusinessData />} />
        <Route path="operation-stats" element={<LeaderOperationStats />} />
      </Route>

      {/* 组员页面 */}
      <Route path="/member" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route path="accounts" element={<MemberAccounts />} />
        <Route path="business-data" element={<MemberBusinessData />} />
        <Route path="operation-stats" element={<MemberOperationStats />} />
      </Route>

      {/* 默认重定向 */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default Router; 