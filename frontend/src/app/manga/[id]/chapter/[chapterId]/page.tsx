'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getApiUrl } from '@/utils/apiUrl';

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const { id, chapterId } = params;
  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [manga, setManga] = useState<any>(null);

  useEffect(() => {
    // Получаем пользователя из localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetch(`${getApiUrl()}/api/manga/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setManga(data.data);
        });
    }
  }, [id]);

  useEffect(() => {
    if (id && chapterId) {
      fetch(`${getApiUrl()}/api/chapters/${chapterId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setChapter(data.data);
          } else {
            setError(data.error || 'Глава не найдена');
          }
        })
        .catch(() => setError('Ошибка загрузки главы'))
        .finally(() => setLoading(false));
    }
  }, [id, chapterId]);

  if (loading) return <div className="text-white text-2xl p-8">Загрузка...</div>;
  if (error) return <div className="text-red-500 text-2xl p-8">{error}</div>;
  if (!chapter) return <div className="text-white text-2xl p-8">Глава не найдена</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Логотип */}
          <Link href="/" className="text-2xl font-bold text-white hover:text-purple-300 transition-colors flex items-center gap-2">
            📚 <span>MangaReader</span>
          </Link>
          {/* Ссылка на мангу и глава */}
          <div className="flex flex-col items-center">
            {manga && (
              <Link href={`/manga/${manga.id}`} className="text-white/80 hover:text-white text-lg font-semibold truncate max-w-xs text-center">
                {manga.title}
              </Link>
            )}
            <span className="text-white text-base font-bold">
              Глава {chapter.chapter_number}{chapter.title ? `: ${chapter.title}` : ''}
            </span>
          </div>
          {/* Аккаунт пользователя */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/profile" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white overflow-hidden flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-lg font-bold">{user.username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-white/80 group-hover:text-white text-sm font-semibold truncate max-w-[100px]">{user.username}</span>
              </Link>
            ) : (
              <Link href="/profile" className="text-white/80 hover:text-white text-sm">Войти</Link>
            )}
          </div>
        </div>
      </header>

      {/* Контент главы */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 items-center">
          {chapter.pages && chapter.pages.length > 0 ? (
            chapter.pages.map((url: string, idx: number) => (
              <img key={idx} src={url} alt={`Страница ${idx + 1}`} className="rounded shadow max-w-full" />
            ))
          ) : (
            <div className="text-white/80 text-xl">Нет страниц для этой главы</div>
          )}
        </div>
      </div>
    </div>
  );
} 