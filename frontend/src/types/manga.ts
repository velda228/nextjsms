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

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
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