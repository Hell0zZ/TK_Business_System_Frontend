import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Tag, Popconfirm, message, Switch, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/users';
import { getRoles } from '../../services/roles';

const { Option } = Select;
const { Title } = Typography;

interface Role {
  id: number;
  name: string;
  display_name: string;
}

interface User {
  id: number;
  username: string;
  phone?: string;
  role: {
    id: number;
    name: string;
    display_name: string;
  };
  parent?: {
    id: number;
    username: string;
  };
  group_name?: string;
  is_active: boolean;
  created_at: string;
}

interface CreateUserRequest {
  username: string;
  password: string;
  phone?: string;
  role_id: number;
}

interface UpdateUserRequest {
  username?: string;
  password?: string;
  phone?: string;
  is_active?: boolean;
}

const Members: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [memberRoleId, setMemberRoleId] = useState<number | null>(null);

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const users = await getUsers();
      // 只显示组员
      const members = users.filter((user: User) => user.role.name === 'member');
      setUsers(members);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取组员角色ID
  const fetchMemberRoleId = async () => {
    try {
      const roles = await getRoles();
      const memberRole = roles.find(role => role.name === 'member');
      if (memberRole) {
        setMemberRoleId(memberRole.id);
      }
    } catch (error) {
      message.error('获取角色信息失败');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMemberRoleId();
  }, []);

  // 筛选用户
  const getFilteredMembers = () => {
    if (!searchText) return users;
    return users.filter(user => 
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      (user.group_name && user.group_name.toLowerCase().includes(searchText.toLowerCase()))
    );
  };

  // 新增组员
  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    // 默认设置为允许登录
    form.setFieldsValue({ is_active: true });
    setModalVisible(true);
  };

  // 编辑组员
  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      phone: record.phone,
      is_active: record.is_active,
    });
    setModalVisible(true);
  };

  // 删除组员
  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      message.success('删除成功');
      fetchUsers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 提交表单
  const handleSubmit = async (values: CreateUserRequest | UpdateUserRequest) => {
    try {
      if (editingUser) {
        // 编辑用户
        await updateUser(editingUser.id, values);
        message.success('更新成功');
        setModalVisible(false);
        fetchUsers();
      } else {
        // 创建用户 - 组长创建组员，角色和组名由后端自动处理
        if (!memberRoleId) {
          message.error('角色信息未加载，请稍后重试');
          return;
        }
        const createData: CreateUserRequest = {
          ...values as CreateUserRequest,
          role_id: memberRoleId
        };
        await createUser(createData);
        message.success('创建成功');
        setModalVisible(false);
        fetchUsers();
      }
    } catch (error) {
      message.error(editingUser ? '更新失败' : '创建失败');
    }
  };

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '组名',
      dataIndex: 'group_name',
      key: 'group_name',
      render: (group_name) => (
        <Tag color="blue">{group_name || '-'}</Tag>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '-',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
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
      render: (created_at) => new Date(created_at).toLocaleString(),
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
            title="确定要删除这个组员吗？"
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

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>组员管理</Title>
          <Space>
            <Input
              placeholder="搜索用户名或组名"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              新增组员
            </Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={getFilteredMembers()}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 新增/编辑组员模态框 */}
      <Modal
        title={editingUser ? '编辑组员' : '新增组员'}
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
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label={editingUser ? "新密码（留空则不修改）" : "密码"}
            rules={editingUser ? [] : [{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder={editingUser ? "请输入新密码（留空则不修改）" : "请输入密码"} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
          >
            <Input placeholder="请输入手机号（可选）" />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="允许登录"
            valuePropName="checked"
          >
            <Switch checkedChildren="允许" unCheckedChildren="禁止" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Members; 