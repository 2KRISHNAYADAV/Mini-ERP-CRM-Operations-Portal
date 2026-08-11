import api from './axios';
import { Challan } from '../types';

export const getChallans = () => api.get<Challan[]>('/challans');
export const getChallanById = (id: number) => api.get(`/challans/${id}`);
export const createChallan = (data: {
  customer_id: number;
  products: { product_id: number; quantity: number }[];
  status: 'Draft' | 'Confirmed';
}) => api.post<Challan>('/challans', data);
export const cancelChallan = (id: number) => api.patch(`/challans/${id}/cancel`);
export const confirmChallan = (id: number) => api.patch(`/challans/${id}/confirm`);

/**
 * Download a Sales Challan as a PDF file.
 * Uses responseType:'blob' to receive binary data, then triggers a browser save dialog.
 */
export const downloadChallanPdf = async (id: number, challanNumber: string): Promise<void> => {
  const response = await api.get(`/challans/${id}/pdf`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `challan-${challanNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
