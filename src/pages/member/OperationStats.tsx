import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  DatePicker, 
  Select, 
  Table, 
  Typography,
  Spin,
  Alert,
  Tag,
  Progress,
  Tabs,
  Space,
  Badge,
  Avatar,
  Tooltip,
  Button,
  Divider,
  ConfigProvider,
  message
} from 'antd';
import { 
  DollarOutlined, 
  ShoppingOutlined, 
  TeamOutlined, 
  ExclamationCircleOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  CrownOutlined,
  FireOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  SolutionOutlined,
  LineChartOutlined,
  PieChartOutlined,
  BarChartOutlined,
  DashboardOutlined,
  CalendarOutlined,
  ReloadOutlined,
  DisconnectOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import zhCN from 'antd/es/locale/zh_CN';
import ReactECharts from 'echarts-for-react';
import { getCountries, Country } from '../../services/countries';
import { getMemberOperationStats, OperationStatsParams, OperationStatsData } from '../../services/admin';

// 设置dayjs为中文
dayjs.locale('zh-cn');

const { Title, Text } = Typography;
const { Option } = Select;

const MemberOperationStats: React.FC = () => {
  const [loading, setLoading] = useState(true); // 初始设置为true，避免闪烁
  const [isToday, setIsToday] = useState<boolean>(true); // 默认选择今日
  const [selectedMonth, setSelectedMonth] = useState<any>(null); // 默认不选择月份
  const [selectedCountry, setSelectedCountry] = useState<number>(1); // 默认美国ID为1
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  const [operationData, setOperationData] = useState<OperationStatsData | null>(null);

  // 获取当前组员的数据
  const getCurrentMemberData = () => {
    if (!operationData || !operationData.groups || operationData.groups.length === 0) {
      return null;
    }
    
    // 对于组员，只会返回一个包含自己数据的组
    const group = operationData.groups[0];
    if (!group.members || group.members.length === 0) {
      return null;
    }
    
    return group.members[0]; // 只有一个成员（自己）
  };

  // 获取国家列表
  const fetchCountries = async () => {
    try {
      const data = await getCountries();
      // 只显示启用的国家，按排序顺序排列
      const enabledCountries = data.filter(country => country.enabled)
                                   .sort((a, b) => a.sort_order - b.sort_order);
      setAvailableCountries(enabledCountries);
      
      // 如果当前选择的国家不在列表中，设置为第一个国家
      if (enabledCountries.length > 0 && !enabledCountries.find(c => c.id === selectedCountry)) {
        setSelectedCountry(enabledCountries[0].id);
      }
    } catch (error) {
      console.error('获取国家列表失败:', error);
      message.error('获取国家列表失败');
      // 即使国家列表获取失败，也要停止loading状态
      setLoading(false);
    }
  };

  // 获取运营统计数据
  const fetchOperationStats = async () => {
    try {
      setLoading(true);
      
      // 构建请求参数
      const params: OperationStatsParams = {
        time_type: isToday ? 'day' : 'month',
        country_id: selectedCountry,
        detail_level: 'member'
      };

      // 如果选择了月份，添加date参数
      if (!isToday && selectedMonth) {
        params.date = selectedMonth.format('YYYYMM');
      }

      const response = await getMemberOperationStats(params);
      
      // 后端返回的是 {code, message, data} 格式，我们需要 data 字段
      const apiResponse = response.data as any;
      
      if (apiResponse.data) {
        setOperationData(apiResponse.data);
      }
    } catch (error) {
      console.error('获取运营统计数据失败:', error);
      message.error('获取运营统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 在组件加载时获取国家列表
  useEffect(() => {
    fetchCountries();
  }, []);

  // 当国家列表加载完成后，获取初始数据
  useEffect(() => {
    if (availableCountries.length > 0) {
      fetchOperationStats();
    }
  }, [availableCountries]);

  // 当时间选择器或国家选择器改变时重新获取数据  
  useEffect(() => {
    if (availableCountries.length > 0) { // 确保国家列表已加载
      fetchOperationStats();
    }
  }, [isToday, selectedMonth, selectedCountry]);

  const getTimeTitle = () => {
    const countryText = availableCountries.find(c => c.id === selectedCountry)?.name || '未知国家';
    
    if (isToday) {
      return `今日运营数据 - ${countryText}`;
    } else {
      const monthText = selectedMonth ? selectedMonth.format('YYYY年M月') : '当月';
      return `${monthText}运营数据 - ${countryText}`;
    }
  };

  const handleTodayClick = () => {
    setIsToday(true);
    setSelectedMonth(null);
  };

  const handleMonthChange = (value: any) => {
    setSelectedMonth(value);
    setIsToday(false);
  };

  const getCurrencySymbol = (countryId: number) => {
    const country = availableCountries.find(c => c.id === countryId);
    if (!country) return '$';
    
    switch(country.name) {
      case '美国':
        return '$';
      case '印尼':
        return 'Rp';
      case '英国':
        return '£';
      case '马来西亚':
        return 'RM';
      case '泰国':
        return '฿';
      case '越南':
        return '₫';
      default:
        return '$';
    }
  };

  // 渲染KPI卡片（参考组长页面设计）
  const renderKPICards = () => {
    const summary = operationData?.summary;
    const currencySymbol = getCurrencySymbol(selectedCountry);
    
    // 如果正在加载中，不显示任何内容（由外层的Spin处理）
    if (loading) {
      return null;
    }
    
    // 如果加载完成但没有数据，显示提示
    if (!loading && !summary) {
      return (
        <Alert
          message="未找到运营数据"
          description="请确认网络连接和数据权限"
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      );
    }
    
    return (
      <div style={{ marginBottom: 32 }}>
        {/* 营业总额 - 独占一大块 */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card style={{ 
              background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
              border: 'none',
              borderRadius: 20,
              boxShadow: '0 10px 40px rgba(24, 144, 255, 0.4)',
              minHeight: '160px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Text style={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    fontSize: '18px', 
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    我的总营业额(GMV)
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginBottom: 12 }}>
                  <Text style={{ color: '#fff', fontSize: '48px', fontWeight: '700', marginRight: 8 }}>
                    {currencySymbol}
                  </Text>
                  <Text style={{ color: '#fff', fontSize: '56px', fontWeight: '700', lineHeight: 1 }}>
                    {(summary.total_revenue || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                  📊 {getTimeTitle()}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 5个小卡片 - 一行布局，宽度一致 */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <Card style={{ 
            background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
            border: 'none',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(114, 46, 209, 0.3)',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            flex: 1
          }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>账号总数</Text>}
              value={summary.total_accounts || 0}
              prefix={<TeamOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}
            />
          </Card>
          <Card style={{ 
            background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
            border: 'none',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(82, 196, 26, 0.3)',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            flex: 1
          }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>订单总数</Text>}
              value={summary.total_orders || 0}
              prefix={<ShoppingOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}
            />
          </Card>
          <Card style={{ 
            background: 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)',
            border: 'none',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(250, 140, 22, 0.3)',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            flex: 1
          }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>橱窗失效</Text>}
              value={summary.shop_expired_accounts || 0}
              prefix={<WarningOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}
            />
          </Card>
          <Card style={{ 
            background: 'linear-gradient(135deg, #ff6b35 0%, #ff8f65 100%)',
            border: 'none',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            flex: 1
          }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>违规账号</Text>}
              value={summary.violation_accounts || 0}
              prefix={<ExclamationCircleOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}
              suffix={<Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                ({summary.total_accounts ? ((summary.violation_accounts / summary.total_accounts) * 100).toFixed(1) : 0}%)
              </Text>}
            />
          </Card>
          <Card style={{ 
            background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
            border: 'none',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(211, 47, 47, 0.4)',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            flex: 1
          }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>⚠️ 登录失效</Text>}
              value={summary.login_expired_accounts || 0}
              prefix={<DisconnectOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}
            />
          </Card>
        </div>
      </div>
    );
  };

  // 渲染个人详情表格
  const renderPersonalDetails = () => {
    const memberData = getCurrentMemberData();
    const currencySymbol = getCurrencySymbol(selectedCountry);
    
    // 如果正在加载中，不显示内容
    if (loading) {
      return null;
    }

    if (!memberData) {
      return (
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <UserOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              <Text strong>我的运营详情</Text>
            </div>
          }
          style={{ borderRadius: 12 }}
        >
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8c8c8c' }}>
            暂无个人数据
          </div>
        </Card>
      );
    }

    const columns = [
      {
        title: '指标项目',
        dataIndex: 'label',
        key: 'label',
        width: '30%',
        render: (text: string, record: any) => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {record.icon}
            <Text strong style={{ marginLeft: 8 }}>{text}</Text>
          </div>
        )
      },
      {
        title: '数值',
        dataIndex: 'value',
        key: 'value',
        width: '25%',
        render: (value: any, record: any) => (
          <Text strong style={{ color: record.color || '#1890ff', fontSize: '16px' }}>
            {record.prefix || ''}{value}{record.suffix || ''}
          </Text>
        )
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: string, record: any) => (
          <Badge status={record.badgeStatus} text={status} />
        )
      }
    ];

    const dataSource = [
      {
        key: 'username',
        label: '用户名称',
        value: memberData.username,
        status: '正常',
        icon: <UserOutlined style={{ color: '#1890ff' }} />,
        badgeStatus: 'success' as const
      },
      {
        key: 'accounts',
        label: '账号数量',
        value: memberData.accounts || 0,
        status: memberData.accounts > 0 ? '有账号' : '无账号',
        icon: <TeamOutlined style={{ color: '#52c41a' }} />,
        badgeStatus: (memberData.accounts > 0 ? 'success' : 'warning') as const,
        suffix: ' 个'
      },
      {
        key: 'revenue',
        label: isToday ? '今日收入' : '月度收入',
        value: (memberData.revenue || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        status: memberData.revenue > 0 ? '有收入' : '无收入',
        icon: <DollarOutlined style={{ color: '#fa8c16' }} />,
        prefix: currencySymbol,
        badgeStatus: (memberData.revenue > 0 ? 'success' : 'default') as const,
        color: '#fa8c16'
      },
      {
        key: 'orders',
        label: '订单数量',
        value: memberData.orders || 0,
        status: memberData.orders > 0 ? '有订单' : '无订单',
        icon: <ShoppingOutlined style={{ color: '#722ed1' }} />,
        badgeStatus: (memberData.orders > 0 ? 'success' : 'default') as const,
        suffix: ' 个',
        color: '#722ed1'
      },
      {
        key: 'violations',
        label: '违规账号',
        value: memberData.violations || 0,
        status: memberData.violations > 0 ? '有违规' : '无违规',
        icon: <ExclamationCircleOutlined style={{ color: memberData.violations > 0 ? '#ff4d4f' : '#52c41a' }} />,
        badgeStatus: (memberData.violations > 0 ? 'error' : 'success') as const,
        suffix: ' 个',
        color: memberData.violations > 0 ? '#ff4d4f' : '#52c41a'
      },
      {
        key: 'normal_rate',
        label: '正常率',
        value: (memberData.normal_rate || 0).toFixed(1),
        status: memberData.normal_rate >= 90 ? '优秀' : memberData.normal_rate >= 70 ? '良好' : '需改进',
        icon: <CheckCircleOutlined style={{ color: memberData.normal_rate >= 90 ? '#52c41a' : memberData.normal_rate >= 70 ? '#faad14' : '#ff4d4f' }} />,
        badgeStatus: (memberData.normal_rate >= 90 ? 'success' : memberData.normal_rate >= 70 ? 'warning' : 'error') as const,
        suffix: '%',
        color: memberData.normal_rate >= 90 ? '#52c41a' : memberData.normal_rate >= 70 ? '#faad14' : '#ff4d4f'
      }
    ];

    return (
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            <Text strong>我的运营详情</Text>
          </div>
        }
        extra={<Button type="link" icon={<BarChartOutlined />}>详细报表</Button>}
        style={{ borderRadius: 12 }}
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size="middle"
          showHeader={false}
          bordered={false}
        />
      </Card>
    );
  };

  // 渲染违规统计（参考组长页面设计）
  const renderViolationStats = () => {
    const violationData = operationData?.summary?.violation_reasons;
    
    // 如果正在加载中，不显示内容
    if (loading) {
      return null;
    }
    
    if (!violationData || Object.keys(violationData).length === 0) {
      return (
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
              <Text strong>我的违规分析</Text>
            </div>
          }
          extra={<Button type="link" icon={<BarChartOutlined />}>详细分析</Button>}
          style={{ borderRadius: 12 }}
        >
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
            <div style={{ fontSize: '16px', color: '#52c41a' }}>🎉 恭喜！暂无违规记录</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>保持良好的运营状态</div>
          </div>
        </Card>
      );
    }

    const getColorByName = (name: string) => {
      const colors = {
        '无违规': '#52c41a',
        '非原创内容': '#ff4d4f',
        '视频与内容不符': '#fa8c16',
        '未经授权使用': '#722ed1',
        '关联封号': '#eb2f96',
        '其它违规': '#1890ff'
      };
      return colors[name as keyof typeof colors] || '#1890ff';
    };

    // 转换违规数据为图表格式
    const violationStats = Object.entries(violationData).map(([key, value]) => ({
      name: value.name,
      count: value.count,
      percentage: value.percentage
    })).filter(item => item.count > 0);

    const colors = ['#1890ff', '#ff4d4f', '#eb2f96', '#fa8c16', '#722ed1'];
    
    const pieData = violationStats.map((item, index) => ({
      value: item.count,
      name: item.name,
      itemStyle: {
        color: getColorByName(item.name)
      }
    }));

    const totalViolations = violationStats.reduce((sum, item) => sum + item.count, 0);
    const totalAccounts = operationData?.summary?.total_accounts || 0;

    // 饼图配置
    const pieOption = {
      tooltip: {
        trigger: 'item',
        formatter: function(params: any) {
          return `
            <div style="padding: 8px;">
              <strong>${params.name}</strong><br/>
              <span style="color: ${params.color};">● 数量: ${params.value}</span><br/>
              <span style="color: #666;">● 占比: ${params.percent}%</span>
            </div>
          `;
        }
      },

      legend: {
        type: 'scroll',
        orient: 'horizontal',
        bottom: 20,
        data: [
          { name: '其它违规', itemStyle: { color: colors[0] } },
          { name: '非原创内容', itemStyle: { color: colors[1] } },
          { name: '关联封号', itemStyle: { color: colors[2] } },
          { name: '视频与内容不符', itemStyle: { color: colors[3] } },
          { name: '未经授权使用', itemStyle: { color: colors[4] } }
        ],
        textStyle: {
          fontSize: 11,
          color: '#666'
        }
      },
      series: [
        {
          name: '违规分类',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '40%'],
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}',
            fontSize: 11,
            color: '#333',
            fontWeight: 'normal'
          },
          labelLine: {
            show: false
          },
          emphasis: {
            scale: false,
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          data: pieData
        }
      ]
    };

    return (
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            <Text strong>我的违规分析</Text>
          </div>
        }
        extra={<Button type="link" icon={<BarChartOutlined />}>详细分析</Button>}
        style={{ borderRadius: 12 }}
      >
        {/* 饼图 */}
        {violationStats.length > 0 && (
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <ReactECharts
              option={pieOption}
              style={{ height: '350px', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
            {/* 中心文字 */}
            <div style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>
                {totalViolations}
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                违规账号
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                总计 {totalAccounts} 个
              </div>
            </div>
          </div>
        )}

        <Divider />
        
        {/* 违规分类列表 */}
        {violationStats.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 12 
          }}>
            <Text>{item.name}</Text>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Tag color="red" style={{ margin: 0, marginRight: 8 }}>
                {item.count}
              </Tag>
              <Text type="secondary">({item.percentage.toFixed(1)}%)</Text>
            </div>
          </div>
        ))}
        {violationStats.length === 0 && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Text type="secondary">暂无违规数据</Text>
          </div>
        )}
      </Card>
    );
  };

  return (
    <ConfigProvider locale={zhCN}>
      <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>
          <DashboardOutlined style={{ marginRight: '8px' }} />
          我的运营数据仪表盘
        </Title>

        <Spin spinning={loading} size="large">
          {/* 时间和国家选择器 */}
          <div style={{ marginBottom: '24px' }}>
            <Space size={16}>
              <Button 
                type={isToday ? 'primary' : 'default'}
                onClick={handleTodayClick}
                icon={<CalendarOutlined />}
              >
                今日数据
              </Button>
              <DatePicker
                picker="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                allowClear={false}
                style={{ width: 120 }}
              />
              <Select 
                value={selectedCountry} 
                onChange={(value) => setSelectedCountry(value)}
                style={{ width: 120 }}
              >
                {availableCountries.map(country => (
                  <Option key={country.id} value={country.id}>{country.name}</Option>
                ))}
              </Select>
            </Space>
          </div>

          {/* KPI卡片 */}
          {renderKPICards()}

          {/* 个人详情 和 违规统计 - 水平布局 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              {/* 个人详情 */}
              {renderPersonalDetails()}
            </Col>
            <Col xs={24} lg={12}>
              {/* 违规统计 */}
              {renderViolationStats()}
            </Col>
          </Row>
        </Spin>
      </div>
    </ConfigProvider>
  );
};

export default MemberOperationStats; 