import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tabs,
  Row,
  Col,
  Statistic,
  Select,
  Input,
  Space,
  Tag,
  Button,
  DatePicker,
  Tooltip,
  message,
  Typography,
  Divider
} from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ClickOutlined,
  CalendarOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  BusinessData, 
  MonthlyHistory, 
  BusinessDataStats,
  MonthlyStats,
  MonthPeriodInfo 
} from '../../types/businessData';
import {
  getBusinessData,
  getBusinessDataStats,
  getMonthlyHistory,
  getMonthlyHistoryStats,
  getAvailableMonthPeriods
} from '../../services/businessData';
import { getCountries, Country } from '../../services/countries';

const { Title, Text } = Typography;
const { Option } = Select;

const MemberBusinessData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // 实时数据状态
  const [businessData, setBusinessData] = useState<BusinessData[]>([]);
  const [stats, setStats] = useState<BusinessDataStats | null>(null);
  
  // 历史数据状态
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyHistory[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [availablePeriods, setAvailablePeriods] = useState<MonthPeriodInfo[]>([]);
  
  // 筛选状态
  const [selectedAccount, setSelectedAccount] = useState<number | undefined>();
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<string>('business');
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  
  // 多条件搜索状态（组员版本 - 去掉组员筛选）
  const [searchFilters, setSearchFilters] = useState({
    accountName: '',        // 账号名称
    country: 'all',        // 国家
    month: 'all',          // 月份  
    accountStatus: 'all',   // 账号状态
    violationReason: 'all' // 违规原因分类
  });

  useEffect(() => {
    fetchStats();
    fetchBusinessData();
    fetchAvailablePeriods();
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchBusinessData();
    fetchStats();
  }, [selectedAccount, searchFilters.violationReason]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchMonthlyHistory();
    }
  }, [activeTab, selectedAccount]);

  useEffect(() => {
    if (activeTab === 'history' && selectedPeriods.length > 0) {
      fetchMonthlyStats();
    }
  }, [selectedPeriods]);

  // 获取统计数据
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const statsData = await getBusinessDataStats();
      setStats(statsData);
    } catch (error) {
      console.error('获取统计数据失败:', error);
      message.error('获取统计数据失败');
    } finally {
      setStatsLoading(false);
    }
  };

  // 获取实时商业数据
  const fetchBusinessData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      
      // 如果选择了特定账号
      if (selectedAccount) {
        params.tiktok_account_id = selectedAccount;
      }
      
      // 如果选择了违规原因分类筛选
      if (searchFilters.violationReason && searchFilters.violationReason !== 'all') {
        params.violation_reason_category = searchFilters.violationReason;
      }
      
      const data = await getBusinessData(params);
      setBusinessData(data);
    } catch (error) {
      console.error('获取商业数据失败:', error);
      message.error('获取商业数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取月度历史数据
  const fetchMonthlyHistory = async () => {
    setLoading(true);
    try {
      const data = await getMonthlyHistory({
        tiktok_account_id: selectedAccount
      });
      setMonthlyHistory(data);
    } catch (error) {
      console.error('获取历史数据失败:', error);
      message.error('获取历史数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取月度统计数据
  const fetchMonthlyStats = async () => {
    try {
      const data = await getMonthlyHistoryStats({
        month_periods: selectedPeriods
      });
      setMonthlyStats(data);
    } catch (error) {
      console.error('获取月度统计失败:', error);
      message.error('获取月度统计失败');
    }
  };

  // 获取可用月份
  const fetchAvailablePeriods = async () => {
    try {
      const data = await getAvailableMonthPeriods();
      setAvailablePeriods(data);
    } catch (error) {
      console.error('获取可用月份失败:', error);
    }
  };

  // 获取国家列表
  const fetchCountries = async () => {
    try {
      const data = await getCountries();
      // 只显示启用的国家，按排序顺序排列
      const enabledCountries = data.filter(country => country.enabled)
                                   .sort((a, b) => a.sort_order - b.sort_order);
      setAvailableCountries(enabledCountries);
    } catch (error) {
      console.error('获取国家列表失败:', error);
      message.error('获取国家列表失败');
    }
  };

  // 筛选数据
  const getFilteredBusinessData = () => {
    if (!businessData || !Array.isArray(businessData)) return [];
    
    return businessData.filter(item => {
      // 多条件筛选
      const matchesAccountName = !searchFilters.accountName || 
        (item.tiktok_name && item.tiktok_name.toLowerCase().includes(searchFilters.accountName.toLowerCase()));
        
      const matchesCountry = searchFilters.country === 'all' || item.country === searchFilters.country;
        
      const matchesAccountStatus = searchFilters.accountStatus === 'all' || 
        item.account_status === searchFilters.accountStatus;
      
      return matchesAccountName && matchesCountry && matchesAccountStatus;
    });
  };

  const getFilteredMonthlyHistory = () => {
    if (!monthlyHistory || !Array.isArray(monthlyHistory)) return [];
    
    return monthlyHistory.filter(item => {
      // 多条件筛选
      const matchesAccountName = !searchFilters.accountName || 
        (item.tiktok_name && item.tiktok_name.toLowerCase().includes(searchFilters.accountName.toLowerCase()));
        
      const matchesCountry = searchFilters.country === 'all' || item.country === searchFilters.country;
        
      const matchesMonth = searchFilters.month === 'all' || 
        item.month_period.toString() === searchFilters.month;
      
      return matchesAccountName && matchesCountry && matchesMonth;
    });
  };

  // 格式化月份显示
  const formatMonthPeriod = (period: number) => {
    const year = Math.floor(period / 100);
    const month = period % 100;
    return `${year}年${month.toString().padStart(2, '0')}月`;
  };

  // 格式化金额
  const formatCurrency = (amount?: number, country?: string) => {
    if (amount === undefined || amount === null) return '-';
    
    // 根据国家显示不同货币符号（支持多种国家名称格式）
    const currencySymbols: { [key: string]: string } = {
      // 美国
      '美国': '$',
      'USA': '$',
      'United States': '$',
      
      // 马来西亚  
      '马来西亚': 'RM',
      'Malaysia': 'RM',
      
      // 印度尼西亚
      '印度尼西亚': 'Rp',
      '印尼': 'Rp',
      'Indonesia': 'Rp',
      
      // 英国
      '英国': '£',
      'UK': '£',
      'United Kingdom': '£',
      
      // 越南
      '越南': '₫',
      'Vietnam': '₫',
      
      // 泰国
      '泰国': '฿',
      'Thailand': '฿',
      
      // 新加坡
      '新加坡': 'S$',
      'Singapore': 'S$',
      
      // 菲律宾
      '菲律宾': '₱',
      'Philippines': '₱',
      
      // 中国
      '中国': '¥',
      'China': '¥'
    };
    
    const symbol = country && currencySymbols[country] ? currencySymbols[country] : '';
    
    return `${symbol}${amount.toLocaleString()}`;
  };

  // 获取账号状态颜色
  const getAccountStatusColor = (status: string) => {
    switch (status) {
      case '登录失效': return 'red';      // 最严重
      case '橱窗失效': return 'orange';   // 第二严重
      case '永久封禁': return 'red';      // 永久封禁用红色醒目标记
      case '有违规': return 'gold';       // 轻度
      case '正常': return 'green';        // 正常
      default: return 'default';
    }
  };

  // 获取申诉状态颜色
  const getAppealStatusColor = (status?: string) => {
    if (!status) return '#999';  // 灰色
    switch (status) {
      case '申诉已获得批准': return '#52c41a';  // 绿色
      case '申诉未获得批准': return '#ff4d4f';  // 红色
      case '申诉期限已过': return '#fa8c16';    // 橙色
      case '尚未申诉': return '#999';           // 灰色
      default: return '#999';
    }
  };

  // 实时商业数据表格列
  const businessColumns: ColumnsType<BusinessData> = [
    {
      title: 'TikTok账号',
      dataIndex: 'tiktok_name',
      key: 'tiktok_name',
      width: 150,
      onHeaderCell: () => ({
        style: {
          backgroundColor: '#f9fff9',
          color: '#52c41a',
          fontWeight: '500'
        }
      }),
      onCell: () => ({
        style: {
          backgroundColor: '#f9fff9'
        }
      }),
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name || '-'}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.country || '-'}
          </Text>
        </Space>
      ),
    },
    {
      title: '今日数据',
      onHeaderCell: () => ({
        style: {
          backgroundColor: '#e6f7ff',
          color: '#1890ff',
          fontWeight: '600',
          textAlign: 'center'
        }
      }),
      children: [
        {
          title: '收入',
          dataIndex: 'today_revenue',
          key: 'today_revenue',
          width: 100,
          onHeaderCell: () => ({
            style: {
              backgroundColor: '#f8fbff',
              color: '#1890ff',
              fontWeight: '500'
            }
          }),
          onCell: () => ({
            style: {
              backgroundColor: '#f8fbff'
            }
          }),
          render: (value, record) => (
            <Text style={{ color: '#1890ff', fontWeight: 'bold' }}>
              {formatCurrency(value, record.country)}
            </Text>
          ),
        },
        {
          title: '订单',
          dataIndex: 'today_orders',
          key: 'today_orders',
          width: 80,
          onHeaderCell: () => ({
            style: {
              backgroundColor: '#f8fbff',
              color: '#1890ff',
              fontWeight: '500'
            }
          }),
          onCell: () => ({
            style: {
              backgroundColor: '#f8fbff'
            }
          }),
          render: (value) => value || 0,
        },
        {
          title: '浏览',
          dataIndex: 'today_views',
          key: 'today_views',
          width: 80,
          onHeaderCell: () => ({
            style: {
              backgroundColor: '#f8fbff',
              color: '#1890ff',
              fontWeight: '500'
            }
          }),
          onCell: () => ({
            style: {
              backgroundColor: '#f8fbff'
            }
          }),
          render: (value) => value || 0,
        },
      ],
    },
    {
      title: '月度数据',
      onHeaderCell: () => ({
        style: {
          backgroundColor: '#f6ffed',
          color: '#52c41a',
          fontWeight: '600',
          textAlign: 'center'
        }
      }),
      children: [
        {
          title: '收入',
      dataIndex: 'month_revenue',
      key: 'month_revenue',
          width: 100,
          onHeaderCell: () => ({
            style: {
              backgroundColor: '#f9fff9',
              color: '#52c41a',
              fontWeight: '500'
            }
          }),
          onCell: () => ({
            style: {
              backgroundColor: '#f9fff9'
            }
          }),
          render: (value, record) => (
            <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
              {formatCurrency(value, record.country)}
            </Text>
          ),
        },
        {
          title: '订单',
          dataIndex: 'month_orders',
          key: 'month_orders',
          width: 80,
          onHeaderCell: () => ({
            style: {
              backgroundColor: '#f9fff9',
              color: '#52c41a',
              fontWeight: '500'
            }
          }),
          onCell: () => ({
            style: {
              backgroundColor: '#f9fff9'
            }
          }),
          render: (value) => value || 0,
        },
        {
          title: '浏览',
          dataIndex: 'month_views',
          key: 'month_views',
          width: 80,
          onHeaderCell: () => ({
            style: {
              backgroundColor: '#f9fff9',
              color: '#52c41a',
              fontWeight: '500'
            }
          }),
          onCell: () => ({
            style: {
              backgroundColor: '#f9fff9'
            }
          }),
          render: (value) => value || 0,
        },
        {
          title: '点击',
          dataIndex: 'month_clicks',
          key: 'month_clicks',
          width: 80,
          onHeaderCell: () => ({
            style: {
              backgroundColor: '#f9fff9',
              color: '#52c41a',
              fontWeight: '500'
            }
          }),
          onCell: () => ({
            style: {
              backgroundColor: '#f9fff9'
            }
          }),
          render: (value) => value || 0,
        },
      ],
    },
    {
      title: '账号状态',
      dataIndex: 'account_status',
      key: 'account_status',
      width: 100,
      onHeaderCell: () => ({
        style: {
          backgroundColor: '#fff1f0',
          color: '#cf1322',
          fontWeight: '500'
        }
      }),
      onCell: () => ({
        style: {
          backgroundColor: '#fff1f0'
        }
      }),
      render: (status, record) => (
        <Space direction="vertical" size={0}>
          <Tag color={getAccountStatusColor(status)}>
            {status || '未知'}
          </Tag>
          {record.appeal_status && (
            <Text style={{ 
              fontSize: '11px', 
              color: getAppealStatusColor(record.appeal_status) 
            }}>
              {record.appeal_status}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '违规分析',
      dataIndex: 'violation_reason',
      key: 'violation_reason',
      width: 120,
      onHeaderCell: () => ({
        style: {
          backgroundColor: '#fff2e8',
          color: '#d4380d',
          fontWeight: '500'
        }
      }),
      onCell: () => ({
        style: {
          backgroundColor: '#fff2e8'
        }
      }),
      render: (reason, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '12px' }}>
            {reason || '无'}
          </Text>
          {record.last_violation_time && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {new Date(record.last_violation_time).toLocaleDateString()}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '爬虫状态',
      dataIndex: 'crawler_status',
      key: 'crawler_status',
      width: 100,
      onHeaderCell: () => ({
        style: {
          backgroundColor: '#f6ffed',
          color: '#52c41a',
          fontWeight: '500'
        }
      }),
      onCell: () => ({
        style: {
          backgroundColor: '#f6ffed'
        }
      }),
      render: (status, record) => (
        <Space direction="vertical" size={0}>
          <Tag color={status === '成功' ? 'green' : 'red'}>
            {status || '未知'}
          </Tag>
          {record.crawler_updated_at && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {new Date(record.crawler_updated_at).toLocaleDateString()}
            </Text>
          )}
        </Space>
      ),
    },
  ];

  // 历史数据表格列
  const historyColumns: ColumnsType<MonthlyHistory> = [
    {
      title: 'TikTok账号',
      dataIndex: 'tiktok_name',
      key: 'tiktok_name',
      width: 150,
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name || '-'}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.country || '-'}
          </Text>
        </Space>
      ),
    },
    {
      title: '月份',
      dataIndex: 'month_period',
      key: 'month_period',
      width: 100,
      render: (period) => formatMonthPeriod(period),
    },
    {
      title: '收入',
      dataIndex: 'month_revenue',
      key: 'month_revenue',
      width: 120,
      render: (value, record) => (
        <Text style={{ color: '#1890ff', fontWeight: 'bold' }}>
          {formatCurrency(value, record.country)}
        </Text>
      ),
    },
    {
      title: '订单',
      dataIndex: 'month_orders',
      key: 'month_orders',
      width: 80,
      render: (value) => value || 0,
    },
    {
      title: '浏览',
      dataIndex: 'month_views',
      key: 'month_views',
      width: 80,
      render: (value) => value || 0,
    },
    {
      title: '点击',
      dataIndex: 'month_clicks',
      key: 'month_clicks',
      width: 80,
      render: (value) => value || 0,
    },
  ];

  // 计算统计数据
  const getOverallStats = (data: BusinessData[]) => {
    const total = data.length;
    const normalCount = data.filter(item => item.account_status === '正常').length;
    const violationCount = data.filter(item => ['有违规', '永久封禁'].includes(item.account_status)).length;
    const expiredCount = data.filter(item => ['登录失效', '橱窗失效'].includes(item.account_status)).length;
    
    return { total, normalCount, violationCount, expiredCount };
  };

  const overallStats = getOverallStats(getFilteredBusinessData());

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={3}>
          <DollarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          我的TikTok运营数据
        </Title>
        
        {/* 统计概览 */}
        <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#fafafa' }}>
          <Row gutter={16}>
                         <Col span={4}>
               <Statistic 
                 title="总账号数" 
                 value={overallStats.total} 
                 valueStyle={{ color: '#1890ff' }}
                 prefix={<UserOutlined />}
               />
             </Col>
             <Col span={4}>
               <Statistic 
                 title="正常账号" 
                 value={overallStats.normalCount} 
                 valueStyle={{ color: '#52c41a' }}
                 suffix={`/ ${overallStats.total}`}
               />
             </Col>
             <Col span={4}>
               <Statistic 
                 title="违规账号" 
                 value={overallStats.violationCount} 
                 valueStyle={{ color: '#ff4d4f' }}
                 prefix={<ExclamationCircleOutlined />}
               />
             </Col>
             <Col span={6}>
               <Statistic 
                 title="失效账号" 
                 value={overallStats.expiredCount} 
                 valueStyle={{ color: '#faad14' }}
               />
             </Col>
          </Row>
        </Card>
        
        {/* 搜索条件 */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Row gutter={[12, 0]} align="middle" wrap={false} style={{ overflowX: 'auto', paddingBottom: '8px' }}>
              <Col flex="none">
        <Space>
                  <span style={{ fontSize: '13px', color: '#666' }}>账号名称:</span>
          <Input
                    size="small"
                    placeholder="TikTok账号"
                    value={searchFilters.accountName}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, accountName: e.target.value }))}
                    style={{ width: '120px' }}
            allowClear
          />
                </Space>
              </Col>
              
              <Col flex="none">
                <Space>
                  <span style={{ fontSize: '13px', color: '#666' }}>国家:</span>
                  <Select
                    size="small"
                    value={searchFilters.country}
                    onChange={(value) => setSearchFilters(prev => ({ ...prev, country: value }))}
                    style={{ width: '100px' }}
                  >
                    <Option value="all">全部</Option>
                    {availableCountries.map(country => (
                      <Option key={country.id} value={country.name}>{country.name}</Option>
                    ))}
                  </Select>
                </Space>
              </Col>
              
              <Col flex="none">
                <Space>
                  <span style={{ fontSize: '13px', color: '#666' }}>账号状态:</span>
                  <Select
                    size="small"
                    value={searchFilters.accountStatus}
                    onChange={(value) => setSearchFilters(prev => ({ ...prev, accountStatus: value }))}
                    style={{ width: '100px' }}
                  >
                    <Option value="all">全部</Option>
                    <Option value="正常">正常</Option>
                    <Option value="登录失效">登录失效</Option>
                    <Option value="橱窗失效">橱窗失效</Option>
                    <Option value="永久封禁">永久封禁</Option>
                    <Option value="有违规">有违规</Option>
                  </Select>
                </Space>
              </Col>
              
              <Col flex="none">
                <Space>
                  <span style={{ fontSize: '13px', color: '#666' }}>违规原因:</span>
                  <Select
                    size="small"
                    value={searchFilters.violationReason}
                    onChange={(value) => setSearchFilters(prev => ({ ...prev, violationReason: value }))}
                    style={{ width: '120px' }}
                  >
                    <Option value="all">全部</Option>
                    <Option value="no_violation">无违规</Option>
                    <Option value="unoriginal_content">非原创内容</Option>
                    <Option value="content_mismatch">视频与内容不符</Option>
                    <Option value="unauthorized_use">未经授权使用</Option>
                    <Option value="association_ban">关联封号</Option>
                    <Option value="other_violation">其它违规</Option>
                  </Select>
                </Space>
              </Col>
              
              <Col flex="none">
                <Button 
                  size="small"
                  onClick={() => setSearchFilters({
                    accountName: '',
                    country: 'all',
                    month: 'all',
                    accountStatus: 'all',
                    violationReason: 'all'
                  })}
                  type="dashed"
                >
                  🗑️ 清空条件
          </Button>
              </Col>
              
              <Col flex="none">
                <Button 
                  size="small"
                  onClick={fetchBusinessData}
                  type="primary"
                  icon={<ReloadOutlined />}
                  loading={loading}
                >
                  刷新数据
                </Button>
              </Col>
            </Row>
          </Space>
          </Card>

        {/* 数据展示标签页 */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="实时商业数据" key="business">
            <Table
              columns={businessColumns}
              dataSource={getFilteredBusinessData()}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1200 }}
              size="middle"
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
                pageSize: 20,
              }}
            />
        </Tabs.TabPane>

          <Tabs.TabPane tab="月度历史数据" key="history">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <span style={{ fontSize: '13px', color: '#666' }}>筛选月份:</span>
                <Select
                  size="small"
                  value={searchFilters.month}
                  onChange={(value) => setSearchFilters(prev => ({ ...prev, month: value }))}
                  style={{ width: '120px' }}
                >
                  <Option value="all">全部月份</Option>
                  {availablePeriods.map(period => (
                    <Option key={period.monthPeriod} value={period.monthPeriod.toString()}>
                      {formatMonthPeriod(period.monthPeriod)}
                    </Option>
                  ))}
                </Select>
              </Space>
                </div>
            
            <Table
              columns={historyColumns}
              dataSource={getFilteredMonthlyHistory()}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1000 }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
                pageSize: 20,
              }}
            />
        </Tabs.TabPane>
      </Tabs>
      </Card>
    </div>
  );
};

export default MemberBusinessData; 