'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/types/user';
import { getApiUrl } from '@/utils/apiUrl';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'password' | 'profile' | 'security'>('password');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Формы
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileForm, setProfileForm] = useState({
    username: '',
    email: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.replace('/');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    if (parsedUser.token && typeof parsedUser.token === 'string') {
      fetchUserProfile(parsedUser.token as string);
    }
    setProfileForm({
      username: parsedUser.username,
      email: parsedUser.email
    });
    setLoading(false);
  }, [router]);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        // Обновляем данные пользователя, сохраняя токен
        const updatedUser = { ...data.data, token };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Пароли не совпадают');
      setSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Новый пароль должен содержать минимум 6 символов');
      setSaving(false);
      return;
    }

    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      
      const response = await fetch(`${getApiUrl()}/api/users/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess('Пароль успешно изменён');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(data.error || 'Ошибка изменения пароля');
      }
    } catch (error) {
      setError('Ошибка сервера');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const userData = localStorage.getItem('user');
      const token = userData ? (JSON.parse(userData).token as string) : '';
      
      const response = await fetch(`${getApiUrl()}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess('Профиль успешно обновлён');
        // Обновляем данные в localStorage
        const currentUser = JSON.parse(userData);
        currentUser.username = data.data.username;
        currentUser.email = data.data.email;
        currentUser.avatar = data.data.avatar;
        currentUser.banner = data.data.banner;
        currentUser.bio = data.data.bio;
        localStorage.setItem('user', JSON.stringify(currentUser));
        setUser(data.data as any);
      } else {
        setError(data.error || 'Ошибка обновления профиля');
      }
    } catch (error) {
      setError('Ошибка сервера');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return <div className="text-white text-center py-16 text-2xl">Загрузка...</div>;
  }

  if (!user) {
    return <div className="text-white text-center py-16 text-2xl">Пользователь не найден</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Настройки</h1>
          <Link href="/" className="text-purple-300 hover:text-white transition-colors">
            На главную
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Боковая панель */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'password' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-purple-200 hover:bg-purple-600/30'
                  }`}
                >
                  🔒 Смена пароля
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-purple-200 hover:bg-purple-600/30'
                  }`}
                >
                  👤 Профиль
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'security' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-purple-200 hover:bg-purple-600/30'
                  }`}
                >
                  🛡️ Безопасность
                </button>
              </nav>

              {/* Информация о пользователе */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{(user.username || 'U').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold">{user.username}</h3>
                  <p className="text-purple-200 text-sm">{user.email}</p>
                  <span className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-xs mt-2">
                    {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Основной контент */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm">
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Смена пароля</h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-white mb-2">Текущий пароль</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full bg-white/20 border border-white/30 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Новый пароль</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full bg-white/20 border border-white/30 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Подтвердите новый пароль</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full bg-white/20 border border-white/30 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                        required
                      />
                    </div>
                    {error && <div className="text-red-400 text-sm">{error}</div>}
                    {success && <div className="text-green-400 text-sm">{success}</div>}
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Сохранение...' : 'Изменить пароль'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Редактирование профиля</h2>
                  <form onSubmit={handleProfileChange} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-white mb-2">Имя пользователя</label>
                      <input
                        type="text"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full bg-white/20 border border-white/30 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                        required
                        minLength={3}
                        maxLength={30}
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Email</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-white/20 border border-white/30 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                        required
                      />
                    </div>
                    {error && <div className="text-red-400 text-sm">{error}</div>}
                    {success && <div className="text-green-400 text-sm">{success}</div>}
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Безопасность аккаунта</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-lg p-6">
                      <h3 className="text-white font-semibold mb-2">Выход из аккаунта</h3>
                      <p className="text-purple-200 mb-4">
                        Выйдите из аккаунта на всех устройствах. При следующем входе потребуется ввести пароль.
                      </p>
                      <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Выйти из аккаунта
                      </button>
                    </div>

                    <div className="bg-white/5 rounded-lg p-6">
                      <h3 className="text-white font-semibold mb-2">Информация об аккаунте</h3>
                      <div className="space-y-2 text-purple-200">
                        <p><strong>ID:</strong> {user.id}</p>
                        <p><strong>Роль:</strong> {user.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                        <p><strong>Дата регистрации:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-6">
                      <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Важно</h3>
                      <p className="text-yellow-200 text-sm">
                        Никогда не передавайте свои данные для входа третьим лицам. 
                        Администраторы сайта никогда не запрашивают пароли через сообщения.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 