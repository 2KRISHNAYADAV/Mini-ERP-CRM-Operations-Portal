import api from './axios';
import { Product } from '../types';

export const getProducts = () => api.get<Product[]>('/products');
export const getProductById = (id: number) => api.get<Product>(`/products/${id}`);
export const createProduct = (data: Partial<Product>) => api.post<Product>('/products', data);
export const updateProduct = (id: number, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data);
export const deleteProduct = (id: number) => api.delete(`/products/${id}`);
