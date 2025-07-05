import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  message,
  Popconfirm,
  Tag,
  Typography,
  Tabs,
  Row,
  Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { User, Role, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest, UserRole } from '../../types/user';
import { getUsers, createUser, updateUser, deleteUser, changePassword } from '../../services/users';
import { getRoles } from '../../services/roles';
import { getCurrentUser } from '../../utils/auth';

const { Title } = Typography;
const { Option } = Select;

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('admin');
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  
  // 筛选状态
  const [adminFilters, setAdminFilters] = useState({ status: 'all', search: '' });
  const [leaderFilters, setLeaderFilters] = useState({ status: 'all', group: 'all', search: '' });
  const [memberFilters, setMemberFilters] = useState({ status: 'all', group: 'all', leader: 'all', search: '' });
  
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    setCurrentUser(getCurrentUser());
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      message.error('获取角色列表失败');
    }
  };

  // 根据角色筛选用户
  const getUsersByRole = (roleName: string) => {
    return users.filter(user => user.role.name === roleName);
  };

  // 获取筛选后的管理员列表
  const getFilteredAdmins = () => {
    let filteredUsers = getUsersByRole('admin');
    
    if (adminFilters.status !== 'all') {
      filteredUsers = filteredUsers.filter(user => 
        adminFilters.status === 'active' ? user.is_active : !user.is_active
      );
    }
    
    if (adminFilters.search) {
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(adminFilters.search.toLowerCase())
      );
    }
    
    return filteredUsers;
  };

  // 获取筛选后的组长列表
  const getFilteredLeaders = () => {
    let filteredUsers = getUsersByRole('leader');
    
    if (leaderFilters.status !== 'all') {
      filteredUsers = filteredUsers.filter(user => 
        leaderFilters.status === 'active' ? user.is_active : !user.is_active
      );
    }
    
    if (leaderFilters.group !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.group_name === leaderFilters.group);
    }
    
    if (leaderFilters.search) {
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(leaderFilters.search.toLowerCase()) ||
        (user.group_name && user.group_name.toLowerCase().includes(leaderFilters.search.toLowerCase()))
      );
    }
    
    return filteredUsers;
  };

  // 获取筛选后的组员列表
  const getFilteredMembers = () => {
    let filteredUsers = getUsersByRole('member');
    
    if (memberFilters.status !== 'all') {
      filteredUsers = filteredUsers.filter(user => 
        memberFilters.status === 'active' ? user.is_active : !user.is_active
      );
    }
    
    if (memberFilters.group !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.group_name === memberFilters.group);
    }
    
    if (memberFilters.leader !== 'all') {
      filteredUsers = filteredUsers.filter(user => 
        user.parent_id && user.parent_id.toString() === memberFilters.leader
      );
    }
    
    if (memberFilters.search) {
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(memberFilters.search.toLowerCase()) ||
        (user.group_name && user.group_name.toLowerCase().includes(memberFilters.search.toLowerCase()))
      );
    }
    
    return filteredUsers;
  };

  // 获取所有组名
  const getAllGroups = () => {
    const groups = users
      .filter(user => user.group_name)
      .map(user => user.group_name!)
      .filter((group, index, self) => self.indexOf(group) === index);
    return groups;
  };

  // 获取所有组长
  const getAllLeaders = () => {
    return users.filter(user => user.role.name === 'leader');
  };

  const handleCreate = (targetRole?: string) => {
    setEditingUser(null);
    setModalVisible(true);
    form.resetFields();
    setSelectedRoleId(null);
    
    // 根据当前标签页设置默认角色
    if (targetRole) {
      const role = roles.find(r => r.name === targetRole);
      if (role) {
        form.setFieldsValue({ role_id: role.id });
        setSelectedRoleId(role.id);
      }
    }
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    setModalVisible(true);
    setSelectedRoleId(record.role_id);
    form.setFieldsValue({
      username: record.username,
      phone: record.phone || '',
      role_id: record.role_id,
      parent_id: record.parent_id,
      group_name: record.group_name || '',
      is_active: record.is_active,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      message.success('删除成功');
      fetchUsers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: CreateUserRequest | UpdateUserRequest) => {
    try {
      // 前端验证：检查角色相关必填字段
      if (values.role_id) {
        const selectedRole = roles.find(r => r.id === values.role_id);
        
        // 组长角色必须有组名
        if (selectedRole?.name === 'leader' && (!values.group_name || values.group_name.trim() === '')) {
          message.error('创建组长必须填写组名');
          return;
        }
        
        // 组员角色必须选择上级用户
        if (selectedRole?.name === 'member' && !values.parent_id) {
          message.error('创建组员必须选择上级用户');
          return;
        }
      }
      
      // 自动添加空的email字段
      const submitData = { ...values, email: '' };
      
      if (editingUser) {
        await updateUser(editingUser.id, submitData as UpdateUserRequest);
        message.success('更新成功');
      } else {
        await createUser(submitData as CreateUserRequest);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error(editingUser ? '更新失败' : '创建失败');
    }
  };

  const handleChangePassword = () => {
    setPasswordModalVisible(true);
    passwordForm.resetFields();
  };

  const handlePasswordSubmit = async (values: ChangePasswordRequest) => {
    try {
      await changePassword(values);
      message.success('密码修改成功');
      setPasswordModalVisible(false);
    } catch (error) {
      message.error('密码修改失败');
    }
  };

  const getRoleDisplay = (user: User) => {
    const roleColors = {
      admin: 'red',
      leader: 'orange',
      member: 'blue'
    };
    return (
      <Tag color={roleColors[user.role.name as keyof typeof roleColors]}>
        {user.role.display_name}
      </Tag>
    );
  };

  const getParentOptions = () => {
    return users.filter(user => 
      user.role.name === 'admin' || user.role.name === 'leader'
    );
  };

  // 判断是否应该显示上级用户字段
  const shouldShowParentField = () => {
    if (!selectedRoleId) return false;
    const selectedRole = roles.find(r => r.id === selectedRoleId);
    // 只有组员角色才显示上级用户字段
    return selectedRole?.name === 'member';
  };

  // 判断是否应该显示组名字段
  const shouldShowGroupNameField = () => {
    if (editingUser) {
      // 编辑模式下，只有管理员可以修改组名
      return currentUser?.role?.name === 'admin';
    } else {
      // 创建模式下，只有管理员和组长可以设置组名，组员不能设置组名
      if (!selectedRoleId) return false;
      const selectedRole = roles.find(r => r.id === selectedRoleId);
      return selectedRole?.name === 'admin' || selectedRole?.name === 'leader';
    }
  };



  // 管理员表格列
  const adminColumns: ColumnsType<User> = [
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
            disabled={record.id === currentUser?.id}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            disabled={record.id === currentUser?.id}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={record.id === currentUser?.id}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 组长表格列
  const leaderColumns: ColumnsType<User> = [
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
      title: '上级',
      key: 'parent',
      render: (_, record) => record.parent?.username || '-',
    },
    {
      title: '组员数量',
      key: 'member_count',
      render: (_, record) => {
        const memberCount = users.filter(user => user.parent_id === record.id).length;
        return <Tag color="green">{memberCount}人</Tag>;
      },
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
            disabled={record.id === currentUser?.id}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            disabled={record.id === currentUser?.id}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={record.id === currentUser?.id}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 组员表格列
  const memberColumns: ColumnsType<User> = [
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
      title: '所属组长',
      key: 'parent',
      render: (_, record) => (
        <Tag color="purple">{record.parent?.username || '-'}</Tag>
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
            disabled={record.id === currentUser?.id}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            disabled={record.id === currentUser?.id}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={record.id === currentUser?.id}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>用户管理</Title>
          <Space>
            <Button
              icon={<KeyOutlined />}
              onClick={handleChangePassword}
            >
              修改密码
            </Button>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="管理员" key="admin">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Select
                  value={adminFilters.status}
                  onChange={(value) => setAdminFilters(prev => ({ ...prev, status: value }))}
                  style={{ width: 120 }}
                >
                  <Option value="all">全部状态</Option>
                  <Option value="active">启用</Option>
                  <Option value="inactive">禁用</Option>
                </Select>
                <Input
                  placeholder="搜索用户名"
                  prefix={<SearchOutlined />}
                  value={adminFilters.search}
                  onChange={(e) => setAdminFilters(prev => ({ ...prev, search: e.target.value }))}
                  style={{ width: 200 }}
                  allowClear
                />
              </Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleCreate('admin')}
              >
                新增管理员
              </Button>
            </div>
            <Table
              columns={adminColumns}
              dataSource={getFilteredAdmins()}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="组长" key="leader">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Select
                  value={leaderFilters.status}
                  onChange={(value) => setLeaderFilters(prev => ({ ...prev, status: value }))}
                  style={{ width: 120 }}
                >
                  <Option value="all">全部状态</Option>
                  <Option value="active">启用</Option>
                  <Option value="inactive">禁用</Option>
                </Select>
                <Select
                  value={leaderFilters.group}
                  onChange={(value) => setLeaderFilters(prev => ({ ...prev, group: value }))}
                  style={{ width: 150 }}
                  placeholder="筛选组名"
                >
                  <Option value="all">全部组</Option>
                  {getAllGroups().map(group => (
                    <Option key={group} value={group}>{group}</Option>
                  ))}
                </Select>
                <Input
                  placeholder="搜索用户名或组名"
                  prefix={<SearchOutlined />}
                  value={leaderFilters.search}
                  onChange={(e) => setLeaderFilters(prev => ({ ...prev, search: e.target.value }))}
                  style={{ width: 200 }}
                  allowClear
                />
              </Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleCreate('leader')}
              >
                新增组长
              </Button>
            </div>
            <Table
              columns={leaderColumns}
              dataSource={getFilteredLeaders()}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="组员" key="member">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Select
                  value={memberFilters.status}
                  onChange={(value) => setMemberFilters(prev => ({ ...prev, status: value }))}
                  style={{ width: 120 }}
                >
                  <Option value="all">全部状态</Option>
                  <Option value="active">启用</Option>
                  <Option value="inactive">禁用</Option>
                </Select>
                <Select
                  value={memberFilters.group}
                  onChange={(value) => setMemberFilters(prev => ({ ...prev, group: value }))}
                  style={{ width: 150 }}
                  placeholder="筛选组名"
                >
                  <Option value="all">全部组</Option>
                  {getAllGroups().map(group => (
                    <Option key={group} value={group}>{group}</Option>
                  ))}
                </Select>
                <Select
                  value={memberFilters.leader}
                  onChange={(value) => setMemberFilters(prev => ({ ...prev, leader: value }))}
                  style={{ width: 150 }}
                  placeholder="筛选组长"
                >
                  <Option value="all">全部组长</Option>
                  {getAllLeaders().map(leader => (
                    <Option key={leader.id} value={leader.id.toString()}>{leader.username}</Option>
                  ))}
                </Select>
                <Input
                  placeholder="搜索用户名或组名"
                  prefix={<SearchOutlined />}
                  value={memberFilters.search}
                  onChange={(e) => setMemberFilters(prev => ({ ...prev, search: e.target.value }))}
                  style={{ width: 200 }}
                  allowClear
                />
              </Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleCreate('member')}
              >
                新增组员
              </Button>
            </div>
            <Table
              columns={memberColumns}
              dataSource={getFilteredMembers()}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* 新增/编辑用户模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
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
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="手机号"
              >
                <Input placeholder="请输入手机号（可选）" />
              </Form.Item>
            </Col>
          </Row>



          <Form.Item
            name="password"
            label={editingUser ? "新密码（留空则不修改）" : "密码"}
            rules={editingUser ? [] : [{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder={editingUser ? "请输入新密码（留空则不修改）" : "请输入密码"} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role_id"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select 
                  placeholder="请选择角色"
                  onChange={(value) => {
                    setSelectedRoleId(value);
                    // 当角色改变时，清空上级用户字段
                    form.setFieldsValue({ parent_id: undefined });
                    // 重新验证组名字段和上级用户字段
                    form.validateFields(['group_name', 'parent_id']).catch(() => {
                      // 忽略验证错误，只是触发重新验证
                    });
                  }}
                >
                  {roles.map(role => (
                    <Option key={role.id} value={role.id}>
                      {role.display_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            {shouldShowParentField() && (
              <Col span={12}>
                <Form.Item
                  name="parent_id"
                  label="上级用户"
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const roleId = getFieldValue('role_id');
                        const selectedRole = roles.find(r => r.id === roleId);
                        
                        // 如果选择的是组员角色，上级用户必填
                        if (selectedRole?.name === 'member') {
                          if (!value) {
                            return Promise.reject(new Error('组员角色必须选择上级用户'));
                          }
                        }
                        
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Select placeholder="请选择上级用户（组员必填）" allowClear>
                    {getParentOptions().map(user => (
                      <Option key={user.id} value={user.id}>
                        {user.username} ({user.role.display_name})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          {shouldShowGroupNameField() && (
            <Form.Item
              name="group_name"
              label="组名"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const roleId = getFieldValue('role_id');
                    const selectedRole = roles.find(r => r.id === roleId);
                    
                    // 如果选择的是组长角色，组名必填
                    if (selectedRole?.name === 'leader') {
                      if (!value || value.trim() === '') {
                        return Promise.reject(new Error('组长角色必须填写组名'));
                      }
                    }
                    
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input placeholder="请输入组名（组长必填，组员可选）" />
            </Form.Item>
          )}

          {editingUser && (
            <Form.Item
              name="is_active"
              label="状态"
              valuePropName="checked"
            >
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          )}

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

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordSubmit}
        >
          <Form.Item
            name="old_password"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>

          <Form.Item
            name="new_password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="确认密码"
            dependencies={['new_password']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setPasswordModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                修改密码
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users; 