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
  Popconfirm,
  Tag,
  Typography,
  Row,
  Col,
  InputNumber,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface ProxyIP {
  id: number;
  name: string;
  country: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  proxy_type: string;
  status: string;
  description: string;
  last_test_at?: string;
  test_result: string;
  response_time?: number;
  created_at: string;
  updated_at: string;
}

interface CreateProxyIPRequest {
  name: string;
  country: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  proxy_type: string;
  status: string;
  description?: string;
}

interface UpdateProxyIPRequest {
  name?: string;
  country?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  proxy_type?: string;
  status?: string;
  description?: string;
}

const ProxyIPs: React.FC = () => {
  const [proxyIPs, setProxyIPs] = useState<ProxyIP[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProxy, setEditingProxy] = useState<ProxyIP | null>(null);
  const [testingIds, setTestingIds] = useState<Set<number>>(new Set());
  
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProxyIPs();
  }, []);

  const fetchProxyIPs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/proxy-ips', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProxyIPs(data.data?.list || []);
      }
    } catch (error) {
      message.error('获取代理IP列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProxy(null);
    setModalVisible(true);
    form.resetFields();
    form.setFieldsValue({
      proxy_type: 'http',
      status: 'active'
    });
  };

  const handleEdit = (record: ProxyIP) => {
    setEditingProxy(record);
    setModalVisible(true);
    form.setFieldsValue({
      name: record.name,
      country: record.country,
      host: record.host,
      port: record.port,
      username: record.username,
      password: record.password,
      proxy_type: record.proxy_type,
      status: record.status,
      description: record.description,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/proxy-ips/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        message.success('删除成功');
        fetchProxyIPs();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: CreateProxyIPRequest | UpdateProxyIPRequest) => {
    try {
      const url = editingProxy ? `/api/proxy-ips/${editingProxy.id}` : '/api/proxy-ips';
      const method = editingProxy ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success(editingProxy ? '更新成功' : '创建成功');
        setModalVisible(false);
        fetchProxyIPs();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || (editingProxy ? '更新失败' : '创建失败'));
      }
    } catch (error) {
      message.error(editingProxy ? '更新失败' : '创建失败');
    }
  };

  const handleTest = async (id: number) => {
    setTestingIds(prev => new Set(prev).add(id));
    try {
      const response = await fetch(`/api/proxy-ips/${id}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        message.success('代理测试成功');
        fetchProxyIPs();
      } else {
        message.error('代理测试失败');
      }
    } catch (error) {
      message.error('代理测试失败');
    } finally {
      setTestingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      active: { color: 'green', text: '可用' },
      disabled: { color: 'red', text: '禁用' },
      error: { color: 'orange', text: '异常' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'gray', text: '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTypeTag = (type: string) => {
    const typeColors = {
      http: 'blue',
      https: 'green',
      socks5: 'purple'
    };
    return <Tag color={typeColors[type as keyof typeof typeColors]}>{type.toUpperCase()}</Tag>;
  };

  const columns: ColumnsType<ProxyIP> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '国家',
      dataIndex: 'country',
      key: 'country',
      width: 100,
      render: (country) => <Tag color="blue">{country}</Tag>,
    },
    {
      title: '地址',
      key: 'address',
      width: 200,
      render: (_, record) => `${record.host}:${record.port}`,
    },
    {
      title: '类型',
      dataIndex: 'proxy_type',
      key: 'proxy_type',
      width: 80,
      render: (type) => getTypeTag(type),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => getStatusTag(status),
    },
    {
      title: '认证账号',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      render: (username) => username || '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="测试连通性">
            <Button
              type="text"
              icon={<ThunderboltOutlined />}
              loading={testingIds.has(record.id)}
              onClick={() => handleTest(record.id)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个代理IP吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>代理IP管理</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新增代理IP
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={proxyIPs}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 新增/编辑代理IP模态框 */}
      <Modal
        title={editingProxy ? '编辑代理IP' : '新增代理IP'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="代理名称"
                rules={[{ required: true, message: '请输入代理名称' }]}
              >
                <Input placeholder="请输入代理名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="country"
                label="国家"
                rules={[{ required: true, message: '请选择国家' }]}
              >
                <Select placeholder="请选择国家">
                  <Option value="US">美国</Option>
                  <Option value="UK">英国</Option>
                  <Option value="JP">日本</Option>
                  <Option value="SG">新加坡</Option>
                  <Option value="HK">香港</Option>
                  <Option value="CN">中国</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="host"
                label="主机地址"
                rules={[{ required: true, message: '请输入主机地址' }]}
              >
                <Input placeholder="请输入主机地址或IP" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="port"
                label="端口"
                rules={[{ required: true, message: '请输入端口' }]}
              >
                <InputNumber
                  placeholder="端口"
                  min={1}
                  max={65535}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="认证账号"
              >
                <Input placeholder="请输入认证账号（可选）" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label="认证密码"
              >
                <Input placeholder="请输入认证密码（可选）" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="proxy_type"
                label="代理类型"
                rules={[{ required: true, message: '请选择代理类型' }]}
              >
                <Select placeholder="请选择代理类型">
                  <Option value="http">HTTP</Option>
                  <Option value="https">HTTPS</Option>
                  <Option value="socks5">SOCKS5</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">可用</Option>
                  <Option value="disabled">禁用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="描述备注"
          >
            <TextArea rows={3} placeholder="请输入描述备注（可选）" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingProxy ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProxyIPs; 