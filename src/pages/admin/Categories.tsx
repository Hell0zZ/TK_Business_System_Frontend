import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Popconfirm,
  Typography,
  Alert,
  Row,
  Col,
  Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface CreateCategoryRequest {
  name: string;
  description?: string;
}

interface UpdateCategoryRequest {
  name: string;
  description?: string;
}

// 常见产品类目参考
const CATEGORY_SUGGESTIONS = [
  '美妆个护', '女装与女士内衣', '保健', '时尚配件', '运动与户外',
  '手机与数码', '居家日用', '食品饮料', '汽车与摩托车', '男装与男士内衣',
  '收藏品', '玩具和爱好', '厨房用品', '家装建材', '电脑办公',
  '箱包', '鞋靴', '五金工具', '家纺布艺', '家电',
  '宠物用品', '珠宝与衍生品', '图书&杂志&音频', '母婴用品', '家具',
  '儿童时尚', '穆斯林时尚', '二手', '虚拟商品'
];

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // 这里调用实际的API
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      message.error('获取分类列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (record: Category) => {
    setEditingCategory(record);
    setModalVisible(true);
    form.setFieldsValue({
      name: record.name,
      description: record.description || '',
    });
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        message.success('删除成功');
        fetchCategories();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: CreateCategoryRequest | UpdateCategoryRequest) => {
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success(editingCategory ? '更新成功' : '创建成功');
        setModalVisible(false);
        fetchCategories();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || (editingCategory ? '更新失败' : '创建失败'));
      }
    } catch (error) {
      message.error(editingCategory ? '更新失败' : '创建失败');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    form.setFieldsValue({ name: suggestion });
  };

  const columns: ColumnsType<Category> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (description) => description || '-',
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
            title="确定要删除这个分类吗？"
            description="删除后无法恢复，请谨慎操作！"
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
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>分类管理</Title>
          <Space>
            <Button
              icon={<InfoCircleOutlined />}
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              {showSuggestions ? '隐藏' : '显示'}类目参考
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              新增分类
            </Button>
          </Space>
        </div>

        {/* 类目参考提示 */}
        {showSuggestions && (
          <Alert
            message="常见产品类目参考"
            description={
              <div style={{ marginTop: 8 }}>
                <Paragraph>
                  以下是常见的产品分类，您可以点击直接使用：
                </Paragraph>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CATEGORY_SUGGESTIONS.map((suggestion, index) => (
                    <Tag
                      key={index}
                      color="processing"
                      style={{ cursor: 'pointer', marginBottom: 4 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Tag>
                  ))}
                </div>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 新增/编辑分类模态框 */}
      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
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
          <Form.Item
            name="name"
            label="分类名称"
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 50, message: '分类名称不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="分类描述"
            rules={[
              { max: 200, message: '描述不能超过200个字符' }
            ]}
          >
            <TextArea 
              placeholder="请输入分类描述（可选）" 
              rows={3}
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCategory ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 模态框内的快速选择 */}
        <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid #f0f0f0' }}>
          <Paragraph strong>快速选择常见类目：</Paragraph>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORY_SUGGESTIONS.slice(0, 15).map((suggestion, index) => (
              <Tag
                key={index}
                color="processing"
                style={{ cursor: 'pointer', marginBottom: 4 }}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Tag>
            ))}
          </div>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORY_SUGGESTIONS.slice(15).map((suggestion, index) => (
              <Tag
                key={index + 15}
                color="processing"
                style={{ cursor: 'pointer', marginBottom: 4 }}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Tag>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Categories; 