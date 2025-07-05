import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Table,
  Tag,
  Select,
  DatePicker,
  Button,
  Tabs,
  Space,
  Alert
} from 'antd';
import {
  DashboardOutlined,
  GlobalOutlined,
  DollarOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  ReloadOutlined,
  CalendarOutlined,
  TrendingUpOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const TestCEOSimple: React.FC = () => {
  // 时间选择状态
  const [timeType, setTimeType] = useState<'today' | 'yesterday' | 'month' | 'custom'>('today');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  
  // 显示模式
  const [viewMode, setViewMode] = useState<'country' | 'group'>('country');
  const [activeCountry, setActiveCountry] = useState('US');

  // 模拟业务数据 - 按时间和国家组织
  const businessData = {
    // 今日数据
    today: {
      date: '2025-01-19',
      countries: [
        {
          name: '美国',
          code: 'US',
          flag: '🇺🇸',
          currency: 'USD',
          totalRevenue: 45600,
          totalAccounts: 35,
          totalOrders: 126,
          groups: [
            { name: '销售08组', leader: 'zz08', revenue: 18500, accounts: 15, orders: 52 },
            { name: '销售12组', leader: 'leader12', revenue: 15200, accounts: 12, orders: 38 },
            { name: '销售03组', leader: 'leader03', revenue: 11900, accounts: 8, orders: 36 }
          ]
        },
        {
          name: '英国',
          code: 'UK',
          flag: '🇬🇧',
          currency: 'GBP',
          totalRevenue: 12800,
          totalAccounts: 20,
          totalOrders: 64,
          groups: [
            { name: '销售08组', leader: 'zz08', revenue: 7200, accounts: 12, orders: 38 },
            { name: '销售12组', leader: 'leader12', revenue: 5600, accounts: 8, orders: 26 }
          ]
        },
        {
          name: '加拿大', 
          code: 'CA',
          flag: '🇨🇦',
          currency: 'CAD',
          totalRevenue: 8900,
          totalAccounts: 15,
          totalOrders: 42,
          groups: [
            { name: '销售08组', leader: 'zz08', revenue: 5200, accounts: 9, orders: 25 },
            { name: '销售03组', leader: 'leader03', revenue: 3700, accounts: 6, orders: 17 }
          ]
        }
      ]
    },
    // 昨日数据
    yesterday: {
      date: '2025-01-18',
      countries: [
        {
          name: '美国',
          code: 'US',
          flag: '🇺🇸',
          currency: 'USD',
          totalRevenue: 42300,
          totalAccounts: 35,
          totalOrders: 118,
          groups: [
            { name: '销售08组', leader: 'zz08', revenue: 17100, accounts: 15, orders: 48 },
            { name: '销售12组', leader: 'leader12', revenue: 14200, accounts: 12, orders: 35 },
            { name: '销售03组', leader: 'leader03', revenue: 11000, accounts: 8, orders: 35 }
          ]
        },
        {
          name: '英国',
          code: 'UK',
          flag: '🇬🇧',
          currency: 'GBP',
          totalRevenue: 11600,
          totalAccounts: 20,
          totalOrders: 58,
          groups: [
            { name: '销售08组', leader: 'zz08', revenue: 6500, accounts: 12, orders: 34 },
            { name: '销售12组', leader: 'leader12', revenue: 5100, accounts: 8, orders: 24 }
          ]
        },
        {
          name: '加拿大',
          code: 'CA', 
          flag: '🇨🇦',
          currency: 'CAD',
          totalRevenue: 7800,
          totalAccounts: 15,
          totalOrders: 38,
          groups: [
            { name: '销售08组', leader: 'zz08', revenue: 4600, accounts: 9, orders: 22 },
            { name: '销售03组', leader: 'leader03', revenue: 3200, accounts: 6, orders: 16 }
          ]
        }
      ]
    },
    // 月度数据
    month: {
      period: '2025-01',
      countries: [
        {
          name: '美国',
          code: 'US',
          flag: '🇺🇸', 
          currency: 'USD',
          totalRevenue: 850000,
          totalAccounts: 35,
          totalOrders: 2100,
          groups: [
            { name: '销售08组', leader: 'zz08', revenue: 320000, accounts: 15, orders: 850 },
            { name: '销售12组', leader: 'leader12', revenue: 280000, accounts: 12, orders: 720 },
            { name: '销售03组', leader: 'leader03', revenue: 250000, accounts: 8, orders: 530 }
          ]
        },
        {
          name: '英国',
          code: 'UK',
          flag: '🇬🇧',
          currency: 'GBP',
          totalRevenue: 320000,
          totalAccounts: 20,
          totalOrders: 980,
          groups: [
            { name: '销售08组', leader: 'zz08', revenue: 180000, accounts: 12, orders: 580 },
            { name: '销售12组', leader: 'leader12', revenue: 140000, accounts: 8, orders: 400 }
          ]
        },
        {
          name: '加拿大',
          code: 'CA',
          flag: '🇨🇦',
          currency: 'CAD',
          totalRevenue: 210000,
          totalAccounts: 15,
          totalOrders: 850,
          groups: [
            { name: '销售08组', leader: 'zz08', revenue: 130000, accounts: 9, orders: 510 },
            { name: '销售03组', leader: 'leader03', revenue: 80000, accounts: 6, orders: 340 }
          ]
        }
      ]
    }
  };

  // 获取当前时间段的数据
  const getCurrentTimeData = () => {
    switch (timeType) {
      case 'today':
        return businessData.today;
      case 'yesterday':
        return businessData.yesterday;
      case 'month':
        return businessData.month;
      case 'custom':
        // 这里可以根据selectedDate获取自定义日期数据
        return businessData.today; // 暂时返回今日数据
      default:
        return businessData.today;
    }
  };

  // 获取时间标题
  const getTimeTitle = () => {
    switch (timeType) {
      case 'today':
        return `今日业绩 (${businessData.today.date})`;
      case 'yesterday':
        return `昨日业绩 (${businessData.yesterday.date})`;
      case 'month':
        return `月度业绩 (${businessData.month.period})`;
      case 'custom':
        return `自定义日期 (${selectedDate.format('YYYY-MM-DD')})`;
      default:
        return '业绩数据';
    }
  };

  // 计算环比增长
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100);
  };

  // 获取环比数据
  const getComparisonData = (countryCode: string) => {
    const currentData = getCurrentTimeData();
    let previousData;

    if (timeType === 'today') {
      previousData = businessData.yesterday;
    } else if (timeType === 'yesterday') {
      // 这里应该获取前天数据，暂时用今日数据
      previousData = businessData.today;
    } else {
      // 月度数据的话，应该对比上个月，暂时返回null
      return null;
    }

    const current = currentData.countries.find(c => c.code === countryCode);
    const previous = previousData.countries.find(c => c.code === countryCode);

    if (!current || !previous) return null;

    return {
      revenueGrowth: calculateGrowth(current.totalRevenue, previous.totalRevenue),
      ordersGrowth: calculateGrowth(current.totalOrders, previous.totalOrders)
    };
  };

  // 渲染总体概览卡片（非货币指标）
  const renderOverviewCards = () => {
    const currentData = getCurrentTimeData();
    const totalAccounts = currentData.countries.reduce((sum, country) => sum + country.totalAccounts, 0);
    const totalOrders = currentData.countries.reduce((sum, country) => sum + country.totalOrders, 0);
    const totalCountries = currentData.countries.length;
    
    // 计算总小组数
    const totalGroups = currentData.countries.reduce((sum, country) => sum + country.groups.length, 0);

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="运营国家"
              value={totalCountries}
              prefix={<GlobalOutlined />}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃账号"
              value={totalAccounts}
              prefix={<TeamOutlined />}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单总量"
              value={totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="运营小组"
              value={totalGroups}
              prefix={<BarChartOutlined />}
              suffix="个"
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // 渲染国家详情
  const renderCountryDetail = (country: any) => {
    const comparison = getComparisonData(country.code);
    
    return (
      <div key={country.code}>
        {/* 该国家核心指标 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title={`总收入 (${country.currency})`}
                value={country.totalRevenue}
                prefix={<DollarOutlined />}
                formatter={(value) => `${country.currency} ${value?.toLocaleString()}`}
                valueStyle={{ color: '#3f8600' }}
              />
              {comparison && (
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  <TrendingUpOutlined style={{ 
                    color: comparison.revenueGrowth >= 0 ? '#3f8600' : '#cf1322' 
                  }} />
                  <Text type={comparison.revenueGrowth >= 0 ? 'success' : 'danger'} style={{ marginLeft: 4 }}>
                    {comparison.revenueGrowth >= 0 ? '+' : ''}{comparison.revenueGrowth.toFixed(1)}% 环比
                  </Text>
                </div>
              )}
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="活跃账号"
                value={country.totalAccounts}
                prefix={<TeamOutlined />}
                suffix="个"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="订单量"
                value={country.totalOrders}
                prefix={<ShoppingCartOutlined />}
              />
              {comparison && (
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  <TrendingUpOutlined style={{ 
                    color: comparison.ordersGrowth >= 0 ? '#3f8600' : '#cf1322' 
                  }} />
                  <Text type={comparison.ordersGrowth >= 0 ? 'success' : 'danger'} style={{ marginLeft: 4 }}>
                    {comparison.ordersGrowth >= 0 ? '+' : ''}{comparison.ordersGrowth.toFixed(1)}% 环比
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* 小组业绩表格 */}
        <Card title={`${country.name}市场小组业绩明细`}>
          <Table
            columns={[
              {
                title: '小组名称',
                dataIndex: 'name',
                key: 'name',
                render: (text: string) => <Text strong>{text}</Text>
              },
              {
                title: '组长',
                dataIndex: 'leader',
                key: 'leader'
              },
              {
                title: `收入 (${country.currency})`,
                key: 'revenue',
                render: (record: any) => (
                  <Text strong style={{ color: '#3f8600' }}>
                    {country.currency} {record.revenue.toLocaleString()}
                  </Text>
                )
              },
              {
                title: '账号数',
                dataIndex: 'accounts',
                key: 'accounts'
              },
              {
                title: '订单量',
                dataIndex: 'orders', 
                key: 'orders'
              },
              {
                title: '人效',
                key: 'efficiency',
                render: (record: any) => (
                  <Text>{country.currency} {Math.round(record.revenue / record.accounts).toLocaleString()}</Text>
                )
              },
              {
                title: '占比',
                key: 'share',
                render: (record: any) => {
                  const share = Math.round((record.revenue / country.totalRevenue) * 100);
                  return <Tag color="blue">{share}%</Tag>;
                }
              }
            ]}
            dataSource={country.groups.sort((a, b) => b.revenue - a.revenue)}
            rowKey="name"
            pagination={false}
            size="small"
          />
        </Card>
      </div>
    );
  };

  const currentData = getCurrentTimeData();

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <Title level={2}>
        <DashboardOutlined /> CEO运营数据总览
      </Title>
      <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
        多维度业绩分析：按时间、国家、小组查看经营数据
      </Text>

      {/* 时间选择器 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Space>
              <CalendarOutlined />
              <Text strong>时间范围：</Text>
              <Select 
                value={timeType} 
                onChange={(value) => setTimeType(value)} 
                style={{ width: 120 }}
              >
                <Option value="today">今日</Option>
                <Option value="yesterday">昨日</Option>
                <Option value="month">月度</Option>
                <Option value="custom">自定义</Option>
              </Select>
              
              {timeType === 'custom' && (
                <DatePicker
                  value={selectedDate}
                  onChange={(date) => date && setSelectedDate(date)}
                  format="YYYY-MM-DD"
                />
              )}
              
              {timeType === 'month' && (
                <DatePicker
                  picker="month"
                  value={selectedMonth}
                  onChange={(date) => date && setSelectedMonth(date)}
                  format="YYYY-MM"
                />
              )}
            </Space>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} type="primary">
              刷新数据
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 重要提示 */}
      <Alert
        message="📊 数据说明"
        description="由于各国使用不同货币，收入数据按国家分别统计。总体概览仅显示非货币指标（账号数、订单量等）"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* 总体概览（非货币指标） */}
      <Card title={getTimeTitle()} style={{ marginBottom: 24 }}>
        {renderOverviewCards()}
      </Card>

      {/* 按国家分Tab显示（解决货币问题） */}
      <Tabs 
        activeKey={activeCountry}
        onChange={setActiveCountry}
        type="card"
        items={currentData.countries.map(country => ({
          key: country.code,
          label: (
            <Space>
              <span style={{ fontSize: 16 }}>{country.flag}</span>
              <span>{country.name}</span>
              <Tag color="blue">{country.currency}</Tag>
            </Space>
          ),
          children: renderCountryDetail(country)
        }))}
      />
    </div>
  );
};

export default TestCEOSimple; 