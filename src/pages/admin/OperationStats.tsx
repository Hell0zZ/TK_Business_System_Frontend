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
  DisconnectOutlined
} from '@ant-design/icons';
import moment from 'moment';
import type { Moment } from 'moment';
// 删除 dayjs 的中文本地化导入
// import 'dayjs/locale/zh-cn';
import zhCN from 'antd/es/locale/zh_CN';
import ReactECharts from 'echarts-for-react';
import { getCountries, Country } from '../../services/countries';
import { getOperationStats, OperationStatsParams, OperationStatsData } from '../../services/admin';

// 设置 moment 为中文
moment.locale('zh-cn');

const { Title, Text } = Typography;
const { Option } = Select;

interface GroupData {
  group_id: number;
  group_name: string;
  revenue: number;
  orders: number;
  members: any[];
  revenue_formatted?: string;
}

const OperationStats: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isToday, setIsToday] = useState<boolean>(true); // 默认选择今日（按日模式）
  const [selectedMonth, setSelectedMonth] = useState<Moment | null>(null); // 默认不选择月份
  const [selectedCountry, setSelectedCountry] = useState<number>(1); // 默认美国ID为1
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [operationData, setOperationData] = useState<OperationStatsData | null>(null);
  // 折叠展开状态管理
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  // 组员排行榜显示模式：true=显示全部，false=只显示TOP10
  const [showAllMembers, setShowAllMembers] = useState<boolean>(false);
  // 新增：按日选择的具体日期，默认今天
  const [selectedDate, setSelectedDate] = useState<Moment>(moment());

  // 切换小组展开状态
  const toggleGroupExpand = (groupId: number) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupId)) {
      newExpandedGroups.delete(groupId);
    } else {
      newExpandedGroups.add(groupId);
    }
    setExpandedGroups(newExpandedGroups);
  };

  // 获取排名图标
  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈'; 
      case 3: return '🥉';
      default: return `${rank}`;
    }
  };

  // 格式化数字显示
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // 30种渐变色池 - 按小组ID固定分配颜色
  const getGroupColors = (groupId: number) => {
    // 备份：原有的卡通化配色
    const originalColorPalette = [
      ['#667eea', '#764ba2'], // 蓝紫色
      ['#f093fb', '#f5576c'], // 粉红色
      ['#4facfe', '#00f2fe'], // 青蓝色
      ['#43e97b', '#38f9d7'], // 绿色
      ['#ffecd2', '#fcb69f'], // 橙色
      ['#a8edea', '#fed6e3'], // 薄荷色
      ['#fbc2eb', '#a6c1ee'], // 淡紫色
      ['#ff9a9e', '#fecfef'], // 粉色
      ['#ffd89b', '#19547b'], // 金蓝色
      ['#a18cd1', '#fbc2eb'], // 紫粉色
    ];
    
    // 新的专业商务配色方案
    const businessColorPalette = [
      ['#1e3a8a', '#3b82f6'], // 深蓝到亮蓝
      ['#374151', '#6b7280'], // 深灰到中灰
      ['#1f2937', '#4b5563'], // 炭黑到深灰
      ['#0f172a', '#334155'], // 深蓝黑到石板灰
      ['#115e59', '#14b8a6'], // 深青到青绿
      ['#581c87', '#8b5cf6'], // 深紫到亮紫
      ['#7c2d12', '#ea580c'], // 深橙到亮橙
      ['#164e63', '#0891b2'], // 深青蓝到天蓝
      ['#365314', '#65a30d'], // 深绿到亮绿
      ['#4c1d95', '#7c3aed'], // 深紫到紫色
      ['#92400e', '#d97706'], // 深金到金色
      ['#155e75', '#0284c7'], // 深天蓝到天蓝
      ['#1e40af', '#3b82f6'], // 蓝色渐变
      ['#6b7280', '#9ca3af'], // 灰色渐变
      ['#111827', '#374151'], // 深灰渐变
      ['#0c4a6e', '#0369a1'], // 深蓝渐变
      ['#713f12', '#a16207'], // 深金渐变
      ['#14532d', '#16a34a'], // 深绿渐变
      ['#7e22ce', '#a855f7'], // 紫色渐变
      ['#9a3412', '#dc2626'], // 深红渐变
      ['#075985', '#0284c7'], // 蓝色系
      ['#4a5568', '#718096'], // 中性灰
      ['#2a4365', '#4299e1'], // 深蓝系
      ['#553c9a', '#9f7aea'], // 深紫系
      ['#744210', '#ed8936'], // 深金系
      ['#276749', '#48bb78'], // 深绿系
      ['#97266d', '#ed64a6'], // 深玫瑰
      ['#1a202c', '#4a5568'], // 深色系
      ['#2d3748', '#718096'], // 中性系
      ['#2c5282', '#4299e1']  // 蓝色系
    ];
    
    // 根据小组ID获取固定颜色，确保颜色一致性
    const colorIndex = (groupId - 1) % businessColorPalette.length;
    return businessColorPalette[colorIndex];
  };

  // 获取国家列表
  const fetchCountries = async () => {
    try {
      const data = await getCountries();
      // 只显示启用的国家，按排序顺序排列；若为空则回退为后端返回的全部国家（已按排序）
      const enabledCountries = data.filter(country => country.enabled)
                                   .sort((a, b) => a.sort_order - b.sort_order);
      const finalCountries = enabledCountries.length > 0 ? enabledCountries : [...data].sort((a, b) => a.sort_order - b.sort_order);
      setAvailableCountries(finalCountries);
      
      // 如果当前选择的国家不在列表中，设置为第一个国家
      if (finalCountries.length > 0 && !finalCountries.find(c => c.id === selectedCountry)) {
        setSelectedCountry(finalCountries[0].id);
      }
    } catch (error) {
      console.error('获取国家列表失败:', error);
      message.error('获取国家列表失败');
      // 确保失败时不会一直转圈
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

      // 在“按日模式”下，总是携带具体日期参数（YYYY-MM-DD）
      if (isToday && selectedDate) {
        params.date = selectedDate.format('YYYY-MM-DD');
      }

      // 如果选择了月份，添加date参数
      if (!isToday && selectedMonth) {
        params.date = selectedMonth.format('YYYYMM');
      }

      const response = await getOperationStats(params);
      // 后端返回的是 {code, message, data} 格式，我们需要 data 字段
      const apiResponse = response.data as any;
      setOperationData(apiResponse.data);
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
  }, [isToday, selectedMonth, selectedCountry, selectedDate]);

  const getTimeTitle = () => {
    const countryText = availableCountries.find(c => c.id === selectedCountry)?.name || '未知国家';
    
    if (isToday) {
      const dateText = selectedDate ? selectedDate.format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
      return `${dateText} 数据 - ${countryText}`;
    } else if (selectedMonth) {
      const monthText = selectedMonth.format('YYYY年MM月');
      return `${monthText}数据 - ${countryText}`;
    } else {
      return `运营数据 - ${countryText}`;
    }
  };

  // 处理今日按钮点击
  const handleTodayClick = () => {
    setIsToday(true);
    setSelectedMonth(null);
  };

  // 处理今日（按日）日期变更：切换为按日模式并设置选中日期
  const handleDayChange = (value: Moment | null, dateString: string) => {
    if (value) {
      setSelectedDate(value);
      setIsToday(true); // 打开按日模式
      setSelectedMonth(null); // 清空月份
    }
  };

  // 修改月份选择的处理函数
  const handleMonthChange = (value: Moment | null) => {
    setSelectedMonth(value);
      setIsToday(false);
  };

  // 获取货币符号
  const getCurrencySymbol = (countryId: number) => {
    const country = availableCountries.find(c => c.id === countryId);
    switch (country?.name) {
      case '美国':
        return '$';
      case '英国':
        return '£';
      case '德国':
      case '法国':
      case '西班牙':
      case '意大利':
      case '爱尔兰':
        return '€';
      case '墨西哥':
        return '$';
      case '泰国':
        return '฿';
      case '印尼':
        return 'Rp';
      case '越南':
        return '₫';
      case '马来':
        return 'RM';
      case '菲律宾':
        return '₱';
      case '新加坡':
        return 'S$';
      case '沙特':
        return '﷼';
      case '日本':
        return '¥';
      case '巴西':
        return 'R$';
      case '韩国':
        return '₩';
      case '土耳其':
        return '₺';
      case '阿联酋':
        return 'AED';
      case '台湾':
        return 'NT$';
      default:
        return '$'; // 默认美元
    }
  };

  // 顶部KPI卡片
  const renderKPICards = () => {
    const summary = operationData?.summary;
    const currencySymbol = getCurrencySymbol(selectedCountry);
    
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
                    总营业额(GMV)
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginBottom: 12 }}>
                  <Text style={{ color: '#fff', fontSize: '48px', fontWeight: '700', marginRight: 8 }}>
                    {currencySymbol}
                  </Text>
                  <Text style={{ color: '#fff', fontSize: '56px', fontWeight: '700', lineHeight: 1 }}>
                    {(summary?.total_revenue || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              value={summary?.total_accounts || 0}
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
              value={summary?.total_orders || 0}
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
              value={summary?.shop_expired_accounts || 0}
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
              value={summary?.violation_accounts || 0}
              prefix={<ExclamationCircleOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}
              suffix={<Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                ({summary?.total_accounts ? ((summary.violation_accounts / summary.total_accounts) * 100).toFixed(1) : 0}%)
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
              value={summary?.login_expired_accounts || 0}
              prefix={<DisconnectOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}
            />
          </Card>
        </div>
      </div>
    );
  };

  // 柱状图版小组GMV排行榜


  // 小组GMV排行榜（ECharts版）
  const renderEChartsTopPerformers = () => {
    const groups = operationData?.groups || [];
    const currencySymbol = getCurrencySymbol(selectedCountry);
    
    // 按GMV从高到低排序
    const sortedGroups = groups
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 15); // 限制显示前15个小组，避免图表过于拥挤

    if (sortedGroups.length === 0) {
      return (
        <Card 
                  title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BarChartOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            <Text strong style={{ fontSize: '16px' }}>小组GMV排行榜</Text>
          </div>
        }
          style={{ borderRadius: 12, marginTop: 24 }}
        >
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8c8c8c' }}>
            暂无小组数据
          </div>
        </Card>
      );
    }

    // 准备ECharts数据
    const xAxisData = sortedGroups.map(group => 
      group.group_name || `组${group.group_id}`
    );
    
    const revenueData = sortedGroups.map(group => group.revenue);
    const orderData = sortedGroups.map(group => group.orders || 0);

    // ECharts配置
    const option = {
      title: {
        text: `小组GMV排行榜 (共${sortedGroups.length}组)`,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1f2937'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params: any) {
          const dataIndex = params[0].dataIndex;
          const group = sortedGroups[dataIndex];
          return `
            <div style="padding: 8px;">
              <strong>${group.group_name || `组${group.group_id}`}</strong><br/>
              <span style="color: #1890ff;">● GMV: ${currencySymbol}${group.revenue.toLocaleString()}</span><br/>
              <span style="color: #52c41a;">● 订单: ${group.orders || 0}</span><br/>
              <span style="color: #8c8c8c;">● 组长: ${group.leader_name || '未分配'}</span><br/>
              <span style="color: #666;">● 成员: ${group.members?.length || 0}人</span>
            </div>
          `;
        }
      },
      legend: {
        data: ['GMV', '订单数'],
        top: 30,
        textStyle: {
          color: '#666'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          rotate: 45,
          textStyle: {
            color: '#666',
            fontSize: 12
          }
        },
        axisLine: {
          lineStyle: {
            color: '#e8e8e8'
          }
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'GMV',
          position: 'left',
          axisLabel: {
            formatter: function(value: number) {
              if (value >= 1000000) {
                return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
              } else if (value >= 1000) {
                return `${currencySymbol}${(value / 1000).toFixed(1)}K`;
              }
              return `${currencySymbol}${value}`;
            },
            textStyle: {
              color: '#666'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#e8e8e8'
            }
          }
        },
        {
          type: 'value',
          name: '订单/成员',
          position: 'right',
          axisLabel: {
            textStyle: {
              color: '#666'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#e8e8e8'
            }
          }
        }
      ],
      series: [
        {
          name: 'GMV',
          type: 'bar',
          yAxisIndex: 0,
          data: revenueData,
          barMaxWidth: 60, // 限制柱子最大宽度为60px
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: '#1890ff' // 顶部颜色
              }, {
                offset: 1, color: '#69c0ff' // 底部颜色
              }]
            },
            borderRadius: [8, 8, 0, 0] // 圆角设置
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        },
        {
          name: '订单数',
          type: 'bar',
          yAxisIndex: 1,
          data: orderData,
          barMaxWidth: 60, // 限制柱子最大宽度为60px
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: '#52c41a'
              }, {
                offset: 1, color: '#95de64'
              }]
            },
            borderRadius: [8, 8, 0, 0]
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };

    return (
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BarChartOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              <Text strong style={{ fontSize: '16px' }}>小组GMV排行榜</Text>
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              共{sortedGroups.length}个小组 • 数据实时更新
            </div>
          </div>
        }
        style={{ borderRadius: 12, marginTop: 24 }}
        bodyStyle={{ padding: '24px' }}
      >
        <ReactECharts
          option={option}
          style={{ height: '400px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
        
        {/* 底部统计信息 */}
        <div style={{
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#fafafa',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center', minWidth: '150px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
              {currencySymbol}{sortedGroups.reduce((sum, group) => sum + group.revenue, 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '13px', color: '#8c8c8c' }}>总GMV</div>
          </div>
          <div style={{ textAlign: 'center', minWidth: '150px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
              {sortedGroups.reduce((sum, group) => sum + (group.orders || 0), 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '13px', color: '#8c8c8c' }}>总订单数</div>
          </div>
          <div style={{ textAlign: 'center', minWidth: '150px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#666' }}>
              前{sortedGroups.length}名
            </div>
            <div style={{ fontSize: '13px', color: '#8c8c8c' }}>展示小组</div>
          </div>
        </div>
      </Card>
    );
  };



  // 小组成员详情（折叠展开版）
  const renderGroupMemberDetails = () => {
    const groups = operationData?.groups || [];
    const currencySymbol = getCurrencySymbol(selectedCountry);
    
    // 按GMV从高到低排序
    const sortedGroups = groups
      .sort((a, b) => b.revenue - a.revenue);

    return (
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TeamOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            <Text strong style={{ fontSize: '16px' }}>小组成员详情</Text>
          </div>
        }
        style={{ 
          borderRadius: 16, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {sortedGroups.map((group, index) => {
            const groupId = group.group_id || index;
            const isExpanded = expandedGroups.has(groupId);
            const members = group.members || [];
            // 按GMV排序成员
            const sortedMembers = members.sort((a, b) => b.revenue - a.revenue);
            
            return (
              <div 
                key={groupId}
                style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* 小组头部 */}
                <div
                  style={{
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => toggleGroupExpand(groupId)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    {/* 排名 */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.8)',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#262626'
                    }}>
                      {index + 1}
                    </div>

                    {/* 小组信息 */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Text strong style={{ fontSize: '16px', color: '#fff' }}>
                          {group.group_name || `小组${groupId}`}
                        </Text>
                        {group.country_name && (
                          <Tag color="blue" style={{ fontSize: '10px', padding: '0 6px', lineHeight: '16px' }}>
                            {group.country_name}
                          </Tag>
                        )}
                      </div>
                      <Text style={{ fontSize: '12px', color: '#fff' }}>
                        组长：{group.leader_name || '未知'} | {group.accounts}个账号 | {members.length}名成员
                      </Text>
                    </div>

                    {/* GMV金额 */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        color: '#fff'
                      }}>
                        {currencySymbol}{group.revenue.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '12px', color: '#fff' }}>
                        {group.orders}笔订单
                      </div>
                    </div>

                    {/* 展开箭头 */}
                    <div style={{ 
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      color: '#fff'
                    }}>
                      ▼
                    </div>
                  </div>
                </div>

                {/* 成员详情（展开时显示） */}
                {isExpanded && (
                  <div style={{ 
                    padding: '16px 20px', 
                    background: '#fafafa',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px' }}>👥</span>
                      <span>小组成员总数</span>
                      <Badge count={members.length} style={{ backgroundColor: '#1890ff' }} />
                    </div>
                    
                    {sortedMembers.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {sortedMembers.map((member, memberIndex) => (
                          <div 
                            key={member.user_id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              background: '#fff',
                              borderRadius: '8px',
                              border: '1px solid #f0f0f0'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                              {/* 成员排名 */}
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #1890ff, #69c0ff)',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                {memberIndex + 1}
                              </div>

                              {/* 成员姓名 */}
                              <Text strong style={{ fontSize: '14px' }}>
                                {member.username}
                              </Text>
                            </div>

                            {/* 成员数据 */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              {/* 账号数 */}
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>账号</div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{member.accounts}</div>
                              </div>

                              {/* 订单数 */}
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>订单</div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{member.orders}</div>
                              </div>

                              {/* 违规数 */}
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>违规</div>
                                <div style={{ 
                                  fontSize: '14px', 
                                  fontWeight: 'bold',
                                  color: member.violations > 0 ? '#ff4d4f' : '#52c41a'
                                }}>
                                  {member.violations}
                                </div>
                              </div>

                              {/* 正常率 */}
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>正常率</div>
                                <div style={{ 
                                  fontSize: '14px', 
                                  fontWeight: 'bold',
                                  color: (() => {
                                    const normalRate = member.accounts > 0 ? 
                                      ((member.accounts - member.violations) / member.accounts * 100) : 
                                      100;
                                    return normalRate >= 90 ? '#52c41a' : 
                                           normalRate >= 70 ? '#faad14' : '#ff4d4f';
                                  })()
                                }}>
                                  {(() => {
                                    const normalRate = member.accounts > 0 ? 
                                      ((member.accounts - member.violations) / member.accounts * 100) : 
                                      100;
                                    return normalRate.toFixed(0);
                                  })()}%
                                </div>
                              </div>

                              {/* GMV */}
                              <div style={{ textAlign: 'right', minWidth: '80px' }}>
                                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>GMV</div>
                                <div style={{ 
                                  fontSize: '14px', 
                                  fontWeight: 'bold',
                                  color: '#1890ff'
                                }}>
                                  {currencySymbol}{member.revenue.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '20px',
                        color: '#8c8c8c',
                        fontSize: '14px'
                      }}>
                        暂无成员数据
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {sortedGroups.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 0',
            color: '#8c8c8c',
            fontSize: '16px'
          }}>
            暂无小组数据
          </div>
        )}
      </Card>
    );
  };

  // 获取所有成员数据（按GMV排序）
  const getAllMembersData = () => {
    if (!operationData?.groups) return [];
    
    const allMembers: Array<{
      user_id: number;
      username: string;
      revenue: number;
      group_id?: number;
      group_name: string;
      leader_name: string;
      accounts: number;
      orders: number;
      violations: number;
      normal_rate: number;
    }> = [];

    // 从所有小组中提取成员数据
    operationData.groups.forEach(group => {
      if (group.members) {
        group.members.forEach(member => {
          allMembers.push({
            ...member,
            group_id: group.group_id,
            group_name: group.group_name || '未知小组',
            leader_name: group.leader_name || '未知组长'
          });
        });
      }
    });

    // 按GMV降序排序
    return allMembers.sort((a, b) => b.revenue - a.revenue);
  };

  // ECharts版本组员GMV排行榜
  const renderEChartsMemberRanking = () => {
    const allMembers = getAllMembersData();
    const currencySymbol = getCurrencySymbol(selectedCountry);
    
    // 根据模式决定显示的成员数量
    const displayMembers = showAllMembers ? allMembers : allMembers.slice(0, 10);
    const displayCount = displayMembers.length;

    if (displayMembers.length === 0) {
      return (
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
              <Text strong>{showAllMembers ? '全部组员GMV排行榜' : '组员GMV TOP 10'}</Text>
            </div>
          }
          style={{ borderRadius: 12, marginTop: 24 }}
        >
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8c8c8c' }}>
            暂无成员数据
          </div>
        </Card>
      );
    }

    // 准备ECharts数据
    const xAxisData = displayMembers.map(member => member.username);
    const revenueData = displayMembers.map(member => member.revenue);

    // ECharts配置
    const option = {
      title: {
        text: showAllMembers ? `全部组员GMV排行榜 (${displayCount}人)` : `组员GMV TOP ${displayCount}`,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1f2937'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params: any) {
          const dataIndex = params[0].dataIndex;
          const member = displayMembers[dataIndex];
          // 动态计算正常率：(账号总数 - 违规账号数) / 账号总数 * 100
          const normalRate = member.accounts > 0 ? 
            ((member.accounts - member.violations) / member.accounts * 100) : 
            100;
          return `
            <div style="padding: 12px; max-width: 280px;">
              <div style="font-weight: bold; margin-bottom: 8px; color: #1f2937;">
                🏆 第${dataIndex + 1}名：${member.username}
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #1890ff;">● GMV: ${currencySymbol}${member.revenue.toLocaleString()}</span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #52c41a;">● 账号: ${member.accounts}个</span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #fa8c16;">● 订单: ${member.orders}</span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #722ed1;">● 小组: ${member.group_name}</span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: #8c8c8c;">● 组长: ${member.leader_name}</span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: ${normalRate >= 90 ? '#52c41a' : normalRate >= 70 ? '#faad14' : '#ff4d4f'};">
                  ● 正常率: ${normalRate.toFixed(1)}%
                </span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="color: ${member.violations > 0 ? '#ff4d4f' : '#52c41a'};">
                  ● 违规: ${member.violations}个
                </span>
              </div>
            </div>
          `;
        }
      },
      legend: {
        data: ['GMV'],
        top: 35,
        textStyle: {
          color: '#666'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          rotate: displayCount > 15 ? 45 : displayCount > 10 ? 30 : 0,
          textStyle: {
            color: '#666',
            fontSize: 11
          }
        },
        axisLine: {
          lineStyle: {
            color: '#e8e8e8'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'GMV',
        axisLabel: {
          formatter: function(value: number) {
            if (value >= 1000000) {
              return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
            } else if (value >= 1000) {
              return `${currencySymbol}${(value / 1000).toFixed(1)}K`;
            }
            return `${currencySymbol}${value}`;
          },
          textStyle: {
            color: '#666',
            fontSize: 11
          }
        },
        axisLine: {
          lineStyle: {
            color: '#e8e8e8'
          }
        }
      },
      series: [
        {
          name: 'GMV',
          type: 'bar',
          data: revenueData,
          barMaxWidth: displayCount <= 5 ? 60 : displayCount <= 10 ? 40 : 30, // 根据数据点数量限制柱状图宽度
          itemStyle: {
            color: function(params: any) {
              // 前三名使用特殊颜色
              if (params.dataIndex === 0) return {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#ffd700' },
                  { offset: 1, color: '#ffb300' }
                ]
              };
              if (params.dataIndex === 1) return {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#c0c0c0' },
                  { offset: 1, color: '#a0a0a0' }
                ]
              };
              if (params.dataIndex === 2) return {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#cd7f32' },
                  { offset: 1, color: '#b8860b' }
                ]
              };
              // 其他使用蓝色渐变
              return {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#1890ff' },
                  { offset: 1, color: '#096dd9' }
                ]
              };
            },
            borderRadius: [6, 6, 0, 0]
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };

    return (
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
              <Text strong style={{ fontSize: '16px' }}>
                {showAllMembers ? '全部组员GMV排行榜' : '组员GMV TOP 10'}
              </Text>
            </div>
            <Button 
              type={showAllMembers ? 'primary' : 'default'}
              icon={showAllMembers ? <EyeOutlined /> : <RiseOutlined />}
              onClick={() => setShowAllMembers(!showAllMembers)}
              size="small"
            >
              {showAllMembers ? `显示TOP10` : `查看全部(${allMembers.length}人)`}
            </Button>
          </div>
        }
        style={{ borderRadius: 12, marginTop: 24 }}
        bodyStyle={{ padding: '24px' }}
      >
        <ReactECharts
          option={option}
          style={{ height: showAllMembers && displayCount > 20 ? '600px' : '450px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
        
        {/* 底部统计信息 */}
        <div style={{
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#fafafa',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center', minWidth: '120px' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
              {currencySymbol}{displayMembers.reduce((sum, member) => sum + member.revenue, 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {showAllMembers ? '全部GMV' : 'TOP10 GMV'}
            </div>
          </div>
          <div style={{ textAlign: 'center', minWidth: '120px' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fa8c16' }}>
              {displayMembers.reduce((sum, member) => sum + member.orders, 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>总订单数</div>
          </div>
          <div style={{ textAlign: 'center', minWidth: '120px' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#722ed1' }}>
              {displayCount}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>展示人数</div>
          </div>
        </div>
      </Card>
    );
  };

  // 违规统计
  const renderViolationStats = () => {
    const summary = operationData?.summary;
    const violationReasons = summary?.violation_reasons || {};
    
    // 转换为数组并排序（排除无违规的）
    const violationStats = Object.entries(violationReasons)
      .filter(([key]) => key !== 'no_violation')
      .map(([key, value]) => ({
        key,
        name: value.name,
        count: value.count,
        percentage: value.percentage
      }))
      .sort((a, b) => b.count - a.count);

    // 准备颜色数组
    const colors = ['#ff4d4f', '#fa8c16', '#faad14', '#52c41a', '#1890ff', '#722ed1'];
    
    // 颜色映射
    const getColorByName = (name: string) => {
      const colorMap: { [key: string]: string } = {
        '其它违规': colors[0],
        '非原创内容': colors[1],
        '关联封号': colors[2],
        '视频与内容不符': colors[3],
        '未经授权使用': colors[4]
      };
      return colorMap[name] || colors[0];
    };

    // 准备饼图数据，过滤掉数量为0的项
    const pieData = violationStats
      .filter(item => item.count > 0)
      .map((item) => ({
        value: item.count,
        name: item.name,
        itemStyle: {
          color: getColorByName(item.name)
        }
      }));

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
            <Text strong>违规分析</Text>
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
                {summary?.violation_accounts || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                违规账号
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                总计 {summary?.total_accounts || 0} 个
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
          运营数据仪表盘
        </Title>

        <Spin spinning={loading} size="large">
          {/* 时间和国家选择器 */}
          <div style={{ marginBottom: '24px' }}>
            <Space size={16}>
              {/* 将“今日数据”按钮替换为可选择日期的控件，默认显示今天的具体日期 */}
              <DatePicker
                value={selectedDate}
                onChange={handleDayChange}
                allowClear={false}
                format="YYYY-MM-DD"
                disabledDate={(current) => current && current > moment().endOf('day')}
                style={{ width: 140 }}
              />
              <DatePicker
                picker="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                allowClear={false}
                disabledDate={(current) => current && current > moment().endOf('month')}
                style={{ width: 120 }}
              />
              <Select 
                value={availableCountries.length > 0 ? selectedCountry : undefined}
                placeholder="请选择国家"
                disabled={availableCountries.length === 0}
                onChange={(value: number) => setSelectedCountry(value)}
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

          {/* 小组GMV排行榜 (ECharts版) */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={24}>
              {renderEChartsTopPerformers()}
            </Col>
          </Row>

          {/* ECharts版本组员GMV排行榜 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={24}>
              {renderEChartsMemberRanking()}
            </Col>
          </Row>

          {/* 小组成员详情 和 违规统计 - 水平布局 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              {/* 小组成员详情 */}
              {renderGroupMemberDetails()}
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

export default OperationStats;