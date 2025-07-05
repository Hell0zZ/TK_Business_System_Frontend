import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Space,
  message,
  Popconfirm,
  Typography,
  Tag,
  Row,
  Col,
  Statistic
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MobileOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface PhoneModel {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreatePhoneModelRequest {
  name: string;
}

interface UpdatePhoneModelRequest {
  name?: string;
  is_active?: boolean;
}

const PhoneModels: React.FC = () => {
  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<PhoneModel | null>(null);
  const [searchText, setSearchText] = useState('');
  
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPhoneModels();
  }, []);

  const fetchPhoneModels = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/phone-models', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setPhoneModels(result.data || []);
      } else {
        message.error('获取手机型号列表失败');
      }
    } catch (error) {
      message.error('获取手机型号列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingModel(null);
    setModalVisible(true);
    form.resetFields();
    form.setFieldsValue({ is_active: true });
  };

  const handleEdit = (record: PhoneModel) => {
    setEditingModel(record);
    setModalVisible(true);
    form.setFieldsValue({
      name: record.name,
      is_active: record.is_active,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/phone-models/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        message.success('删除成功');
        fetchPhoneModels();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: CreatePhoneModelRequest | UpdatePhoneModelRequest) => {
    try {
      const url = editingModel ? `/api/phone-models/${editingModel.id}` : '/api/phone-models';
      const method = editingModel ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success(editingModel ? '更新成功' : '创建成功');
        setModalVisible(false);
        fetchPhoneModels();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || (editingModel ? '更新失败' : '创建失败'));
      }
    } catch (error) {
      message.error(editingModel ? '更新失败' : '创建失败');
    }
  };

  // 筛选数据
  const filteredData = phoneModels.filter(model =>
    model.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<PhoneModel> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '手机型号',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <Space>
          <MobileOutlined />
          <span style={{ fontWeight: 500 }}>{name}</span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (is_active) => (
        <Tag color={is_active ? 'green' : 'red'}>
          {is_active ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (created_at) => new Date(created_at).toLocaleString(),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (updated_at) => new Date(updated_at).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个手机型号吗？"
            description="删除后无法恢复，如果有TikTok账号正在使用此型号将无法删除"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              type="link"
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
  const totalModels = phoneModels.length;
  const activeModels = phoneModels.filter(model => model.is_active).length;
  const inactiveModels = phoneModels.filter(model => !model.is_active).length;

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>手机型号管理</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新增型号
          </Button>
        </div>

        {/* 统计信息 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总型号数"
                value={totalModels}
                prefix={<MobileOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="启用型号"
                value={activeModels}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="禁用型号"
                value={inactiveModels}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="启用率"
                value={totalModels > 0 ? ((activeModels / totalModels) * 100).toFixed(1) : 0}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索手机型号名称"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 新增/编辑手机型号模态框 */}
      <Modal
        title={editingModel ? '编辑手机型号' : '新增手机型号'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="手机型号名称"
            rules={[
              { required: true, message: '请输入手机型号名称' },
              { max: 100, message: '型号名称不能超过100个字符' }
            ]}
          >
            <Input 
              placeholder="请输入手机型号名称，如：iPhone 15 Pro Max" 
              prefix={<MobileOutlined />}
            />
          </Form.Item>

          {editingModel && (
            <Form.Item
              name="is_active"
              label="状态"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="启用" 
                unCheckedChildren="禁用"
                style={{ marginTop: 4 }}
              />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingModel ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 常见型号提示 */}
        {!editingModel && (
          <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid #f0f0f0' }}>
            <Typography.Paragraph strong style={{ marginBottom: 8 }}>
              常见手机型号参考：
            </Typography.Paragraph>
            <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
              iPhone 15 Pro Max、iPhone 15 Pro、iPhone 15 Plus、iPhone 15<br/>
              iPhone 14 Pro Max、iPhone 14 Pro、iPhone 14 Plus、iPhone 14<br/>
              Samsung Galaxy S24 Ultra、Samsung Galaxy S24+、Samsung Galaxy S24<br/>
              华为 Mate 60 Pro、华为 P60 Pro、小米 14 Pro、OPPO Find X7 Pro<br/>
              vivo X100 Pro、一加 12、荣耀 Magic6 Pro
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PhoneModels; 