import { Request } from 'express';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface Manga {
  id: number;
  title: string;
  title_original?: string;
  description: string;
  cover_image?: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  genres: string[];
  author: string;
  artist?: string;
  year?: number;
  rating: number;
  views: number;
  created_at: Date;
  updated_at: Date;
}

export interface Chapter {
  id: number;
  manga_id: number;
  chapter_number: number;
  title?: string;
  pages: string[];
  views: number;
  created_at: Date;
  updated_at: Date;
}

export interface Favorite {
  id: number;
  user_id: number;
  manga_id: number;
  created_at: Date;
}

export interface ReadingHistory {
  id: number;
  user_id: number;
  manga_id: number;
  chapter_id: number;
  page_number: number;
  read_at: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface MangaFilters extends PaginationParams {
  search?: string;
  status?: string;
  genres?: string[];
  author?: string;
} 