import request from '../utils/request';

export interface Country {
  id: number;
  name: string;
  code: string;
  enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// 获取国家列表
export const getCountries = async (): Promise<Country[]> => {
  const response = await request.get('/countries');
  return response.data.data || [];
};

// 获取单个国家信息
export const getCountry = async (id: number): Promise<Country> => {
  const response = await request.get(`/countries/${id}`);
  return response.data.data;
};

// 获取国家选项（用于下拉选择）
export const getCountryOptions = async () => {
  const countries = await getCountries();
  return countries.map(country => ({
    label: country.name,
    value: country.name
  }));
}; 