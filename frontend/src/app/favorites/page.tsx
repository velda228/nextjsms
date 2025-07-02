'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Manga } from '@/types/manga';
import { getApiUrl } from '@/utils/apiUrl';

interface FavoriteManga extends Manga {
  added_at: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteManga[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.replace('/');
      return;
    }
    setUser(JSON.parse(userData));
    fetchFavorites();
  }, [router]);

  const fetchFavorites = async () => {
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      
      const response = await fetch(`${getApiUrl()}/api/users/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setFavorites(data.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки закладок:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (mangaId: number) => {
    if (!confirm('Удалить мангу из закладок?')) return;

    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      
      const response = await fetch(`${getApiUrl()}/api/users/favorites/${mangaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setFavorites(prev => prev.filter(manga => manga.id !== mangaId));
      } else {
        alert(data.error || 'Ошибка удаления');
      }
    } catch (error) {
      alert('Ошибка сервера');
    }
  };

  if (loading) {
    return <div className="text-white text-center py-16 text-2xl">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Мои закладки</h1>
          <Link href="/" className="text-purple-300 hover:text-white transition-colors">
            На главную
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl text-white mb-4">Закладки пусты</h2>
            <p className="text-purple-200 mb-6">Добавляйте мангу в закладки, чтобы быстро находить её позже</p>
            <Link 
              href="/" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Найти мангу
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((manga) => (
              <div key={manga.id} className="bg-white/10 rounded-xl overflow-hidden backdrop-blur-sm hover:bg-white/15 transition-all duration-300 group">
                {/* Обложка */}
                <div className="relative h-64 bg-gradient-to-br from-purple-600 to-blue-600">
                  {manga.cover_image ? (
                    <img 
                      src={manga.cover_image} 
                      alt={manga.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-4xl">
                      📖
                    </div>
                  )}
                  
                  {/* Кнопка удаления */}
                  <button
                    onClick={() => removeFromFavorites(manga.id)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Удалить из закладок"
                  >
                    ×
                  </button>
                  
                  {/* Статус */}
                  <div className="absolute bottom-2 left-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      manga.status === 'ongoing' ? 'bg-green-600 text-white' :
                      manga.status === 'completed' ? 'bg-blue-600 text-white' :
                      'bg-yellow-600 text-white'
                    }`}>
                      {manga.status === 'ongoing' ? 'Онгоинг' : 
                       manga.status === 'completed' ? 'Завершена' : 'Хиатус'}
                    </span>
                  </div>
                </div>

                {/* Информация */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                    {manga.title}
                  </h3>
                  
                  {manga.title_original && (
                    <p className="text-purple-200 text-sm mb-2 line-clamp-1">
                      {manga.title_original}
                    </p>
                  )}
                  
                  <p className="text-purple-200 text-sm mb-3">
                    Автор: {manga.author}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-white text-sm">{manga.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="text-purple-200 text-sm">
                      👁️ {manga.views?.toLocaleString() || '0'}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {manga.genres.slice(0, 3).map((genre, index) => (
                      <span 
                        key={index}
                        className="bg-purple-600/50 text-purple-200 px-2 py-1 rounded text-xs"
                      >
                        {genre}
                      </span>
                    ))}
                    {manga.genres.length > 3 && (
                      <span className="text-purple-200 text-xs">+{manga.genres.length - 3}</span>
                    )}
                  </div>
                  
                  <div className="text-purple-200 text-xs">
                    Добавлено: {new Date(manga.added_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 