import api from './axios';
import { DashboardStats } from '../types';

export const getDashboardStats = () => api.get<DashboardStats>('/dashboard');
