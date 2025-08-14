import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { UserOutlined, TeamOutlined, GlobalOutlined, DashboardOutlined } from '@ant-design/icons';
import { getCurrentUser } from '../utils/auth';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const user = getCurrentUser();

  return (
    <div>
      <Title level={2}>仪表盘</Title>
      <p>欢迎回来，{user?.username}！</p>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="我的账号"
              value={0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总账号数"
              value={0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="代理IP数量"
              value={0}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃账号"
              value={0}
              prefix={<DashboardOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="最近活动" size="small">
            <p>暂无数据</p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="系统通知" size="small">
            <p>暂无通知</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 