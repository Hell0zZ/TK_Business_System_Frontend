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
  Statistic,
  Tooltip
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CreditCardOutlined, SearchOutlined, BankOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface BankCard {
  id: number;
  card_number: string;
  bank_name: string;
  card_holder: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateBankCardRequest {
  card_number: string;
  bank_name: string;
  card_holder: string;
}

interface UpdateBankCardRequest {
  card_number?: string;
  bank_name?: string;
  card_holder?: string;
  is_active?: boolean;
}



const BankCards: React.FC = () => {
  const [bankCards, setBankCards] = useState<BankCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<BankCard | null>(null);
  const [searchText, setSearchText] = useState('');
  
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBankCards();
  }, []);

  const fetchBankCards = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bank-cards', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setBankCards(result.data || []);
      } else {
        message.error('获取银行卡列表失败');
      }
    } catch (error) {
      message.error('获取银行卡列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCard(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (record: BankCard) => {
    setEditingCard(record);
    setModalVisible(true);
    form.setFieldsValue({
      card_number: record.card_number,
      bank_name: record.bank_name,
      card_holder: record.card_holder,
      is_active: record.is_active,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/bank-cards/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        message.success('删除成功');
        fetchBankCards();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: CreateBankCardRequest | UpdateBankCardRequest) => {
    try {
      const url = editingCard ? `/api/bank-cards/${editingCard.id}` : '/api/bank-cards';
      const method = editingCard ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success(editingCard ? '更新成功' : '创建成功');
        setModalVisible(false);
        fetchBankCards();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || (editingCard ? '更新失败' : '创建失败'));
      }
    } catch (error) {
      message.error(editingCard ? '更新失败' : '创建失败');
    }
  };

  // 格式化银行卡号显示（隐藏中间数字）
  const formatCardNumber = (cardNumber: string) => {
    if (cardNumber.length <= 8) return cardNumber;
    const start = cardNumber.substring(0, 4);
    const end = cardNumber.substring(cardNumber.length - 4);
    const middle = '*'.repeat(cardNumber.length - 8);
    return `${start}${middle}${end}`;
  };

  // 筛选数据
  const filteredData = bankCards.filter(card =>
    card.card_number.includes(searchText) ||
    card.bank_name.toLowerCase().includes(searchText.toLowerCase()) ||
    card.card_holder.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<BankCard> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '银行卡号',
      dataIndex: 'card_number',
      key: 'card_number',
      render: (cardNumber) => (
        <Tooltip title={`完整卡号：${cardNumber}`}>
          <Space>
            <CreditCardOutlined />
            <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
              {formatCardNumber(cardNumber)}
            </span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: '银行名称',
      dataIndex: 'bank_name',
      key: 'bank_name',
      render: (bankName) => (
        <Space>
          <BankOutlined />
          <span>{bankName}</span>
        </Space>
      ),
    },
    {
      title: '持卡人',
      dataIndex: 'card_holder',
      key: 'card_holder',
      render: (cardHolder) => (
        <span style={{ fontWeight: 500 }}>{cardHolder}</span>
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
            title="确定要删除这张银行卡吗？"
            description="删除后无法恢复，如果有TikTok账号正在使用此银行卡将无法删除"
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
  const totalCards = bankCards.length;
  const activeCards = bankCards.filter(card => card.is_active).length;
  const inactiveCards = bankCards.filter(card => !card.is_active).length;

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>银行卡管理</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新增银行卡
          </Button>
        </div>

        {/* 统计信息 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总卡数"
                value={totalCards}
                prefix={<CreditCardOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="启用银行卡"
                value={activeCards}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="禁用银行卡"
                value={inactiveCards}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="启用率"
                value={totalCards > 0 ? ((activeCards / totalCards) * 100).toFixed(1) : 0}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索银行卡号、银行名称或持卡人"
            prefix={<SearchOutlined />}
            style={{ width: 400 }}
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

      {/* 新增/编辑银行卡模态框 */}
      <Modal
        title={editingCard ? '编辑银行卡' : '新增银行卡'}
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
            name="card_number"
            label="银行卡号"
            rules={[
              { required: true, message: '请输入银行卡号' },
              { 
                pattern: /^\d{16,19}$/, 
                message: '银行卡号必须是16-19位数字' 
              }
            ]}
          >
            <Input 
              placeholder="请输入16-19位银行卡号" 
              prefix={<CreditCardOutlined />}
              maxLength={19}
            />
          </Form.Item>

          <Form.Item
            name="bank_name"
            label="银行名称"
            rules={[
              { required: true, message: '请输入银行名称' },
              { max: 50, message: '银行名称不能超过50个字符' }
            ]}
          >
            <Input 
              placeholder="请输入银行名称" 
              prefix={<BankOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="card_holder"
            label="持卡人姓名"
            rules={[
              { required: true, message: '请输入持卡人姓名' },
              { max: 20, message: '持卡人姓名不能超过20个字符' }
            ]}
          >
            <Input 
              placeholder="请输入持卡人姓名" 
            />
          </Form.Item>

          {editingCard && (
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
                {editingCard ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>


      </Modal>
    </div>
  );
};

export default BankCards; 