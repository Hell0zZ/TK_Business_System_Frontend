import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '../services/auth';
import { setToken, setCurrentUser } from '../utils/auth';
import { LoginRequest, UserRole } from '../types/user';
import './Login.less';

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      console.log('发送登录请求:', values);
      const response = await login(values);
      console.log('登录响应:', response);
      
      setToken(response.token);
      setCurrentUser(response.user);
      
      // 存储角色信息
      localStorage.setItem('userRole', response.user.role.name);
      localStorage.setItem('username', response.user.username);
      
      message.success('登录成功！');
      
      // 根据角色跳转到不同页面
      if (response.user.role.name === UserRole.ADMIN) {
        navigate('/admin/users');
      } else if (response.user.role.name === UserRole.LEADER) {
        navigate('/leader/members');
      } else {
        navigate('/member/accounts');
      }
    } catch (error: any) {
      console.error('登录错误详情:', error);
      if (error.response) {
        console.error('响应数据:', error.response.data);
        console.error('响应状态:', error.response.status);
        message.error(error.response.data?.message || '登录失败');
      } else if (error.request) {
        console.error('请求错误:', error.request);
        message.error('网络请求失败，请检查网络连接');
      } else {
        console.error('其他错误:', error.message);
        message.error(error.message || '登录失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <Title level={2}>TK Business System</Title>
          <Typography.Text type="secondary">
            欢迎回来，请登录您的账户
          </Typography.Text>
        </div>
        
        <Card bordered={false} className="login-card">
          <Form
            form={form}
            onFinish={onFinish}
            size="large"
            className="login-form"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="请输入用户名"
                allowClear
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="请输入密码"
                allowClear
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-button"
                loading={loading}
                block
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
        
        <div className="login-footer">
          <Typography.Text type="secondary">
            © 2025 TK Business System. All Rights Reserved.<br />
            Version 1.0.0
          </Typography.Text>
        </div>
      </div>
    </div>
  );
};

export default Login; 