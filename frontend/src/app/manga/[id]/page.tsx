'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Manga, Chapter } from '@/types/manga';
import { getApiUrl } from '@/utils/apiUrl';

export default function MangaPage() {
  const params = useParams();
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchManga();
      fetchChapters();
    }
  }, [params.id]);

  const fetchManga = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/manga/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setManga(data.data);
      }
    } catch (error) {
      console.error('Error fetching manga:', error);
    }
  };

  const fetchChapters = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/manga/${params.id}/chapters`);
      const data = await response.json();
      if (data.success) {
        setChapters(data.data);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Загрузка...</div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Манга не найдена</div>
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
            <Link href="/admin" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
              Админ
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Manga Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cover Image */}
            <div className="lg:w-1/3">
              <div className="relative h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg overflow-hidden">
                {manga.cover_image ? (
                  <img
                    src={manga.cover_image}
                    alt={manga.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                    📚
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-sm">
                  {manga.status === 'ongoing' ? '🟢 Онгоинг' : '🔴 Завершена'}
                </div>
              </div>
            </div>

            {/* Manga Details */}
            <div className="lg:w-2/3">
              <h1 className="text-4xl font-bold text-white mb-2">{manga.title}</h1>
              {manga.title_original && (
                <p className="text-white/60 text-xl mb-4">{manga.title_original}</p>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-purple-600 text-white px-3 py-1 rounded text-sm">
                  ⭐ {manga.rating}
                </span>
                <span className="text-white/60">👁 {manga.views.toLocaleString()}</span>
                {manga.year && (
                  <span className="text-white/60">📅 {manga.year}</span>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-white font-semibold mb-2">Автор:</h3>
                <p className="text-white/80">{manga.author}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-white font-semibold mb-2">Жанры:</h3>
                <div className="flex flex-wrap gap-2">
                  {manga.genres.map((genre: string, index: number) => (
                    <span
                      key={index}
                      className="bg-purple-600/60 text-white px-3 py-1 rounded text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-white font-semibold mb-2">Описание:</h3>
                <p className="text-white/80 leading-relaxed">{manga.description}</p>
              </div>

              <div className="flex gap-4">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  Начать чтение
                </button>
                <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-900 px-6 py-3 rounded-lg font-semibold transition-colors">
                  В избранное
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6">Главы</h2>
          
          {chapters.length === 0 ? (
            <div className="text-center text-white/60 text-xl py-8">
              Главы пока не добавлены
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters.map((chapter) => (
                <Link key={chapter.id} href={`/manga/${manga.id}/chapter/${chapter.id}`}>
                  <div className="bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/10 transition-colors cursor-pointer">
                    <h3 className="text-white font-semibold mb-2">
                      Глава {chapter.chapter_number}
                    </h3>
                    {chapter.title && (
                      <p className="text-white/60 text-sm mb-2">{chapter.title}</p>
                    )}
                    <div className="flex justify-between items-center text-white/60 text-sm">
                      <span>👁 {chapter.views.toLocaleString()}</span>
                      <span>📄 {chapter.pages.length} стр.</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 