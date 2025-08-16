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
  Tabs,
  Checkbox,
  Divider,
  Tooltip,
  Avatar,
  Empty,
  Popconfirm
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  SettingOutlined,
  TeamOutlined,
  PhoneOutlined,
  BankOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { TikTokAccount, UpdateTikTokAccountRequest, AccountStatus, AuditStatus, BusinessStatus } from '../../types/tiktokAccount';
import { getGroupAccounts, getMemberAccounts, batchUpdateAccounts, adminEditTikTokAccount, deleteTikTokAccount } from '../../services/tiktokAccounts';
import { getCurrentUser } from '../../utils/auth';
import { getCategories, getPhoneModels, getBankCards, Option as ServiceOption } from '../../services/common';
import { getAvailableProxyIPs } from '../../services/proxyIPs';
import { getCountryOptions } from '../../services/countries';

const { Title, Text } = Typography;
const { Option } = Select;

interface GroupMember {
  id: number;
  username: string;
  phone?: string;
  group_name?: string;
  account_count: number;
  accounts: TikTokAccount[];
}

interface BatchUpdateData {
  account_ids: number[];
  updates: UpdateTikTokAccountRequest;
}

const Accounts: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [groupData, setGroupData] = useState<GroupMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TikTokAccount | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 选项数据状态
  const [categories, setCategories] = useState<ServiceOption[]>([]);
  const [phoneModels, setPhoneModels] = useState<ServiceOption[]>([]);
  const [bankCards, setBankCards] = useState<ServiceOption[]>([]);
  const [proxyIPs, setProxyIPs] = useState<any[]>([]);
  const [countryOptions, setCountryOptions] = useState<{label: string, value: string}[]>([]);

  const [batchForm] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchGroupData();
    fetchOptionsData();
    setCurrentUser(getCurrentUser());
  }, []);

  const fetchGroupData = async () => {
    setLoading(true);
    try {
      const data = await getGroupAccounts();
      setGroupData(Array.isArray(data) ? data : []);
      setSelectedMember(null);
    } catch (error: any) {
      console.error('获取组内账号数据失败:', error);
      message.error(`获取组内账号数据失败: ${error.message || error.toString()}`);
      setGroupData([]);
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

  const handleMemberSelect = async (member: GroupMember) => {
    setSelectedMember(member);
    setSelectedAccounts([]);
    try {
      const accounts = await getMemberAccounts(member.id);
      const updatedMember = { ...member, accounts: Array.isArray(accounts) ? accounts : [] };
      setSelectedMember(updatedMember);
    } catch (error) {
      message.error('获取成员账号失败');
      setSelectedMember({ ...member, accounts: [] });
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
      phone_review: account.phone_review,
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
      fetchGroupData();
    } catch (error) {
      message.error('账号更新失败');
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
      fetchGroupData();
    } catch (error) {
      message.error('批量更新失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTikTokAccount(id);
      message.success('TikTok账号删除成功');
      if (selectedMember) {
        fetchMemberData(selectedMember.id);
      } else {
        fetchGroupData();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 筛选账号
  const getFilteredAccounts = () => {
    // 获取所有账号数据
    let accounts: TikTokAccount[] = [];
    
    try {
      if (selectedMember) {
        // 如果选择了特定组员，只显示该组员的账号
        accounts = Array.isArray(selectedMember.accounts) ? selectedMember.accounts : [];
      } else {
        // 如果没有选择组员，显示所有组员的账号
        accounts = Array.isArray(groupData) ? groupData.reduce((acc, member) => {
          return acc.concat(Array.isArray(member.accounts) ? member.accounts : []);
        }, [] as TikTokAccount[]) : [];
      }
      
      // 按创建时间排序，最新的在前面
      accounts.sort((a, b) => {
        const timeA = new Date(a.created_at || '').getTime();
        const timeB = new Date(b.created_at || '').getTime();
        return timeB - timeA; // 降序排列
      });
      
      // 搜索筛选
      if (searchText) {
        accounts = accounts.filter(account =>
          account.tiktok_name?.toLowerCase().includes(searchText.toLowerCase()) ||
          account.device_number?.toLowerCase().includes(searchText.toLowerCase()) ||
          account.country?.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      
      // 状态筛选
      if (statusFilter !== 'all') {
        accounts = accounts.filter(account => account.account_status === statusFilter);
      }
      
      // 审核状态筛选
      if (auditFilter !== 'all') {
        accounts = accounts.filter(account => account.audit_status === auditFilter);
      }
      
      return accounts;
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
      render: (_, record) => {
        // 如果选择了特定组员，显示该组员的信息
        if (selectedMember) {
          return (
            <Space>
              <UserOutlined />
              <span>{selectedMember.username}</span>
            </Space>
          );
        }
        
        // 从groupData中找到创建这个账号的组员
        const creator = groupData.find(member => 
          member.accounts?.some(acc => acc.id === record.id)
        );
        
        return creator ? (
          <Space>
            <UserOutlined />
            <span>{creator.username}</span>
          </Space>
        ) : '-';
      },
    },
    {
      title: '审核状态',
      dataIndex: 'audit_status',
      key: 'audit_status',
      width: 100,
      render: (status) => getAuditTag(status),
    },
    {
      title: '业务状态',
      dataIndex: 'business_status',
      key: 'business_status',
      width: 100,
      render: (status) => getBusinessStatusTag(status || BusinessStatus.NORMAL),
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
      const allAccounts = Array.isArray(groupData) ? groupData.flatMap(member => 
        Array.isArray(member.accounts) ? member.accounts : []
      ) : [];
      const totalAccounts = allAccounts.length;
      const normalAccounts = allAccounts.filter(acc => acc.account_status === AccountStatus.NORMAL).length;
      const pendingAccounts = allAccounts.filter(acc => acc.audit_status === AuditStatus.PENDING).length;
      const approvedAccounts = allAccounts.filter(acc => acc.audit_status === AuditStatus.APPROVED).length;

      return { totalAccounts, normalAccounts, pendingAccounts, approvedAccounts };
    } catch (error) {
      console.error('统计数据计算出错:', error);
      return { totalAccounts: 0, normalAccounts: 0, pendingAccounts: 0, approvedAccounts: 0 };
    }
  };

  const statistics = getStatistics();
  const filteredAccounts = getFilteredAccounts();

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>组内TikTok账号管理</Title>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchGroupData}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        </div>

        {/* 统计信息 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总账号数"
                value={statistics.totalAccounts}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="正常账号"
                value={statistics.normalAccounts}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待审核"
                value={statistics.pendingAccounts}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="审核通过"
                value={statistics.approvedAccounts}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 组员选择区域 */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={4}>
              <Text strong>筛选组员：</Text>
            </Col>
            <Col span={6}>
              <Select
                placeholder="显示全部组员"
                style={{ width: '100%' }}
                value={selectedMember?.id || 'all'}
                onChange={(value) => {
                  if (value === 'all') {
                    setSelectedMember(null);
                    setSelectedAccounts([]);
                  } else {
                    const member = groupData.find(m => m.id === value);
                    if (member) handleMemberSelect(member);
                  }
                }}
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                options={[
                  {
                    value: 'all',
                    label: '全部组员',
                    key: 'all'
                  },
                  ...groupData.map(member => ({
                    value: member.id,
                    label: `${member.username}${member.phone ? ` (${member.phone})` : ''} - ${member.account_count}个账号`,
                    key: member.id
                  }))
                ]}
              />
            </Col>
            <Col span={14}>
              <Space>
                {selectedMember ? (
                  <>
                    <Text type="secondary">
                      当前筛选：<Text strong>{selectedMember.username}</Text>
                    </Text>
                    <Divider type="vertical" />
                    <Text type="secondary">
                      账号数量：<Text strong style={{ color: '#1890ff' }}>{selectedMember.accounts?.length || 0}</Text>
                    </Text>
                  </>
                ) : (
                  <>
                    <Text type="secondary">
                      显示：<Text strong>全部组员</Text>
                    </Text>
                    <Divider type="vertical" />
                    <Text type="secondary">
                      组员总数：<Text strong>{groupData.length}</Text>
                    </Text>
                    <Divider type="vertical" />
                    <Text type="secondary">
                      账号总数：<Text strong style={{ color: '#1890ff' }}>{statistics.totalAccounts}</Text>
                    </Text>
                  </>
                )}
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

        {/* TikTok账号管理区域 */}
        <Card>
          {/* 筛选区域 */}
          <div style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Input
                  placeholder="搜索TikTok名称、设备号、国家"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col span={4}>
                <Select
                  placeholder="账号状态"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: '100%' }}
                >
                  <Option value="all">全部状态</Option>
                  <Option value={AccountStatus.PENDING}>待检测</Option>
                  <Option value={AccountStatus.NORMAL}>正常</Option>
                  <Option value={AccountStatus.ABNORMAL}>异常</Option>
                  <Option value={AccountStatus.BANNED}>封禁</Option>
                  <Option value={AccountStatus.LIMITED}>限流</Option>
                </Select>
              </Col>
              <Col span={4}>
                <Select
                  placeholder="审核状态"
                  value={auditFilter}
                  onChange={setAuditFilter}
                  style={{ width: '100%' }}
                >
                  <Option value="all">全部审核</Option>
                  <Option value={AuditStatus.PENDING}>待审核</Option>
                  <Option value={AuditStatus.APPROVED}>审核通过</Option>
                  <Option value={AuditStatus.REJECTED}>审核拒绝</Option>
                </Select>
              </Col>
            </Row>
          </div>

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
              <Option value={AuditStatus.APPROVED}>审核通过</Option>
              <Option value={AuditStatus.REJECTED}>审核拒绝</Option>
              <Option value={AuditStatus.PENDING}>待审核</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="audit_comment"
            label="审核备注"
          >
            <Input placeholder="批量设置审核备注" />
          </Form.Item>

          <Form.Item
            label="TikTok Cookie"
            name="tiktok_cookie"
          >
            <Input.TextArea 
              rows={4}
              placeholder="请输入TikTok账号Cookie信息（批量设置时将覆盖所有选中账号的Cookie）"
              maxLength={8000}
              showCount
            />
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
                name="phone_model_id"
                label="手机型号"
              >
                <Select placeholder="请选择手机型号" allowClear>
                  {Array.isArray(phoneModels) && phoneModels.map(model => (
                    <Option key={model.id} value={model.id}>{model.name}</Option>
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
                    <Option key={category.id} value={category.id}>{category.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="bank_card_id"
                label="银行卡"
              >
                <Select placeholder="请选择银行卡" allowClear>
                  {Array.isArray(bankCards) && bankCards.map(card => (
                    <Option key={card.id} value={card.id}>
                      {card.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
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
              {/* 组长和管理员不显示手机点评编辑框，只在表格中查看 */}
              {currentUser?.role?.name === 'member' && (
                <Form.Item
                  name="phone_review"
                  label="手机点评"
                >
                  <Input.TextArea 
                    placeholder="请输入对手机的点评" 
                    rows={3}
                  />
                </Form.Item>
              )}
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="proxy_ip_id"
                label="代理IP"
              >
                <Select placeholder="请选择代理IP" allowClear>
                  {Array.isArray(proxyIPs) && proxyIPs.map(proxy => (
                    <Option key={proxy.id} value={proxy.id}>
                      {proxy.name} ({proxy.host}:{proxy.port})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="audit_status"
                label="审核状态"
              >
                <Select placeholder="请选择审核状态">
                  <Option value={AuditStatus.PENDING}>待审核</Option>
                  <Option value={AuditStatus.APPROVED}>审核通过</Option>
                  <Option value={AuditStatus.REJECTED}>审核拒绝</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="business_status"
                label="业务状态"
              >
                <Select placeholder="请选择业务状态">
                  <Option value={BusinessStatus.NORMAL}>正常</Option>
                  <Option value={BusinessStatus.LIMITED}>受限</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="审核备注"
            name="audit_comment"
          >
            <Input.TextArea placeholder="请输入审核备注" />
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

          <Form.Item
            name="remarks"
            label="备注"
          >
            <Input.TextArea 
              placeholder="请输入备注" 
              rows={3}
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

export default Accounts; 