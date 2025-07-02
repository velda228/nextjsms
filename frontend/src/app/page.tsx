'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Manga } from '@/types/manga';
import { getApiUrl } from '@/utils/apiUrl';

export default function Home() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [login, setLogin] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchUserProfile(parsedUser.token);
      fetchFavorites();
    }
    fetchManga();
  }, []);

  const fetchManga = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/manga`);
      const data = await response.json();
      if (data.success) {
        setMangas(data.data.manga || []);
      }
    } catch (error) {
      console.error('Error fetching manga:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      
      const response = await fetch(`${getApiUrl()}/api/users/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setFavorites(data.data.map((manga: any) => manga.id));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

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

  const toggleFavorite = async (mangaId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Войдите в аккаунт, чтобы добавлять мангу в закладки');
      return;
    }

    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      
      if (favorites.includes(mangaId)) {
        // Удаляем из закладок
        const response = await fetch(`${getApiUrl()}/api/users/favorites/${mangaId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          setFavorites(prev => prev.filter(id => id !== mangaId));
        }
      } else {
        // Добавляем в закладки
        const response = await fetch(`${getApiUrl()}/api/users/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ manga_id: mangaId })
        });
        
        if (response.ok) {
          setFavorites(prev => [...prev, mangaId]);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredManga = mangas.filter(manga =>
    manga.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manga.title_original?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        setShowLogin(false);
        setLogin('');
        setPassword('');
      } else {
        setLoginError(data.error || 'Ошибка входа');
      }
    } catch (error) {
      setLoginError('Ошибка сервера');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegisterError('');
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username })
      });
      const data = await response.json();
      if (data.success) {
        setShowRegister(false);
        setEmail('');
        setPassword('');
        setUsername('');
        setShowLogin(true);
      } else {
        setRegisterError(data.error || 'Ошибка регистрации');
      }
    } catch (error) {
      setRegisterError('Ошибка сервера');
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-bold text-white hover:text-purple-300 transition-colors">
              📚 MangaReader
            </Link>
            <div className="flex items-center space-x-4 relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск манги..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 text-white placeholder-white/60 px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-purple-400 w-64"
                />
                <span className="absolute right-3 top-2.5 text-white/60">🔍</span>
              </div>
              {user ? (
                <div className="relative">
                  <button
                    className="text-white flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-700/40 transition-colors"
                    onClick={() => setUserMenuOpen((v) => !v)}
                  >
                    {user.avatar
                      ? <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-purple-400" />
                      : <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">{user.username.charAt(0).toUpperCase()}</span>
                    }
                    <span>{user.username}</span>
                    <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 animate-fade-in">
                      <Link href="/profile" className="block w-full text-left px-4 py-2 hover:bg-purple-100 text-gray-800" onClick={() => setUserMenuOpen(false)}>Профиль</Link>
                      <Link href="/favorites" className="block w-full text-left px-4 py-2 hover:bg-purple-100 text-gray-800" onClick={() => setUserMenuOpen(false)}>Закладки</Link>
                      <Link href="/settings" className="block w-full text-left px-4 py-2 hover:bg-purple-100 text-gray-800" onClick={() => setUserMenuOpen(false)}>Настройки</Link>
                      {user.role === 'admin' && (
                        <button className="block w-full text-left px-4 py-2 hover:bg-purple-100 text-purple-700 font-semibold" onClick={() => { setUserMenuOpen(false); window.location.href = '/admin'; }}>Разработчик</button>
                      )}
                      <button className="block w-full text-left px-4 py-2 hover:bg-purple-100 text-red-600" onClick={() => { setUser(null); localStorage.removeItem('user'); setUserMenuOpen(false); }}>Выйти</button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    onClick={() => setShowLogin(true)}
                  >
                    Вход
                  </button>
                  <button
                    className="bg-white hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-lg border border-purple-600 transition-colors"
                    onClick={() => setShowRegister(true)}
                  >
                    Зарегистрироваться
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowLogin(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Вход</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Email или имя пользователя"
                value={login}
                onChange={e => setLogin(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                required
              />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                required
              />
              {loginError && <div className="text-red-600 text-sm text-center">{loginError}</div>}
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Вход...' : 'Войти'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowRegister(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Регистрация</h2>
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Имя пользователя"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                required
              />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                required
              />
              {registerError && <div className="text-red-600 text-sm text-center">{registerError}</div>}
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                disabled={isRegistering}
              >
                {isRegistering ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold text-white mb-6">
          Добро пожаловать в мир манги
        </h1>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Откройте для себя тысячи увлекательных историй. Читайте мангу онлайн в удобном формате.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
            Начать чтение
          </button>
          <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-900 px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
            Узнать больше
          </button>
        </div>
      </section>

      {/* Manga Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-white mb-8 text-center">
          Популярная манга
        </h2>
        
        {filteredManga.length === 0 ? (
          <div className="text-center text-white/60 text-xl">
            {searchTerm ? 'Манга не найдена' : 'Манга загружается...'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredManga.map((manga) => (
              <Link key={manga.id} href={`/manga/${manga.id}`}>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border border-white/20">
                  <div className="relative h-64 bg-gradient-to-br from-purple-400 to-pink-400">
                    {manga.cover_image ? (
                      <img
                        src={manga.cover_image}
                        alt={manga.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl">
                        📚
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                      {manga.status === 'ongoing' ? '🟢 Онгоинг' : '🔴 Завершена'}
                    </div>
                    {user && (
                      <button
                        onClick={(e) => toggleFavorite(manga.id, e)}
                        className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          favorites.includes(manga.id)
                            ? 'bg-red-600 text-white'
                            : 'bg-black/60 text-white hover:bg-red-600'
                        }`}
                        title={favorites.includes(manga.id) ? 'Удалить из закладок' : 'Добавить в закладки'}
                      >
                        {favorites.includes(manga.id) ? '❤️' : '🤍'}
                      </button>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                      ⭐ {manga.rating}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                      {manga.title}
                    </h3>
                    {manga.title_original && (
                      <p className="text-white/60 text-sm mb-2">
                        {manga.title_original}
                      </p>
                    )}
                    <p className="text-white/80 text-sm mb-3 line-clamp-2">
                      {manga.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {manga.genres.slice(0, 3).map((genre, index) => (
                        <span
                          key={index}
                          className="bg-purple-600/60 text-white text-xs px-2 py-1 rounded"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-white/60 text-sm">
                      <span>👁 {manga.views.toLocaleString()}</span>
                      <span>📅 {manga.year}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">
          Почему выбирают нас?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Адаптивный дизайн</h3>
            <p className="text-white/60">Читайте мангу на любом устройстве с удобным интерфейсом</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Быстрая загрузка</h3>
            <p className="text-white/60">Оптимизированные изображения для быстрого чтения</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Безопасность</h3>
            <p className="text-white/60">Защищенное соединение и безопасное хранение данных</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white/60">
            <p>&copy; 2024 MangaReader. Все права защищены.</p>
            <p className="mt-2">Создано с ❤️ для любителей манги</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
