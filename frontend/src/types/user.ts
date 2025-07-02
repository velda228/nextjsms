export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
  banner?: string | null;
  bio?: string | null;
  created_at: string;
  token?: string;
} 