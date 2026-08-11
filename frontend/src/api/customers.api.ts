import api from './axios';
import { Customer } from '../types';

export const getCustomers = () => api.get<Customer[]>('/customers');
export const getCustomerById = (id: number) => api.get<Customer>(`/customers/${id}`);
export const createCustomer = (data: Partial<Customer>) => api.post<Customer>('/customers', data);
export const updateCustomer = (id: number, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data);
export const deleteCustomer = (id: number) => api.delete(`/customers/${id}`);
