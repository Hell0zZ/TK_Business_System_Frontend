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
  CalendarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  BusinessData, 
  MonthlyHistory, 
  BusinessDataStats,
  MonthPeriodInfo 
} from '../../types/businessData';
import {
  getBusinessData,
  getBusinessDataStats,
  getMonthlyHistory,
  getAvailableMonthPeriods
} from '../../services/businessData';
import { getCountries, Country } from '../../services/countries';
import { getUsers } from '../../services/users';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminBusinessData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // 实时数据状态
  const [businessData, setBusinessData] = useState<BusinessData[]>([]);
  const [stats, setStats] = useState<BusinessDataStats | null>(null);
  
  // 历史数据状态
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyHistory[]>([]);
  const [availablePeriods, setAvailablePeriods] = useState<MonthPeriodInfo[]>([]);
  
  // 筛选状态
  const [selectedAccount, setSelectedAccount] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState<string>('business');
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  
  // 多条件搜索状态
  const [searchFilters, setSearchFilters] = useState({
    accountName: '',        // 账号名称
    country: 'all',        // 国家
    month: 'all',          // 月份  
    accountStatus: 'all',   // 账号状态
    groupName: 'all',      // 小组名称
    member: 'all',         // 组员
    violationReason: 'all' // 违规原因分类
  });
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    fetchStats();
    fetchBusinessData();
    fetchAvailablePeriods();
    fetchCountries();
    fetchUsers(); // 获取用户数据
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

  // 获取用户列表用于搜索
  const fetchUsers = async () => {
    try {
      const userData = await getUsers();
      setUsers(userData);
      // 提取组名列表
      const uniqueGroups = [...new Set(userData
        .filter((user: any) => user.group_name)
        .map((user: any) => user.group_name))];
      setGroups(uniqueGroups);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      // 如果获取失败，设置为空数组，不影响页面显示
      setUsers([]);
      setGroups([]);
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
        
      const matchesGroupName = searchFilters.groupName === 'all' || 
        (item.tiktok_account?.user?.group_name === searchFilters.groupName);
        
      const matchesMember = searchFilters.member === 'all' || 
        (item.tiktok_account?.user?.id && item.tiktok_account.user.id.toString() === searchFilters.member);
      
      return matchesAccountName && matchesCountry && 
             matchesAccountStatus && matchesGroupName && matchesMember;
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
        
      const matchesGroupName = searchFilters.groupName === 'all' || 
        (item.tiktok_account?.user?.group_name === searchFilters.groupName);
        
      const matchesMember = searchFilters.member === 'all' || 
        (item.tiktok_account?.user?.id && item.tiktok_account.user.id.toString() === searchFilters.member);
      
      return matchesAccountName && matchesCountry && 
             matchesMonth && matchesGroupName && matchesMember;
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
    
    // 调试输出：如果没有找到货币符号，输出国家名称
    if (country && !symbol) {
      console.log(`⚠️ 未找到国家 "${country}" 的货币符号映射`);
    }
    
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
      render: (name, record) => {
        const groupInfo = record.tiktok_account?.group_name && record.tiktok_account?.user?.username 
          ? `${record.tiktok_account.group_name} - ${record.tiktok_account.user.username}`
          : '';
        
        return (
          <Space direction="vertical" size={0}>
            <Text strong>{name || '-'}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.country || '-'}
            </Text>
            {groupInfo && (
              <Text type="secondary" style={{ fontSize: '11px', color: '#999' }}>
                {groupInfo}
              </Text>
            )}
          </Space>
        );
      },
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
          sorter: (a, b) => (a.today_revenue || 0) - (b.today_revenue || 0),
          showSorterTooltip: { title: '点击排序收入' },
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
            <div style={{ lineHeight: '1.4', padding: '4px 0' }}>
              {formatCurrency(value, record.country)}
            </div>
          ),
        },
        {
          title: '订单',
          dataIndex: 'today_orders',
          key: 'today_orders',
          width: 80,
          sorter: (a, b) => (a.today_orders || 0) - (b.today_orders || 0),
          showSorterTooltip: { title: '点击排序订单' },
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
          render: (value) => (
            <div style={{ lineHeight: '1.4', padding: '4px 0' }}>
              {value || 0}
            </div>
          ),
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
          render: (value) => (
            <div style={{ lineHeight: '1.4', padding: '4px 0' }}>
              {value || 0}
            </div>
          ),
        },
        {
          title: '点击',
          dataIndex: 'today_clicks',
          key: 'today_clicks',
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
          render: (value) => (
            <div style={{ lineHeight: '1.4', padding: '4px 0' }}>
              {value || 0}
            </div>
          ),
        },
      ],
    },
    {
      title: '本月数据',
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
            <div style={{ lineHeight: '1.4', padding: '4px 0' }}>
              {formatCurrency(value, record.country)}
            </div>
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
          render: (value) => (
            <div style={{ lineHeight: '1.4', padding: '4px 0' }}>
              {value || 0}
            </div>
          ),
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
          render: (value) => (
            <div style={{ lineHeight: '1.4', padding: '4px 0' }}>
              {value || 0}
            </div>
          ),
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
          render: (value) => (
            <div style={{ lineHeight: '1.4', padding: '4px 0' }}>
              {value || 0}
            </div>
          ),
        },
      ],
    },
    {
      title: '账号状态',
      key: 'account_status',
      width: 120,
      onHeaderCell: () => ({
        style: {
          backgroundColor: '#f0ffff',
          color: '#13c2c2',
          fontWeight: '500'
        }
      }),
      onCell: () => ({
        style: {
          backgroundColor: '#f0ffff'
        }
      }),
      render: (_, record) => {
        const accountStatus = record.account_status || '正常';
        
        return (
          <div style={{ lineHeight: '1.4', padding: '4px 0' }}>
            <Tag color={getAccountStatusColor(accountStatus)}>
              {accountStatus}
            </Tag>
          </div>
        );
      },
    },
    {
      title: '违规原因',
      key: 'violation_reason',
      width: 160,
      onHeaderCell: () => ({
        style: {
          backgroundColor: '#f0ffff',
          color: '#13c2c2',
          fontWeight: '500'
        }
      }),
      onCell: () => ({
        style: {
          backgroundColor: '#f0ffff'
        }
      }),
      render: (_, record) => {
        if (!record.last_violation_reason) {
          return (
            <div style={{ lineHeight: '1.4', padding: '4px 0' }}>
              <Text type="secondary">--</Text>
            </div>
          );
        }
        
        const appealStatus = record.appeal_status;
        
        return (
          <div style={{ lineHeight: '1.4' }}>
            <Tooltip title={`处理结果：${record.last_violation_result || '无详细结果'}`}>
              <Text 
                style={{ 
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: '#1890ff',
                  maxWidth: '140px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-block'
                }}
              >
                {record.last_violation_reason}
              </Text>
            </Tooltip>
            <div style={{ fontSize: '12px', marginTop: '2px', color: getAppealStatusColor(appealStatus) }}>
              申诉：{appealStatus || '--'}
            </div>
          </div>
        );
      },
    },
    {
      title: '更新时间',
      dataIndex: 'crawler_updated_at',
      key: 'crawler_updated_at',
      width: 150,
      onHeaderCell: () => ({
        style: {
          backgroundColor: '#f0ffff',
          color: '#13c2c2',
          fontWeight: '500'
        }
      }),
      onCell: () => ({
        style: {
          backgroundColor: '#f0ffff'
        }
      }),
      render: (time) => (
        <div style={{ lineHeight: '1.4', padding: '4px 0' }}>
          {time ? new Date(time).toLocaleString() : '-'}
        </div>
      ),
    },
  ];

  // 月度历史数据表格列
  const historyColumns: ColumnsType<MonthlyHistory> = [
    {
      title: 'TikTok账号',
      dataIndex: 'tiktok_name',
      key: 'tiktok_name',
      width: 150,
      render: (name, record) => {
        const groupInfo = record.tiktok_account?.group_name && record.tiktok_account?.user?.username 
          ? `${record.tiktok_account.group_name} - ${record.tiktok_account.user.username}`
          : '';
        
        return (
          <Space direction="vertical" size={0}>
            <Text strong>{name || '-'}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.country || '-'}
            </Text>
            {groupInfo && (
              <Text type="secondary" style={{ fontSize: '11px', color: '#999' }}>
                {groupInfo}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: '月份',
      dataIndex: 'month_period',
      key: 'month_period',
      width: 100,
      render: (period) => formatMonthPeriod(period),
    },
    {
      title: '月度收入',
      dataIndex: 'month_revenue',
      key: 'month_revenue',
      width: 120,
      render: (value, record) => formatCurrency(value, record.country),
    },
    {
      title: '月度订单',
      dataIndex: 'month_orders',
      key: 'month_orders',
      width: 100,
      render: (value) => value || 0,
    },
    {
      title: '月度浏览',
      dataIndex: 'month_views',
      key: 'month_views',
      width: 100,
      render: (value) => value || 0,
    },
    {
      title: '月度点击',
      dataIndex: 'month_clicks',
      key: 'month_clicks',
      width: 100,
      render: (value) => value || 0,
    },
    {
      title: '更新时间',
      dataIndex: 'crawler_updated_at',
      key: 'crawler_updated_at',
      width: 150,
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
  ];



  return (
    <div>




      {/* 主要内容 */}
      <Card>
        <Title level={3}>账号数据搜索</Title>
        
        {/* 多条件搜索工具栏 */}
        <Card size="small" style={{ marginBottom: 16 }} title="🔍 多条件搜索">
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* 筛选条件 - 单行布局 */}
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
                  <span style={{ fontSize: '13px', color: '#666' }}>小组:</span>
                  <Select
                    size="small"
                    value={searchFilters.groupName}
                    onChange={(value) => setSearchFilters(prev => ({ ...prev, groupName: value }))}
                    style={{ width: '100px' }}
                  >
                    <Option value="all">全部</Option>
                    {groups.map(group => (
                      <Option key={group} value={group}>{group}</Option>
                    ))}
                  </Select>
                </Space>
              </Col>
              
              <Col flex="none">
                <Space>
                  <span style={{ fontSize: '13px', color: '#666' }}>组员:</span>
                  <Select
                    size="small"
                    value={searchFilters.member}
                    onChange={(value) => setSearchFilters(prev => ({ ...prev, member: value }))}
                    style={{ width: '100px' }}
                    showSearch
                    optionFilterProp="children"
                  >
                    <Option value="all">全部</Option>
                    {users.map(user => (
                      <Option key={user.id} value={user.id.toString()}>
                        {user.username}
                      </Option>
                    ))}
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
                    groupName: 'all',
                    member: 'all',
                    violationReason: 'all'
                  })}
                  type="dashed"
                >
                  🗑️ 清空条件
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

export default AdminBusinessData; 