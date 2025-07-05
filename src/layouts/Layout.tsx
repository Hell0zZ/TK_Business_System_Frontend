import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout as AntLayout,
  Menu
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  GlobalOutlined,
  BankOutlined,
  MobileOutlined,
  TagsOutlined,
  AuditOutlined,
  BarChartOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { getCurrentUser, logout, isAdmin, canAccessAdmin, canAccessLeader } from '../utils/auth';
import { UserRole } from '../types/user';

const { Header, Sider, Content } = AntLayout;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string>('admin');
  const [userInfo, setUserInfo] = useState<{
    role: string;
    username?: string;
    groupName?: string;
  }>({ role: 'admin' });

  useEffect(() => {
    // 从localStorage获取用户信息
    const storedRole = localStorage.getItem('userRole') || 'admin';
    const storedUsername = localStorage.getItem('username') || undefined;
    const storedGroupName = localStorage.getItem('groupName') || undefined;

    setUserRole(storedRole);
    setUserInfo({
      role: storedRole,
      username: storedUsername,
      groupName: storedGroupName
    });
  }, []);

  const getMenuItems = () => {
    if (userRole === UserRole.MEMBER) {
      return [
        {
          key: 'member/accounts',
          icon: <UserOutlined />,
          label: 'TikTok账号管理',
        },
        {
          key: 'member/business-data',
          icon: <BarChartOutlined />,
          label: 'TikTok运营数据',
        },
        {
          key: 'member/operation-stats',
          icon: <PieChartOutlined />,
          label: '运营统计分析',
        },
      ];
    } else if (userRole === UserRole.LEADER) {
      return [
        {
          key: 'leader/members',
          icon: <TeamOutlined />,
          label: '组员管理',
        },
        {
          key: 'admin/proxy-ips',
          icon: <GlobalOutlined />,
          label: '代理IP管理',
        },
        {
          key: 'admin/categories',
          icon: <TagsOutlined />,
          label: '分类管理',
        },
        {
          key: 'admin/phone-models',
          icon: <MobileOutlined />,
          label: '手机型号管理',
        },
        {
          key: 'admin/bank-cards',
          icon: <BankOutlined />,
          label: '银行卡管理',
        },
        {
          key: 'leader/accounts',
          icon: <UserOutlined />,
          label: '组内TikTok账号管理',
        },
        {
          key: 'leader/business-data',
          icon: <BarChartOutlined />,
          label: 'TikTok运营数据',
        },
        {
          key: 'leader/operation-stats',
          icon: <PieChartOutlined />,
          label: '运营统计分析',
        },
      ];
    } else {
      // admin 角色
      return [
        {
          key: 'admin/users',
          icon: <TeamOutlined />,
          label: '用户管理',
        },
        {
          key: 'admin/proxy-ips',
          icon: <GlobalOutlined />,
          label: '代理IP管理',
        },
        {
          key: 'admin/categories',
          icon: <TagsOutlined />,
          label: '分类管理',
        },
        {
          key: 'admin/phone-models',
          icon: <MobileOutlined />,
          label: '手机型号管理',
        },
        {
          key: 'admin/bank-cards',
          icon: <BankOutlined />,
          label: '银行卡管理',
        },
        {
          key: 'admin/tiktok-accounts',
          icon: <UserOutlined />,
          label: 'TikTok账号管理',
        },
        {
          key: 'admin/business-data',
          icon: <BarChartOutlined />,
          label: 'TikTok运营数据',
        },
        {
          key: 'admin/operation-stats',
          icon: <PieChartOutlined />,
          label: '运营统计分析',
        },
      ];
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('groupName');
    navigate('/login');
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(`/${key}`);
  };

  const getSystemTitle = () => {
    if (userRole === UserRole.MEMBER) {
      return 'TK Business 用户系统';
    } else if (userRole === UserRole.LEADER) {
      return 'TK Business 组长系统';
    } else {
      return 'TK Business 管理系统';
    }
  };

  const getRoleDisplayName = () => {
    if (userRole === UserRole.MEMBER) {
      return '组员';
    } else if (userRole === UserRole.LEADER) {
      return '组长';
    } else {
      return '管理员';
    }
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{
        background: '#001529',
        color: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: 20, fontWeight: 'bold' }}>
          {getSystemTitle()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 14, color: '#fff' }}>
            {getRoleDisplayName()} {userInfo.username || '未知用户'}
          </div>
          <LogoutOutlined
            style={{ fontSize: 18, cursor: 'pointer' }}
            onClick={handleLogout}
            title="退出登录"
          />
        </div>
      </Header>
      <AntLayout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname.substring(1)]}
            items={getMenuItems()}
            onClick={handleMenuClick}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Content style={{ padding: 24, minHeight: 280, background: '#fff' }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout; 