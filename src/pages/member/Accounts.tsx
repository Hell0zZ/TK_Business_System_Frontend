import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Typography,
  Tag,
  Row,
  Col,
  Statistic,
  Tooltip,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  PhoneOutlined,
  BankOutlined,
  GlobalOutlined,
  UserOutlined,
  SearchOutlined,
  MobileOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { TikTokAccount, CreateTikTokAccountRequest, UpdateTikTokAccountRequest, AccountStatus, AuditStatus } from '../../types/tiktokAccount';
import { createTikTokAccount, updateTikTokAccount } from '../../services/tiktokAccounts';
import { getCategories, getPhoneModels, getBankCards, Option as ServiceOption } from '../../services/common';
import { getAvailableProxyIPs } from '../../services/proxyIPs';
import { getCountryOptions } from '../../services/countries';
import request from '../../utils/request';

const { Title, Text } = Typography;
const { Option: SelectOption } = Select;

const MemberAccounts: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<TikTokAccount[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TikTokAccount | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [auditFilter, setAuditFilter] = useState<string>('all');


  // 选项数据状态
  const [categories, setCategories] = useState<ServiceOption[]>([]);
  const [phoneModels, setPhoneModels] = useState<ServiceOption[]>([]);
  const [bankCards, setBankCards] = useState<ServiceOption[]>([]);
  const [proxyIPs, setProxyIPs] = useState<any[]>([]);
  const [countryOptions, setCountryOptions] = useState<{label: string, value: string}[]>([]);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchMyAccounts();
    fetchOptionsData();

  }, []);

  // 获取我的账号列表
  const fetchMyAccounts = async () => {
    setLoading(true);
    try {
      const response = await request.get('/tiktok-accounts');
      setAccounts(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error: any) {
      console.error('获取我的账号失败:', error);
      message.error(`获取我的账号失败: ${error.message || error.toString()}`);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取选项数据
  const fetchOptionsData = async () => {
    console.log('开始获取选项数据...');
    
    try {
      console.log('正在获取分类...');
      const categoriesData = await getCategories();
      console.log('分类数据:', categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('获取分类失败:', error);
    }

    try {
      console.log('正在获取手机型号...');
      const phoneModelsData = await getPhoneModels();
      console.log('手机型号数据:', phoneModelsData);
      setPhoneModels(phoneModelsData);
    } catch (error) {
      console.error('获取手机型号失败:', error);
    }

    try {
      console.log('正在获取银行卡...');
      const bankCardsData = await getBankCards();
      console.log('银行卡数据:', bankCardsData);
      setBankCards(bankCardsData);
    } catch (error) {
      console.error('获取银行卡失败:', error);
    }

    try {
      console.log('正在获取代理IP...');
      const proxyIPsData = await getAvailableProxyIPs();
      console.log('代理IP数据:', proxyIPsData);
      setProxyIPs(proxyIPsData);
    } catch (error) {
      console.error('获取代理IP失败:', error);
    }

    try {
      console.log('正在获取国家列表...');
      const countryOptionsData = await getCountryOptions();
      console.log('国家数据:', countryOptionsData);
      setCountryOptions(countryOptionsData);
    } catch (error) {
      console.error('获取国家列表失败:', error);
    }
  };

  // 新增账号
  const handleCreate = () => {
    setCreateModalVisible(true);
    createForm.resetFields();
  };

  // 编辑账号
  const handleEdit = (account: TikTokAccount) => {
    setEditingAccount(account);
    setEditModalVisible(true);
    editForm.setFieldsValue({
      tiktok_name: account.tiktok_name,
      phone_model_id: account.phone_model_id,
      node: account.node,
      category_id: account.category_id,
      bank_card_id: account.bank_card_id,
      country: account.country,
      device_number: account.device_number,
      phone_review: account.phone_review,
      remarks: account.remarks,
      proxy_ip_id: account.proxy_ip_id,
      tiktok_cookie: account.business_data?.tiktok_cookie || ''
    });
  };

  // 提交创建表单
  const handleCreateSubmit = async (values: CreateTikTokAccountRequest) => {
    try {
      await createTikTokAccount(values);
      message.success('账号创建成功');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchMyAccounts();
    } catch (error: any) {
      console.error('账号创建失败:', error);
      const errorMessage = error?.message || '账号创建失败';
      message.error(errorMessage);
    }
  };

  // 提交编辑表单
  const handleEditSubmit = async (values: UpdateTikTokAccountRequest) => {
    if (!editingAccount) return;
    
    try {
      // 处理代理IP字段：undefined转换为null，以支持清空代理IP
      const processedValues = {
        ...values,
        proxy_ip_id: values.proxy_ip_id === undefined ? null : values.proxy_ip_id
      };
      
      await updateTikTokAccount(editingAccount.id, processedValues);
      message.success('账号更新成功');
      setEditModalVisible(false);
      fetchMyAccounts();
    } catch (error: any) {
      console.error('账号更新失败:', error);
      const errorMessage = error?.message || '账号更新失败';
      message.error(errorMessage);
    }
  };

  // 筛选账号
  const getFilteredAccounts = () => {
    try {
      let filteredAccounts = Array.isArray(accounts) ? [...accounts] : [];

      // 按创建时间排序，最新的在前面
      filteredAccounts.sort((a, b) => {
        const timeA = new Date(a.created_at || '').getTime();
        const timeB = new Date(b.created_at || '').getTime();
        return timeB - timeA; // 降序排列
      });

      // 搜索筛选
      if (searchText) {
        filteredAccounts = filteredAccounts.filter(account =>
          account.tiktok_name?.toLowerCase().includes(searchText.toLowerCase()) ||
          account.device_number?.toLowerCase().includes(searchText.toLowerCase()) ||
          account.country?.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      // 状态筛选
      if (statusFilter !== 'all') {
        filteredAccounts = filteredAccounts.filter(account => account.account_status === statusFilter);
      }

      // 审核状态筛选
      if (auditFilter !== 'all') {
        filteredAccounts = filteredAccounts.filter(account => account.audit_status === auditFilter);
      }

      return filteredAccounts;
    } catch (error) {
      console.error('筛选账号数据时出错:', error);
      return [];
    }
  };

  const getStatusTag = (status: AccountStatus) => {
    const statusMap = {
      [AccountStatus.PENDING]: { color: 'default', text: '待检测' },
      [AccountStatus.NORMAL]: { color: 'green', text: '正常' },
      [AccountStatus.ABNORMAL]: { color: 'orange', text: '异常' },
      [AccountStatus.BANNED]: { color: 'red', text: '封禁' },
      [AccountStatus.LIMITED]: { color: 'volcano', text: '限流' }
    };
    const config = statusMap[status] || { color: 'default', text: status || '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getAuditTag = (status: AuditStatus) => {
    const statusMap = {
      [AuditStatus.PENDING]: { color: 'processing', text: '待审核' },
      [AuditStatus.APPROVED]: { color: 'success', text: '审核通过' },
      [AuditStatus.REJECTED]: { color: 'error', text: '审核拒绝' }
    };
    const config = statusMap[status] || { color: 'default', text: status || '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<TikTokAccount> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'TikTok名称',
      dataIndex: 'tiktok_name',
      key: 'tiktok_name',
      width: 150,
      render: (name) => name || '-',
    },
    {
      title: '手机型号',
      key: 'phone_model',
      width: 120,
      render: (_, record) => record.phone_model?.name ? (
        <Space>
          <MobileOutlined />
          <span>{record.phone_model.name}</span>
        </Space>
      ) : '-',
    },
    {
      title: '节点',
      dataIndex: 'node',
      key: 'node',
      width: 100,
      render: (node) => node || '-',
    },
    {
      title: '账号状态',
      dataIndex: 'account_status',
      key: 'account_status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '分类',
      key: 'category',
      width: 120,
      render: (_, record) => record.category?.name || '-',
    },
    {
      title: '银行卡',
      key: 'bank_card',
      width: 140,
      render: (_, record) => {
        try {
          const cardNumber = record.bank_card?.card_number;
          if (cardNumber && typeof cardNumber === 'string' && cardNumber.length >= 8) {
            return (
              <Space>
                <BankOutlined />
                <span>{cardNumber.substring(0, 4)}***{cardNumber.substring(cardNumber.length - 4)}</span>
              </Space>
            );
          }
          return '-';
        } catch (error) {
          console.error('银行卡号格式化错误:', error);
          return '-';
        }
      },
    },
    {
      title: '国家',
      dataIndex: 'country',
      key: 'country',
      width: 100,
      render: (country) => country ? <Tag color="blue">{country}</Tag> : '-',
    },
    {
      title: '代理IP',
      key: 'proxy_ip',
      width: 120,
      render: (_, record) => record.proxy_ip ? (
        <Tooltip title={`${record.proxy_ip.host}:${record.proxy_ip.port}`}>
          <Space>
            <GlobalOutlined />
            <span>{record.proxy_ip.name}</span>
          </Space>
        </Tooltip>
      ) : '-',
    },
    {
      title: '手机点评',
      dataIndex: 'phone_review',
      key: 'phone_review',
      width: 200,
      render: (review) => review ? (
        <Tooltip title={review} placement="topLeft">
          <div style={{ 
            maxWidth: '180px', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {review}
          </div>
        </Tooltip>
      ) : '-',
    },
    {
      title: '审核状态',
      dataIndex: 'audit_status',
      key: 'audit_status',
      width: 100,
      render: (status) => getAuditTag(status),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (created_at) => {
        try {
          return created_at ? new Date(created_at).toLocaleString() : '-';
        } catch (error) {
          console.error('日期格式化错误:', error);
          return '-';
        }
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
      ),
    },
  ];

  const filteredAccounts = getFilteredAccounts();

  // 统计数据
  const getStatistics = () => {
    try {
      const safeAccounts = Array.isArray(accounts) ? accounts : [];
      const total = safeAccounts.length;
      const pending = safeAccounts.filter(account => account.audit_status === AuditStatus.PENDING).length;
      const approved = safeAccounts.filter(account => account.audit_status === AuditStatus.APPROVED).length;
      const rejected = safeAccounts.filter(account => account.audit_status === AuditStatus.REJECTED).length;
      
      return { total, pending, approved, rejected };
    } catch (error) {
      console.error('统计数据计算出错:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  };

  const stats = getStatistics();

  return (
    <div>
      {/* 统计卡片 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="总账号数"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="待审核"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="审核通过"
              value={stats.approved}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="审核拒绝"
              value={stats.rejected}
              valueStyle={{ color: '#f5222d' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 主要内容 */}
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3}>我的TikTok账号</Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              添加账号
            </Button>
          </Col>
        </Row>

        {/* 筛选工具栏 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Input
                placeholder="搜索TikTok名称、设备号、国家..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 120 }}
                placeholder="账号状态"
              >
                <SelectOption value="all">全部状态</SelectOption>
                <SelectOption value={AccountStatus.PENDING}>待检测</SelectOption>
                <SelectOption value={AccountStatus.NORMAL}>正常</SelectOption>
                <SelectOption value={AccountStatus.ABNORMAL}>异常</SelectOption>
                <SelectOption value={AccountStatus.BANNED}>封禁</SelectOption>
                <SelectOption value={AccountStatus.LIMITED}>限流</SelectOption>
              </Select>
            </Col>
            <Col>
              <Select
                value={auditFilter}
                onChange={setAuditFilter}
                style={{ width: 120 }}
                placeholder="审核状态"
              >
                <SelectOption value="all">全部审核</SelectOption>
                <SelectOption value={AuditStatus.PENDING}>待审核</SelectOption>
                <SelectOption value={AuditStatus.APPROVED}>审核通过</SelectOption>
                <SelectOption value={AuditStatus.REJECTED}>审核拒绝</SelectOption>
              </Select>
            </Col>
            <Col>
              <Space>
                <Text type="secondary">
                  显示 {filteredAccounts.length} / {accounts.length} 条记录
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>

        <Table
          columns={columns}
          dataSource={filteredAccounts}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1600 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSize: 20,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无数据"
              />
            ),
          }}
        />
      </Card>

      {/* 创建账号模态框 */}
      <Modal
        title="添加TikTok账号"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tiktok_name"
                label="TikTok名称"
                rules={[{ required: true, message: '请输入TikTok名称' }]}
              >
                <Input placeholder="请输入TikTok名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="country"
                label="国家/地区"
                rules={[{ required: true, message: '请选择国家/地区' }]}
              >
                <Select 
                  placeholder="请选择国家/地区" 
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={countryOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone_model_id"
                label="手机型号"
              >
                <Select placeholder="请选择手机型号" allowClear>
                  {Array.isArray(phoneModels) && phoneModels.map(model => (
                    <SelectOption key={model.id} value={model.id}>{model.name}</SelectOption>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="node"
                label="节点"
              >
                <Input placeholder="请输入节点" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category_id"
                label="品类"
              >
                <Select placeholder="请选择品类" allowClear>
                  {Array.isArray(categories) && categories.map(category => (
                    <SelectOption key={category.id} value={category.id}>{category.name}</SelectOption>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bank_card_id"
                label="银行卡"
              >
                <Select placeholder="请选择银行卡" allowClear>
                  {Array.isArray(bankCards) && bankCards.map(card => (
                    <SelectOption key={card.id} value={card.id}>
                      {card.name}
                    </SelectOption>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="device_number"
                label="设备号"
              >
                <Input placeholder="请输入设备号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="proxy_ip_id"
                label="代理IP"
              >
                <Select placeholder="请选择代理IP" allowClear>
                  {Array.isArray(proxyIPs) && proxyIPs.map(proxy => (
                    <SelectOption key={proxy.id} value={proxy.id}>
                      {proxy.name} ({proxy.host}:{proxy.port})
                    </SelectOption>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phone_review"
            label="手机点评"
          >
            <Input.TextArea 
              placeholder="请输入对手机的点评" 
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="remarks"
            label="备注"
          >
            <Input.TextArea 
              placeholder="请输入备注" 
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="TikTok Cookie"
            name="tiktok_cookie"
          >
            <Input.TextArea 
              rows={4}
              placeholder="请输入TikTok账号Cookie信息（用于获取经营数据）"
              maxLength={8000}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCreateModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建账号
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑账号模态框 */}
      <Modal
        title="编辑TikTok账号"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tiktok_name"
                label="TikTok名称"
              >
                <Input placeholder="请输入TikTok名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="country"
                label="国家/地区"
              >
                <Select 
                  placeholder="请选择国家/地区" 
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={countryOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone_model_id"
                label="手机型号"
              >
                <Select placeholder="请选择手机型号" allowClear>
                  {Array.isArray(phoneModels) && phoneModels.map(model => (
                    <SelectOption key={model.id} value={model.id}>{model.name}</SelectOption>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="node"
                label="节点"
              >
                <Input placeholder="请输入节点" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category_id"
                label="品类"
              >
                <Select placeholder="请选择品类" allowClear>
                  {Array.isArray(categories) && categories.map(category => (
                    <SelectOption key={category.id} value={category.id}>{category.name}</SelectOption>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bank_card_id"
                label="银行卡"
              >
                <Select placeholder="请选择银行卡" allowClear>
                  {Array.isArray(bankCards) && bankCards.map(card => (
                    <SelectOption key={card.id} value={card.id}>
                      {card.name}
                    </SelectOption>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="device_number"
                label="设备号"
              >
                <Input placeholder="请输入设备号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="proxy_ip_id"
                label="代理IP"
              >
                <Select placeholder="请选择代理IP" allowClear>
                  {Array.isArray(proxyIPs) && proxyIPs.map(proxy => (
                    <SelectOption key={proxy.id} value={proxy.id}>
                      {proxy.name} ({proxy.host}:{proxy.port})
                    </SelectOption>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phone_review"
            label="手机点评"
          >
            <Input.TextArea 
              placeholder="请输入对手机的点评" 
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="备注"
            name="remarks"
          >
            <Input.TextArea placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item
            label="TikTok Cookie"
            name="tiktok_cookie"
          >
            <Input.TextArea 
              rows={4}
              placeholder="请输入TikTok账号Cookie信息（用于获取经营数据）"
              maxLength={8000}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                更新
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MemberAccounts; 