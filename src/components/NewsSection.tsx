import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const NEWS_API = 'https://functions.poehali.dev/fbb9b132-3531-41ca-be43-a1c99af1ed23';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch(NEWS_API);
      const data = await response.json();
      setNews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки новостей:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingNews) {
        // Обновление
        const response = await fetch(`${NEWS_API}?id=${editingNews.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) throw new Error('Ошибка обновления');
        toast.success('Новость обновлена');
      } else {
        // Создание
        const response = await fetch(NEWS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) throw new Error('Ошибка создания');
        toast.success('Новость создана');
      }
      
      setFormData({ title: '', content: '', image_url: '' });
      setEditingNews(null);
      setDialogOpen(false);
      fetchNews();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Не удалось сохранить новость');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту новость?')) return;
    
    try {
      const response = await fetch(`${NEWS_API}?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Ошибка удаления');
      toast.success('Новость удалена');
      fetchNews();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      toast.error('Не удалось удалить новость');
    }
  };

  const startEdit = (item: NewsItem) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      content: item.content,
      image_url: item.image_url || '',
    });
    setDialogOpen(true);
  };

  const startCreate = () => {
    setEditingNews(null);
    setFormData({ title: '', content: '', image_url: '' });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <section id="news" className="min-h-screen py-20 bg-background flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="text-center">Загрузка новостей...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="news" className="min-h-screen py-20 bg-background flex items-center">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h2 className="text-4xl font-bold mb-4 text-primary">Новости мастерской</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Следите за нашими новинками, событиями и мастер-классами
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAdminMode(!adminMode)}
            className="ml-4"
          >
            <Icon name={adminMode ? 'EyeOff' : 'Eye'} size={20} />
          </Button>
        </div>

        {adminMode && (
          <div className="mb-8 flex justify-center">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={startCreate}>
                  <Icon name="Plus" className="mr-2" size={20} />
                  Добавить новость
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingNews ? 'Редактировать новость' : 'Новая новость'}
                  </DialogTitle>
                  <DialogDescription>
                    Заполните информацию о новости
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Заголовок</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Текст новости</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="image_url">Ссылка на изображение</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button type="submit">
                      {editingNews ? 'Сохранить' : 'Создать'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {item.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                <CardDescription>
                  {new Date(item.created_at).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{item.content}</p>
                {adminMode && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(item)}
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            Пока нет новостей
          </div>
        )}
      </div>
    </section>
  );
}