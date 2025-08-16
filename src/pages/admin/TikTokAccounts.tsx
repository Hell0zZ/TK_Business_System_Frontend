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
  Divider,
  Empty,
  Popconfirm
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PhoneOutlined,
  BankOutlined,
  GlobalOutlined,
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { TikTokAccount, UpdateTikTokAccountRequest, AuditStatus, BusinessStatus } from '../../types/tiktokAccount';
import { adminEditTikTokAccount, batchUpdateAccounts, deleteTikTokAccount } from '../../services/tiktokAccounts';
import { getCurrentUser } from '../../utils/auth';
import { getCategories, getPhoneModels, getBankCards, Option as ServiceOption } from '../../services/common';
import { getAvailableProxyIPs } from '../../services/proxyIPs';
import { getCountryOptions } from '../../services/countries';
import request from '../../utils/request';

const { Title, Text } = Typography;
const { Option: SelectOption } = Select;

interface BatchUpdateData {
  account_ids: number[];
  updates: UpdateTikTokAccountRequest;
}

const TikTokAccounts: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<TikTokAccount[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TikTokAccount | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [searchText, setSearchText] = useState<string>('');

  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [creatorFilter, setCreatorFilter] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 选项数据状态
  const [categories, setCategories] = useState<ServiceOption[]>([]);
  const [phoneModels, setPhoneModels] = useState<ServiceOption[]>([]);
  const [bankCards, setBankCards] = useState<ServiceOption[]>([]);
  const [proxyIPs, setProxyIPs] = useState<any[]>([]);
  const [countryOptions, setCountryOptions] = useState<{label: string, value: string}[]>([]);

  const [editForm] = Form.useForm();
  const [batchForm] = Form.useForm();

  useEffect(() => {
    fetchAllAccounts();
    fetchOptionsData();
    setCurrentUser(getCurrentUser());
  }, []);

  const fetchAllAccounts = async () => {
    setLoading(true);
    try {
      const response = await request.get('/tiktok-accounts');
      setAccounts(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error: any) {
      console.error('获取账号数据失败:', error);
      message.error(`获取账号数据失败: ${error.message || error.toString()}`);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取选项数据
  const fetchOptionsData = async () => {
    try {
      const [categoriesData, phoneModelsData, bankCardsData, proxyIPsData, countryOptionsData] = await Promise.all([
        getCategories(),
        getPhoneModels(),
        getBankCards(),
        getAvailableProxyIPs(),
        getCountryOptions()
      ]);
      
      setCategories(categoriesData);
      setPhoneModels(phoneModelsData);
      setBankCards(bankCardsData);
      setProxyIPs(proxyIPsData);
      setCountryOptions(countryOptionsData);
    } catch (error) {
      console.error('获取选项数据失败:', error);
    }
  };

  const handleEdit = (account: TikTokAccount) => {
    setEditingAccount(account);
    setEditModalVisible(true);
    editForm.setFieldsValue({
      phone_model_id: account.phone_model_id,
      node: account.node,
      category_id: account.category_id,
      bank_card_id: account.bank_card_id,
      country: account.country,
      device_number: account.device_number,
      remarks: account.remarks,
      tiktok_name: account.tiktok_name,
      proxy_ip_id: account.proxy_ip_id,
      audit_status: account.audit_status,
      audit_comment: account.audit_comment,
      business_status: account.business_status || BusinessStatus.NORMAL,
      tiktok_cookie: account.business_data?.tiktok_cookie || ''
    });
  };

  const handleEditSubmit = async (values: UpdateTikTokAccountRequest) => {
    if (!editingAccount) return;
    
    try {
      // 处理代理IP字段：undefined转换为null，以支持清空代理IP
      const processedValues = {
        ...values,
        proxy_ip_id: values.proxy_ip_id === undefined ? null : values.proxy_ip_id
      };
      
      await adminEditTikTokAccount(editingAccount.id, processedValues);
      message.success('账号更新成功');
      setEditModalVisible(false);
      fetchAllAccounts();
    } catch (error) {
      message.error('账号更新失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTikTokAccount(id);
      message.success('TikTok账号删除成功');
      fetchAllAccounts();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchUpdate = () => {
    if (selectedAccounts.length === 0) {
      message.warning('请先选择要批量操作的账号');
      return;
    }
    setBatchModalVisible(true);
    batchForm.resetFields();
  };

  const handleBatchSubmit = async (values: UpdateTikTokAccountRequest) => {
    try {
      const data: BatchUpdateData = {
        account_ids: selectedAccounts,
        updates: values
      };
      await batchUpdateAccounts(data);
      message.success(`成功批量更新 ${selectedAccounts.length} 个账号`);
      setBatchModalVisible(false);
      setSelectedAccounts([]);
      fetchAllAccounts();
    } catch (error) {
      message.error('批量更新失败');
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
          account.country?.toLowerCase().includes(searchText.toLowerCase()) ||
          account.user?.username?.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      // 审核状态筛选
      if (auditFilter !== 'all') {
        filteredAccounts = filteredAccounts.filter(account => account.audit_status === auditFilter);
      }

      // 创建者筛选
      if (creatorFilter !== 'all') {
        filteredAccounts = filteredAccounts.filter(account => account.user?.username === creatorFilter);
      }

      return filteredAccounts;
    } catch (error) {
      console.error('筛选账号数据时出错:', error);
      return [];
    }
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

  const getBusinessStatusTag = (status: BusinessStatus) => {
    const statusMap = {
      [BusinessStatus.NORMAL]: { color: 'green', text: '正常' },
      [BusinessStatus.LIMITED]: { color: 'orange', text: '受限' }
    };
    const config = statusMap[status] || { color: 'default', text: status || '正常' };
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
      title: '创建者',
      key: 'creator',
      width: 100,
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <Space direction="vertical" size={0}>
          <span>{record.user?.username || '-'}</span>
          {record.group_name && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.group_name}
            </Text>
          )}
        </Space>
        </Space>
      ),
    },
    {
      title: '手机型号',
      key: 'phone_model',
      width: 120,
      render: (_, record) => record.phone_model?.name ? (
        <Space>
          <PhoneOutlined />
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
      title: '账号状态',
      dataIndex: 'business_status',
      key: 'business_status',
      width: 100,
      render: (status) => getBusinessStatusTag(status || BusinessStatus.NORMAL),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time) => {
        try {
          return time ? new Date(time).toLocaleString() : '-';
        } catch (error) {
          console.error('日期格式化错误:', error);
          return '-';
        }
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个TikTok账号吗？"
            description="删除后可以重新添加相同账号名来恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 统计数据
  const getStatistics = () => {
    try {
      const safeAccounts = Array.isArray(accounts) ? accounts : [];
      const totalAccounts = safeAccounts.length;
      const pendingAccounts = safeAccounts.filter(acc => acc.audit_status === AuditStatus.PENDING).length;
      const approvedAccounts = safeAccounts.filter(acc => acc.audit_status === AuditStatus.APPROVED).length;

      return { totalAccounts, pendingAccounts, approvedAccounts };
    } catch (error) {
      console.error('统计数据计算出错:', error);
      return { totalAccounts: 0, pendingAccounts: 0, approvedAccounts: 0 };
    }
  };

  // 获取所有创建者列表
  const getCreators = () => {
    try {
      const safeAccounts = Array.isArray(accounts) ? accounts : [];
      const creators = Array.from(new Set(safeAccounts.map(acc => acc.user?.username).filter(Boolean)));
      return creators;
    } catch (error) {
      console.error('获取创建者列表时出错:', error);
      return [];
    }
  };

  const statistics = getStatistics();
  const filteredAccounts = getFilteredAccounts();
  const creators = getCreators();

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>TikTok账号管理</Title>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchAllAccounts}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        </div>

        {/* 统计信息 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="总账号数"
                value={statistics.totalAccounts}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="待审核"
                value={statistics.pendingAccounts}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="审核通过"
                value={statistics.approvedAccounts}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 筛选区域 */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={5}>
              <Input
                placeholder="搜索TikTok名称、设备号、国家、创建者"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="审核状态"
                value={auditFilter}
                onChange={setAuditFilter}
                style={{ width: '100%' }}
              >
                <SelectOption value="all">全部审核</SelectOption>
                <SelectOption value={AuditStatus.PENDING}>待审核</SelectOption>
                <SelectOption value={AuditStatus.APPROVED}>审核通过</SelectOption>
                <SelectOption value={AuditStatus.REJECTED}>审核拒绝</SelectOption>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="创建者"
                value={creatorFilter}
                onChange={setCreatorFilter}
                style={{ width: '100%' }}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                <SelectOption value="all">全部创建者</SelectOption>
                {Array.isArray(creators) && creators.map(creator => (
                  <SelectOption key={creator} value={creator}>{creator}</SelectOption>
                ))}
              </Select>
            </Col>
            <Col span={11}>
              <Space>
                <Text type="secondary">
                  显示：<Text strong>{filteredAccounts.length}</Text> / <Text strong>{accounts.length}</Text> 个账号
                </Text>
                {selectedAccounts.length > 0 && (
                  <>
                    <Divider type="vertical" />
                    <Text type="warning">
                      已选择：<Text strong>{selectedAccounts.length}</Text> 个账号
                    </Text>
                    <Button
                      type="primary"
                      size="small"
                      onClick={handleBatchUpdate}
                    >
                      批量审核
                    </Button>
                  </>
                )}
              </Space>
            </Col>
          </Row>
        </Card>

        <Table
          columns={columns}
          dataSource={filteredAccounts}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1800 }}
          rowSelection={{
            selectedRowKeys: selectedAccounts,
            onChange: (selectedRowKeys) => {
              setSelectedAccounts(selectedRowKeys as number[]);
            },
          }}
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

      {/* 批量更新模态框 */}
      <Modal
        title={`批量审核 ${selectedAccounts.length} 个账号`}
        open={batchModalVisible}
        onCancel={() => setBatchModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={batchForm}
          layout="vertical"
          onFinish={handleBatchSubmit}
        >
          <Form.Item
            name="audit_status"
            label="审核状态"
          >
            <Select placeholder="批量设置审核状态" allowClear>
              <SelectOption value={AuditStatus.APPROVED}>审核通过</SelectOption>
              <SelectOption value={AuditStatus.REJECTED}>审核拒绝</SelectOption>
              <SelectOption value={AuditStatus.PENDING}>待审核</SelectOption>
            </Select>
          </Form.Item>

          <Form.Item
            name="audit_comment"
            label="审核备注"
          >
            <Input placeholder="批量设置审核备注" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setBatchModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                批量审核
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
          {/* 基本信息 */}
          <div style={{ marginBottom: 20 }}>
            <Typography.Title level={5} style={{ marginBottom: 12, color: '#1890ff', borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>
              📝 基本信息
            </Typography.Title>
            <Row gutter={[12, 12]}>
              <Col span={8}>
                <Form.Item
                  name="tiktok_name"
                  label="TikTok名称"
                  rules={[{ required: true, message: '请输入TikTok名称' }]}
                >
                  <Input placeholder="请输入TikTok名称" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="node"
                  label="节点"
                >
                  <Input placeholder="请输入节点" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="device_number"
                  label="设备号"
                >
                  <Input placeholder="请输入设备号" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="country"
                  label="国家"
                >
                  <Select 
                    placeholder="请选择国家" 
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={countryOptions}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="business_status"
                  label="账号状态"
                >
                  <Select placeholder="请选择账号状态">
                    <SelectOption value={BusinessStatus.NORMAL}>正常</SelectOption>
                    <SelectOption value={BusinessStatus.LIMITED}>受限</SelectOption>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* 配置信息 */}
          <div style={{ marginBottom: 20 }}>
            <Typography.Title level={5} style={{ marginBottom: 12, color: '#52c41a', borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>
              ⚙️ 配置信息
            </Typography.Title>
            <Row gutter={[12, 12]}>
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
          </div>

          {/* 审核信息 */}
          <div style={{ marginBottom: 20 }}>
            <Typography.Title level={5} style={{ marginBottom: 12, color: '#fa8c16', borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>
              ✅ 审核信息
            </Typography.Title>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Form.Item
                  name="audit_status"
                  label="审核状态"
                >
                  <Select placeholder="请选择审核状态">
                    <SelectOption value={AuditStatus.PENDING}>待审核</SelectOption>
                    <SelectOption value={AuditStatus.APPROVED}>审核通过</SelectOption>
                    <SelectOption value={AuditStatus.REJECTED}>审核拒绝</SelectOption>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="audit_comment"
                  label="审核备注"
                >
                  <Input placeholder="请输入审核备注" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Cookie与备注 */}
          <div style={{ marginBottom: 20 }}>
            <Typography.Title level={5} style={{ marginBottom: 12, color: '#13c2c2', borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>
              📝 其他信息
            </Typography.Title>
            <Row gutter={[12, 12]}>
              <Col span={24}>
                <Form.Item
                  label="TikTok Cookie"
                  name="tiktok_cookie"
                >
                  <Input.TextArea 
                    rows={3}
                    placeholder="请输入TikTok账号Cookie信息（用于获取经营数据）"
                    maxLength={8000}
                    showCount
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="remarks"
                  label="备注"
                >
                  <Input.TextArea 
                    placeholder="请输入备注" 
                    rows={2}
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Form.Item style={{ 
            marginBottom: 0, 
            textAlign: 'right', 
            borderTop: '1px solid #f0f0f0', 
            paddingTop: 16,
            marginTop: 4
          }}>
            <Space>
              <Button 
                onClick={() => setEditModalVisible(false)}
                style={{ minWidth: '80px' }}
              >
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{ minWidth: '100px' }}
              >
                更新账号
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TikTokAccounts; 