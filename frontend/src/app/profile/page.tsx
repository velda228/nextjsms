'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getApiUrl } from '@/utils/apiUrl';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  created_at: string;
}

interface UserStats {
  favorites_count: number;
  chapters_read: number;
  favorite_genres: Array<{ genre: string; count: number }>;
  last_activity: string | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    avatar: '',
    banner: '',
    bio: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.replace('/');
      return;
    }

    fetchProfile();
    fetchStats();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      
      const response = await fetch(`${getApiUrl()}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
        setForm({
          username: data.data.username,
          email: data.data.email,
          avatar: data.data.avatar || '',
          banner: data.data.banner || '',
          bio: data.data.bio || ''
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      
      const response = await fetch(`${getApiUrl()}/api/users/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      
      const response = await fetch(`${getApiUrl()}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
        setEditing(false);
        // Обновляем данные в localStorage
        if (userData) {
          const currentUser = JSON.parse(userData);
          currentUser.username = data.data.username;
          currentUser.email = data.data.email;
          currentUser.avatar = data.data.avatar;
          currentUser.banner = data.data.banner;
          currentUser.bio = data.data.bio;
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
      } else {
        setError(data.error || 'Ошибка сохранения');
      }
    } catch (error) {
      setError('Ошибка сервера');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return <div className="text-white text-center py-16 text-2xl">Загрузка...</div>;
  }

  if (!user) {
    return <div className="text-white text-center py-16 text-2xl">Пользователь не найден</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Баннер */}
      <div className="relative h-64 bg-gradient-to-r from-purple-600 to-blue-600">
        {user.banner && (
          <img 
            src={user.banner} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Аватар */}
        <div className="absolute bottom-4 left-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Навигация */}
        <div className="absolute top-4 right-4">
          <Link href="/" className="text-white hover:text-purple-200 transition-colors">
            На главную
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{user.username}</h1>
                  <p className="text-purple-200">{user.email}</p>
                  <span className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-sm mt-2">
                    {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </span>
                </div>
                <button
                  onClick={() => setEditing(!editing)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editing ? 'Отмена' : 'Редактировать'}
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Имя пользователя</label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      className="w-full bg-white/20 border border-white/30 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full bg-white/20 border border-white/30 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Ссылка на аватар</label>
                    <input
                      type="url"
                      name="avatar"
                      value={form.avatar}
                      onChange={handleChange}
                      className="w-full bg-white/20 border border-white/30 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Ссылка на баннер</label>
                    <input
                      type="url"
                      name="banner"
                      value={form.banner}
                      onChange={handleChange}
                      className="w-full bg-white/20 border border-white/30 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">О себе</label>
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full bg-white/20 border border-white/30 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 resize-none"
                      placeholder="Расскажите о себе..."
                    />
                  </div>
                  {error && <div className="text-red-400 text-sm">{error}</div>}
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </form>
              ) : (
                <div>
                  {user.bio && (
                    <div className="mb-6">
                      <h3 className="text-white font-semibold mb-2">О себе</h3>
                      <p className="text-purple-200">{user.bio}</p>
                    </div>
                  )}
                  <div className="text-purple-200">
                    <p>Дата регистрации: {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Статистика */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white mb-4">Статистика</h2>
              {stats ? (
                <div className="space-y-4">
                  <div className="bg-purple-600/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{stats.favorites_count}</div>
                    <div className="text-purple-200">В закладках</div>
                  </div>
                  <div className="bg-blue-600/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{stats.chapters_read}</div>
                    <div className="text-blue-200">Прочитано глав</div>
                  </div>
                  {stats.favorite_genres.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-2">Любимые жанры</h3>
                      <div className="space-y-2">
                        {stats.favorite_genres.map((genre, index) => (
                          <div key={index} className="flex justify-between text-purple-200">
                            <span>{genre.genre}</span>
                            <span>{genre.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {stats.last_activity && (
                    <div className="text-sm text-purple-200">
                      Последняя активность: {new Date(stats.last_activity).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-purple-200">Загрузка статистики...</div>
              )}
            </div>

            {/* Быстрые ссылки */}
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm mt-6">
              <h2 className="text-xl font-bold text-white mb-4">Быстрые ссылки</h2>
              <div className="space-y-2">
                <Link href="/favorites" className="block text-purple-200 hover:text-white transition-colors">
                  📚 Мои закладки
                </Link>
                <Link href="/settings" className="block text-purple-200 hover:text-white transition-colors">
                  ⚙️ Настройки
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="block text-purple-200 hover:text-white transition-colors">
                    🛠️ Админ-панель
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 