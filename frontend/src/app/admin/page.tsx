'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Manga } from '@/types/manga';
import Link from 'next/link';
import { getApiUrl } from '@/utils/apiUrl';

const emptyManga: Partial<Manga> = {
  title: '',
  description: '',
  author: '',
  artist: '',
  status: 'ongoing',
  genres: [],
  year: undefined,
  rating: 0,
  views: 0,
  cover_image: '',
};

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // Табы
  const [tab, setTab] = useState<'manga' | 'chapters' | 'users' | 'history'>('manga');

  // Манга
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<Partial<Manga>>(emptyManga);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Главы
  const [chapters, setChapters] = useState<any[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [selectedManga, setSelectedManga] = useState<Manga | null>(null);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [chapterModalType, setChapterModalType] = useState<'single' | 'bulk'>('single');
  const [chapterForm, setChapterForm] = useState({
    chapter_number: '',
    title: '',
    pages: [] as string[]
  });
  const [bulkForm, setBulkForm] = useState({
    start_chapter: '',
    end_chapter: '',
    title_prefix: '',
    pages_template: [] as string[]
  });
  const [showPagesModal, setShowPagesModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [pagesForm, setPagesForm] = useState<string[]>([]);

  // Пользователи
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // История изменений
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Проверка авторизации и роли
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      if (parsed.role !== 'admin') {
        router.replace('/');
      }
    } else {
      router.replace('/');
    }
    setAuthChecked(true);
  }, [router]);

  // Загрузка манги
  useEffect(() => {
    if (tab === 'manga') fetchManga();
  }, [tab]);

  // Загрузка пользователей
  useEffect(() => {
    if (tab === 'users') fetchUsers();
    // eslint-disable-next-line
  }, [tab]);

  // Загрузка истории
  useEffect(() => {
    if (tab === 'history') fetchHistory();
    // eslint-disable-next-line
  }, [tab]);

  // Загрузка глав
  useEffect(() => {
    if (tab === 'chapters') fetchManga();
    // eslint-disable-next-line
  }, [tab]);

  const fetchManga = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/manga`);
      const data = await response.json();
      if (data.success) {
        setMangas(data.data.manga || []);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Ошибка загрузки манги:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      const response = await fetch(`${getApiUrl()}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Ошибка загрузки пользователей:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      const response = await fetch(`${getApiUrl()}/api/manga/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.data || []);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Ошибка загрузки истории:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchChapters = async (mangaId: number) => {
    setChaptersLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/manga/${mangaId}/chapters`);
      const data = await response.json();
      if (data.success) {
        setChapters(data.data || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки глав:', error);
    } finally {
      setChaptersLoading(false);
    }
  };

  const selectManga = (manga: Manga) => {
    setSelectedManga(manga);
    fetchChapters(manga.id);
  };

  const openAddModal = () => {
    setForm(emptyManga);
    setModalType('add');
    setShowModal(true);
    setEditId(null);
    setError('');
  };

  const openEditModal = (manga: Manga) => {
    setForm({ ...manga });
    setModalType('edit');
    setShowModal(true);
    setEditId(manga.id);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyManga);
    setEditId(null);
    setError('');
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenresChange = (e: any) => {
    setForm((prev) => ({ ...prev, genres: e.target.value.split(',').map((g: string) => g.trim()) }));
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      const body = {
        ...form,
        genres: Array.isArray(form.genres) ? form.genres : [],
        year: form.year ? Number(form.year) : undefined,
        rating: form.rating ? Number(form.rating) : 0,
        views: form.views ? Number(form.views) : 0,
      };
      let response;
      if (modalType === 'add') {
        response = await fetch(`${getApiUrl()}/api/manga`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body),
        });
      } else if (modalType === 'edit' && editId) {
        response = await fetch(`${getApiUrl()}/api/manga/${editId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body),
        });
      }
      if (!response) return;
      const data = await response.json();
      if (data.success) {
        closeModal();
        fetchManga();
      } else {
        setError(data.error || 'Ошибка сохранения');
      }
    } catch (err) {
      setError('Ошибка сервера');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить мангу?')) return;
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      const response = await fetch(`${getApiUrl()}/api/manga/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchManga();
      } else {
        alert(data.error || 'Ошибка удаления');
      }
    } catch (err) {
      alert('Ошибка сервера');
    }
  };

  const openChapterModal = (type: 'single' | 'bulk') => {
    setChapterModalType(type);
    setShowChapterModal(true);
    setChapterForm({ chapter_number: '', title: '', pages: [] });
    setBulkForm({ start_chapter: '', end_chapter: '', title_prefix: '', pages_template: [] });
  };

  const closeChapterModal = () => {
    setShowChapterModal(false);
    setChapterForm({ chapter_number: '', title: '', pages: [] });
    setBulkForm({ start_chapter: '', end_chapter: '', title_prefix: '', pages_template: [] });
  };

  const openPagesModal = (chapter: any) => {
    setSelectedChapter(chapter);
    setPagesForm(chapter.pages || []);
    setShowPagesModal(true);
  };

  const closePagesModal = () => {
    setShowPagesModal(false);
    setSelectedChapter(null);
    setPagesForm([]);
  };

  const handleChapterChange = (e: any) => {
    const { name, value } = e.target;
    setChapterForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBulkChange = (e: any) => {
    const { name, value } = e.target;
    setBulkForm(prev => ({ ...prev, [name]: value }));
  };

  const addPageUrl = () => {
    setChapterForm(prev => ({ ...prev, pages: [...prev.pages, ''] }));
  };

  const removePageUrl = (index: number) => {
    setChapterForm(prev => ({ ...prev, pages: prev.pages.filter((_, i) => i !== index) }));
  };

  const updatePageUrl = (index: number, value: string) => {
    setChapterForm(prev => ({
      ...prev,
      pages: prev.pages.map((page, i) => i === index ? value : page)
    }));
  };

  const addBulkPageUrl = () => {
    setBulkForm(prev => ({ ...prev, pages_template: [...prev.pages_template, ''] }));
  };

  const removeBulkPageUrl = (index: number) => {
    setBulkForm(prev => ({ ...prev, pages_template: prev.pages_template.filter((_, i) => i !== index) }));
  };

  const updateBulkPageUrl = (index: number, value: string) => {
    setBulkForm(prev => ({
      ...prev,
      pages_template: prev.pages_template.map((page, i) => i === index ? value : page)
    }));
  };

  const addPagesModalPage = () => {
    setPagesForm(prev => [...prev, '']);
  };

  const removePagesModalPage = (index: number) => {
    setPagesForm(prev => prev.filter((_, i) => i !== index));
  };

  const updatePagesModalPage = (index: number, value: string) => {
    setPagesForm(prev => prev.map((page, i) => i === index ? value : page));
  };

  const handleCreateChapter = async (e: any) => {
    e.preventDefault();
    if (!selectedManga) return;

    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      
      const response = await fetch(`${getApiUrl()}/api/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          manga_id: selectedManga.id,
          chapter_number: parseFloat(chapterForm.chapter_number),
          title: chapterForm.title,
          pages: chapterForm.pages.filter(page => page.trim() !== '')
        })
      });

      const data = await response.json();
      if (data.success) {
        closeChapterModal();
        fetchChapters(selectedManga.id);
      } else {
        setError(data.error || 'Ошибка создания главы');
      }
    } catch (error) {
      setError('Ошибка сервера');
    }
  };

  const handleBulkCreateChapters = async (e: any) => {
    e.preventDefault();
    if (!selectedManga) return;

    const start = parseInt(bulkForm.start_chapter);
    const end = parseInt(bulkForm.end_chapter);
    
    if (start > end) {
      setError('Начальная глава должна быть меньше или равна конечной');
      return;
    }

    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      
      const promises = [];
      for (let i = start; i <= end; i++) {
        const title = bulkForm.title_prefix ? `${bulkForm.title_prefix} ${i}` : `Глава ${i}`;
        promises.push(
          fetch(`${getApiUrl()}/api/chapters`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              manga_id: selectedManga.id,
              chapter_number: i,
              title: title,
              pages: bulkForm.pages_template.filter(page => page.trim() !== '')
            })
          })
        );
      }

      await Promise.all(promises);
      closeChapterModal();
      fetchChapters(selectedManga.id);
    } catch (error) {
      setError('Ошибка создания глав');
    }
  };

  const handleUpdatePages = async (e: any) => {
    e.preventDefault();
    if (!selectedChapter) return;

    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      
      const response = await fetch(`${getApiUrl()}/api/chapters/${selectedChapter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pages: pagesForm.filter(page => page.trim() !== '')
        })
      });

      const data = await response.json();
      if (data.success) {
        closePagesModal();
        fetchChapters(selectedManga!.id);
      } else {
        setError(data.error || 'Ошибка обновления страниц');
      }
    } catch (error) {
      setError('Ошибка сервера');
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    if (!confirm('Удалить главу?')) return;
    
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      
      const response = await fetch(`${getApiUrl()}/api/chapters/${chapterId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchChapters(selectedManga!.id);
      } else {
        alert(data.error || 'Ошибка удаления');
      }
    } catch (error) {
      alert('Ошибка сервера');
    }
  };

  if (!authChecked) {
    return <div className="text-white text-center py-16 text-2xl">Проверка доступа...</div>;
  }
  if (!user || user.role !== 'admin') {
    return <div className="text-white text-center py-16 text-2xl">Доступ запрещён</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-5xl mx-auto bg-white/10 rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Админ-панель</h1>
          <Link href="/" className="text-purple-300 hover:text-white transition-colors">На главную</Link>
        </div>
        {/* Табы */}
        <div className="flex gap-4 mb-8">
          <button onClick={() => setTab('manga')} className={`px-6 py-2 rounded-t-lg font-semibold transition-colors ${tab === 'manga' ? 'bg-purple-700 text-white shadow' : 'bg-white/20 text-purple-200 hover:bg-purple-800/40'}`}>Манга</button>
          <button onClick={() => setTab('chapters')} className={`px-6 py-2 rounded-t-lg font-semibold transition-colors ${tab === 'chapters' ? 'bg-purple-700 text-white shadow' : 'bg-white/20 text-purple-200 hover:bg-purple-800/40'}`}>Главы</button>
          <button onClick={() => setTab('users')} className={`px-6 py-2 rounded-t-lg font-semibold transition-colors ${tab === 'users' ? 'bg-purple-700 text-white shadow' : 'bg-white/20 text-purple-200 hover:bg-purple-800/40'}`}>Пользователи</button>
          <button onClick={() => setTab('history')} className={`px-6 py-2 rounded-t-lg font-semibold transition-colors ${tab === 'history' ? 'bg-purple-700 text-white shadow' : 'bg-white/20 text-purple-200 hover:bg-purple-800/40'}`}>История</button>
        </div>
        {/* Контент таба */}
        {tab === 'manga' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-white font-semibold">Список манги</h2>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors" onClick={openAddModal}>+ Добавить мангу</button>
            </div>
            {loading ? (
              <div className="text-white/80 text-center py-8">Загрузка...</div>
            ) : (
              <table className="w-full text-white/90 bg-white/5 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-purple-800/60">
                    <th className="py-2 px-4 text-left">ID</th>
                    <th className="py-2 px-4 text-left">Название</th>
                    <th className="py-2 px-4 text-left">Автор</th>
                    <th className="py-2 px-4 text-left">Рейтинг</th>
                    <th className="py-2 px-4 text-left">Просмотры</th>
                    <th className="py-2 px-4 text-left">Статус</th>
                    <th className="py-2 px-4 text-left">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {mangas.map((manga) => (
                    <tr key={manga.id} className="border-b border-white/10 hover:bg-purple-900/30 transition-colors">
                      <td className="py-2 px-4">{manga.id}</td>
                      <td className="py-2 px-4 font-semibold">{manga.title}</td>
                      <td className="py-2 px-4">{manga.author}</td>
                      <td className="py-2 px-4">{manga.rating?.toFixed(1) || '0.0'}</td>
                      <td className="py-2 px-4">{manga.views?.toLocaleString() || '0'}</td>
                      <td className="py-2 px-4">{manga.status === 'ongoing' ? 'Онгоинг' : manga.status === 'completed' ? 'Завершена' : 'Хиатус'}</td>
                      <td className="py-2 px-4 flex gap-2">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded" onClick={() => openEditModal(manga)}>Редактировать</button>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded" onClick={() => handleDelete(manga.id)}>Удалить</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
        {tab === 'users' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-white font-semibold">Список пользователей</h2>
            </div>
            {usersLoading ? (
              <div className="text-white/80 text-center py-8">Загрузка...</div>
            ) : (
              <table className="w-full text-white/90 bg-white/5 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-purple-800/60">
                    <th className="py-2 px-4 text-left">ID</th>
                    <th className="py-2 px-4 text-left">Имя пользователя</th>
                    <th className="py-2 px-4 text-left">Email</th>
                    <th className="py-2 px-4 text-left">Роль</th>
                    <th className="py-2 px-4 text-left">Создан</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/10 hover:bg-purple-900/30 transition-colors">
                      <td className="py-2 px-4">{u.id}</td>
                      <td className="py-2 px-4 font-semibold">{u.username}</td>
                      <td className="py-2 px-4">{u.email}</td>
                      <td className="py-2 px-4">{u.role}</td>
                      <td className="py-2 px-4">{new Date(u.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
        {tab === 'chapters' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-white font-semibold">Управление главами</h2>
              {selectedManga && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => openChapterModal('single')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    + Добавить главу
                  </button>
                  <button 
                    onClick={() => openChapterModal('bulk')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    📚 Массовое добавление
                  </button>
                </div>
              )}
            </div>

            {!selectedManga ? (
              <div>
                <h3 className="text-lg text-white mb-4">Выберите мангу для управления главами:</h3>
                {loading ? (
                  <div className="text-white/80 text-center py-8">Загрузка...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {mangas.map((manga) => (
                      <div 
                        key={manga.id} 
                        onClick={() => selectManga(manga)}
                        className="bg-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-colors group"
                      >
                        <div className="aspect-[3/4] bg-gray-800 rounded-lg mb-3 overflow-hidden">
                          {manga.cover_image ? (
                            <img 
                              src={manga.cover_image} 
                              alt={manga.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              📚
                            </div>
                          )}
                        </div>
                        <h4 className="text-white font-semibold text-sm mb-1 truncate">{manga.title}</h4>
                        <p className="text-purple-200 text-xs">{manga.author}</p>
                        <div className="flex gap-1 mt-2">
                          {manga.genres.slice(0, 2).map((genre, index) => (
                            <span key={index} className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedManga(null)}
                      className="text-purple-300 hover:text-white transition-colors"
                    >
                      ← Назад к списку
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="aspect-[3/4] w-16 bg-gray-800 rounded-lg overflow-hidden">
                        {selectedManga.cover_image ? (
                          <img 
                            src={selectedManga.cover_image} 
                            alt={selectedManga.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            📚
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{selectedManga.title}</h3>
                        <p className="text-purple-200 text-sm">{selectedManga.author}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openChapterModal('single')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      + Добавить главу
                    </button>
                    <button 
                      onClick={() => openChapterModal('bulk')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      📚 Массовое добавление
                    </button>
                  </div>
                </div>

                {chaptersLoading ? (
                  <div className="text-white/80 text-center py-8">Загрузка глав...</div>
                ) : chapters.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📖</div>
                    <h3 className="text-white text-lg mb-2">Глав пока нет</h3>
                    <p className="text-purple-200 mb-4">Добавьте первую главу для этой манги</p>
                    <button 
                      onClick={() => openChapterModal('single')}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      + Добавить первую главу
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chapters.map((chapter) => (
                      <div key={chapter.id} className="bg-white/10 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-white font-semibold">
                              Глава {chapter.chapter_number}
                            </h4>
                            {chapter.title && (
                              <p className="text-purple-200 text-sm">{chapter.title}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => openPagesModal(chapter)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                              title="Управление страницами"
                            >
                              📄
                            </button>
                            <button 
                              onClick={() => handleDeleteChapter(chapter.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                              title="Удалить главу"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-purple-200">
                          <p>Страниц: {chapter.pages?.length || 0}</p>
                          <p>Просмотров: {chapter.views || 0}</p>
                          <p>Создана: {new Date(chapter.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {tab === 'history' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-white font-semibold">История изменений</h2>
            </div>
            {historyLoading ? (
              <div className="text-white/80 text-center py-8">Загрузка...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-white/90 bg-white/5 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-purple-800/60">
                      <th className="py-2 px-4 text-left">Дата</th>
                      <th className="py-2 px-4 text-left">Пользователь</th>
                      <th className="py-2 px-4 text-left">Манга</th>
                      <th className="py-2 px-4 text-left">Действие</th>
                      <th className="py-2 px-4 text-left">Детали</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} className="border-b border-white/10 hover:bg-purple-900/30 transition-colors">
                        <td className="py-2 px-4 whitespace-nowrap">{new Date(h.created_at).toLocaleString()}</td>
                        <td className="py-2 px-4 font-semibold">{h.username || 'Система'}</td>
                        <td className="py-2 px-4">{h.manga_title || `ID: ${h.manga_id}`}</td>
                        <td className="py-2 px-4">{h.action === 'create' ? 'Создание' : h.action === 'update' ? 'Изменение' : h.action === 'delete' ? 'Удаление' : h.action === 'add_chapter' ? 'Добавление главы' : h.action}</td>
                        <td className="py-2 px-4 text-xs max-w-xs truncate" title={h.details}>{h.details ? h.details.slice(0, 100) : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Модальное окно для добавления/редактирования манги */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={closeModal}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">{modalType === 'add' ? 'Добавить мангу' : 'Редактировать мангу'}</h2>
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Название"
                  value={form.title || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                  required
                />
                <input
                  type="text"
                  name="title_original"
                  placeholder="Оригинальное название"
                  value={form.title_original || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  name="author"
                  placeholder="Автор"
                  value={form.author || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                  required
                />
                <input
                  type="text"
                  name="artist"
                  placeholder="Художник"
                  value={form.artist || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  name="genres"
                  placeholder="Жанры (через запятую)"
                  value={Array.isArray(form.genres) ? form.genres.join(', ') : ''}
                  onChange={handleGenresChange}
                  className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                  required
                />
                <input
                  type="number"
                  name="year"
                  placeholder="Год выпуска"
                  value={form.year || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                  min={1900}
                  max={new Date().getFullYear()}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="rating"
                    placeholder="Рейтинг (0-10)"
                    value={form.rating || ''}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                    min={0}
                    max={10}
                    step={0.1}
                  />
                  <input
                    type="number"
                    name="views"
                    placeholder="Просмотры"
                    value={form.views || ''}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                    min={0}
                  />
                </div>
                <select
                  name="status"
                  value={form.status || 'ongoing'}
                  onChange={handleChange}
                  className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="ongoing">Онгоинг</option>
                  <option value="completed">Завершена</option>
                  <option value="hiatus">Хиатус</option>
                </select>
                <input
                  type="text"
                  name="cover_image"
                  placeholder="Ссылка на обложку или путь к файлу"
                  value={form.cover_image || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                />
                <textarea
                  name="description"
                  placeholder="Описание"
                  value={form.description || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                  required
                  rows={4}
                />
                {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Сохранение...' : (modalType === 'add' ? 'Добавить' : 'Сохранить')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно для добавления глав */}
        {showChapterModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={closeChapterModal}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">
                {chapterModalType === 'single' ? 'Добавить главу' : 'Массовое добавление глав'}
              </h2>
              
              {chapterModalType === 'single' ? (
                <form onSubmit={handleCreateChapter} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      name="chapter_number"
                      placeholder="Номер главы"
                      value={chapterForm.chapter_number}
                      onChange={handleChapterChange}
                      className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                      required
                      step="0.1"
                    />
                    <input
                      type="text"
                      name="title"
                      placeholder="Название главы (необязательно)"
                      value={chapterForm.title}
                      onChange={handleChapterChange}
                      className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-gray-700 font-semibold">Страницы главы</label>
                      <button
                        type="button"
                        onClick={addPageUrl}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        + Добавить страницу
                      </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {chapterForm.pages.map((page, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="url"
                            placeholder={`Ссылка на страницу ${index + 1}`}
                            value={page}
                            onChange={(e) => updatePageUrl(index, e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                          />
                          <button
                            type="button"
                            onClick={() => removePageUrl(index)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Добавить главу
                  </button>
                </form>
              ) : (
                <form onSubmit={handleBulkCreateChapters} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      name="start_chapter"
                      placeholder="Начальная глава"
                      value={bulkForm.start_chapter}
                      onChange={handleBulkChange}
                      className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                      required
                    />
                    <input
                      type="number"
                      name="end_chapter"
                      placeholder="Конечная глава"
                      value={bulkForm.end_chapter}
                      onChange={handleBulkChange}
                      className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  
                  <input
                    type="text"
                    name="title_prefix"
                    placeholder="Префикс названия (например: 'Глава' или 'Chapter')"
                    value={bulkForm.title_prefix}
                    onChange={handleBulkChange}
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                  />
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-gray-700 font-semibold">Шаблон страниц (будет применен ко всем главам)</label>
                      <button
                        type="button"
                        onClick={addBulkPageUrl}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        + Добавить страницу
                      </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {bulkForm.pages_template.map((page, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="url"
                            placeholder={`Ссылка на страницу ${index + 1}`}
                            value={page}
                            onChange={(e) => updateBulkPageUrl(index, e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeBulkPageUrl(index)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Создать главы ({bulkForm.start_chapter && bulkForm.end_chapter ? 
                      Math.max(0, parseInt(bulkForm.end_chapter) - parseInt(bulkForm.start_chapter) + 1) : 0})
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Модальное окно для управления страницами */}
        {showPagesModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={closePagesModal}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">
                Управление страницами - Глава {selectedChapter?.chapter_number}
              </h2>
              
              <form onSubmit={handleUpdatePages} className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-gray-700 font-semibold">Страницы главы</label>
                    <button
                      type="button"
                      onClick={addPagesModalPage}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      + Добавить страницу
                    </button>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {pagesForm.map((page, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="text-gray-600 font-mono text-sm w-8">{index + 1}</span>
                        <input
                          type="url"
                          placeholder={`Ссылка на страницу ${index + 1}`}
                          value={page}
                          onChange={(e) => updatePagesModalPage(index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => removePagesModalPage(index)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex-1"
                  >
                    Сохранить изменения
                  </button>
                  <button
                    type="button"
                    onClick={closePagesModal}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 