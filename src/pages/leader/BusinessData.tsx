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
  CalendarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  BusinessData, 
  MonthlyHistory, 
  BusinessDataStats,
  MonthlyStats,
  MonthlyHistoryStats,
  MonthPeriodInfo, 
  DailyHistory,
  DayPeriodInfo
} from '../../types/businessData';
import {
  getBusinessData,
  getBusinessDataStats,
  getMonthlyHistory,
  getMonthlyHistoryStats,
  getAvailableMonthPeriods,
  getDailyHistory,
  getAvailableDayPeriods
} from '../../services/businessData';
import { getCountries, Country } from '../../services/countries';
import { getUsers } from '../../services/users';
import moment from 'moment';
import type { Moment } from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

const LeaderBusinessData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // 实时数据状态
  const [businessData, setBusinessData] = useState<BusinessData[]>([]);
  const [stats, setStats] = useState<BusinessDataStats | null>(null);
  
  // 历史数据状态
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyHistory[]>([]);
  const [availablePeriods, setAvailablePeriods] = useState<MonthPeriodInfo[]>([]);
  // 新增：日报数据状态
  const [dailyHistory, setDailyHistory] = useState<DailyHistory[]>([]);
  const [availableDays, setAvailableDays] = useState<DayPeriodInfo[]>([]);
  const [dailySelectedDate, setDailySelectedDate] = useState<Moment | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyHistoryStats[]>([]);
  
  // 筛选状态
  const [selectedAccount, setSelectedAccount] = useState<number | undefined>();
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<string>('business');
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  
  // 多条件搜索状态
  const [searchFilters, setSearchFilters] = useState({
    accountName: '',        // 账号名称
    country: 'all',        // 国家
    month: 'all',          // 月份  
    accountStatus: 'all',   // 账号状态
    member: 'all',         // 组员
    violationReason: 'all' // 违规原因分类
  });
  const [users, setUsers] = useState<any[]>([]);

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
    // 新增：当切换到日报标签时加载日报数据（需选择具体日期）
    if (activeTab === 'daily' && dailySelectedDate) {
      fetchDailyHistory();
    }
  }, [activeTab, selectedAccount, dailySelectedDate]);

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
      const data = await getMonthlyHistoryStats(selectedPeriods);
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
      // 将 { monthPeriod, accountCount } 转为 MonthPeriodInfo 结构
      const mapped = data.map((d: any) => ({
        month_period: d.monthPeriod,
        account_count: d.accountCount,
      }));
      setAvailablePeriods(mapped);
    } catch (error) {
      console.error('获取可用月份失败:', error);
    }
  };

  // 新增：获取每日历史数据
  const fetchDailyHistory = async () => {
    if (!dailySelectedDate) {
      setDailyHistory([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getDailyHistory({
        tiktok_account_id: selectedAccount,
        day_period: dailySelectedDate.format('YYYYMMDD')
      });
      setDailyHistory(data);
    } catch (error) {
      console.error('获取日报数据失败:', error);
      message.error('获取日报数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 新增：获取可用日期
  const fetchAvailableDays = async () => {
    try {
      const days = await getAvailableDayPeriods();
      setAvailableDays(days);
    } catch (error) {
      console.error('获取可用日期失败:', error);
    }
  };

  // 默认选中昨天（北京时区同本地时区处理）
  useEffect(() => {
    const yesterday = moment().subtract(1, 'day').startOf('day');
    setDailySelectedDate(yesterday);
    // 同时拉取可用日期
    fetchAvailableDays();
  }, []);

  // 禁用当天及未来日期
  const disableDailyDate = (current: Moment) => {
    if (!current) return false;
    const today = moment().startOf('day');
    return current.isSameOrAfter(today, 'day');
  };

  // 处理日报日期选择
  const handleDailyDateChange = (value: Moment | null) => {
    setDailySelectedDate(value);
  };

  // 新增：日报筛选（与上方多条件一致）
  const getFilteredDailyHistory = () => {
    if (!dailyHistory || !Array.isArray(dailyHistory)) return [];
    return dailyHistory.filter(item => {
      const matchesAccountName = !searchFilters.accountName || 
        (item.tiktok_name && item.tiktok_name.toLowerCase().includes(searchFilters.accountName.toLowerCase()));
      const matchesCountry = searchFilters.country === 'all' || item.country === searchFilters.country;
      const matchesMember = searchFilters.member === 'all' || 
        (item.tiktok_account?.user?.id && item.tiktok_account.user.id.toString() === searchFilters.member);
      return matchesAccountName && matchesCountry && matchesMember;
    });
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
    } catch (error) {
      console.error('获取用户列表失败:', error);
      // 如果获取失败，设置为空数组，不影响页面显示
      setUsers([]);
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
        
      const matchesMember = searchFilters.member === 'all' || 
        (item.tiktok_account?.user?.id && item.tiktok_account.user.id.toString() === searchFilters.member);
      
      return matchesAccountName && matchesCountry && 
             matchesAccountStatus && matchesMember;
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
        
      const matchesMember = searchFilters.member === 'all' || 
        (item.tiktok_account?.user?.id && item.tiktok_account.user.id.toString() === searchFilters.member);
      
      return matchesAccountName && matchesCountry && 
             matchesMonth && matchesMember;
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
      render: (name, record) => {
        const memberInfo = record.tiktok_account?.user?.username 
          ? record.tiktok_account.user.username
          : '';
        
        return (
          <Space direction="vertical" size={0}>
            <Text strong>{name || '-'}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.country || '-'}
            </Text>
            {memberInfo && (
              <Text type="secondary" style={{ fontSize: '11px', color: '#999' }}>
                {memberInfo}
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
      dataIndex: 'account_status',
      key: 'account_status',
      width: 100,
      onHeaderCell: () => ({
        style: {
          backgroundColor: '#fff7e6',
          color: '#fa8c16',
          fontWeight: '500'
        }
      }),
      onCell: () => ({
        style: {
          backgroundColor: '#fff7e6'
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
      render: (name, record) => {
        const memberInfo = record.tiktok_account?.user?.username 
          ? record.tiktok_account.user.username
          : '';
        
        return (
          <Space direction="vertical" size={0}>
            <Text strong>{name || '-'}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.country || '-'}
            </Text>
            {memberInfo && (
              <Text type="secondary" style={{ fontSize: '11px', color: '#999' }}>
                {memberInfo}
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

  // 新增：历史日报数据表格列
  const dailyColumns: ColumnsType<DailyHistory> = [
    {
      title: 'TikTok账号',
      dataIndex: 'tiktok_name',
      key: 'tiktok_name',
      width: 150,
      render: (name, record) => {
        const memberInfo = record.tiktok_account?.user?.username 
          ? record.tiktok_account.user.username
          : '';
        return (
          <Space direction="vertical" size={0}>
            <Text strong>{name || '-'}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.country || '-'}
            </Text>
            {memberInfo && (
              <Text type="secondary" style={{ fontSize: '11px', color: '#999' }}>
                {memberInfo}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: '日期',
      dataIndex: 'day_period',
      key: 'day_period',
      width: 110,
      render: (period) => {
        const year = Math.floor(period / 10000);
        const month = Math.floor((period % 10000) / 100);
        const day = period % 100;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      },
    },
    {
      title: '日收入',
      dataIndex: 'day_revenue',
      key: 'day_revenue',
      width: 120,
      render: (value, record) => formatCurrency(value, record.country),
    },
    {
      title: '日订单',
      dataIndex: 'day_orders',
      key: 'day_orders',
      width: 100,
      render: (value) => value || 0,
    },
    {
      title: '日浏览',
      dataIndex: 'day_views',
      key: 'day_views',
      width: 100,
      render: (value) => value || 0,
    },
    {
      title: '日点击',
      dataIndex: 'day_clicks',
      key: 'day_clicks',
      width: 100,
      render: (value) => value || 0,
    },
    {
      title: '更新时间',
      dataIndex: 'crawler_updated_at',
      key: 'crawler_updated_at',
      width: 150,
      render: (time) => (time ? new Date(time).toLocaleString() : '-'),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={3}>
          <DollarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          TikTok运营数据
        </Title>
        
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

          {/* 新增：历史日报数据 */}
          <Tabs.TabPane tab="历史日报数据" key="daily">
            <div style={{ marginBottom: 12 }}>
              <Space size={12}>
                <DatePicker
                  value={dailySelectedDate}
                  onChange={handleDailyDateChange}
                  allowClear={false}
                  format="YYYY-MM-DD"
                  disabledDate={disableDailyDate}
                  style={{ width: 160 }}
                />
                {!dailySelectedDate && (
                  <Text type="secondary">请选择一个历史日期</Text>
                )}
                <Button type="primary" onClick={fetchDailyHistory} disabled={!dailySelectedDate} icon={<CalendarOutlined />}>查询指定日期</Button>
              </Space>
            </div>
            <Table
              columns={dailyColumns}
              dataSource={getFilteredDailyHistory()}
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

export default LeaderBusinessData;