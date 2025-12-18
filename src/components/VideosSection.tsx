import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const VIDEOS_API = 'https://functions.poehali.dev/6fb4d519-a65b-4a6a-8788-e60203447575';

interface VideoItem {
  id: number;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

export default function VideosSection() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(VIDEOS_API);
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Ошибка загрузки видео:', error);
      toast.error('Не удалось загрузить видео');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingVideo) {
        // Обновление
        const response = await fetch(`${VIDEOS_API}?id=${editingVideo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) throw new Error('Ошибка обновления');
        toast.success('Видео обновлено');
      } else {
        // Создание
        const response = await fetch(VIDEOS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) throw new Error('Ошибка создания');
        toast.success('Видео добавлено');
      }
      
      setFormData({ title: '', description: '', video_url: '', thumbnail_url: '' });
      setEditingVideo(null);
      setDialogOpen(false);
      fetchVideos();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Не удалось сохранить видео');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить это видео?')) return;
    
    try {
      const response = await fetch(`${VIDEOS_API}?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Ошибка удаления');
      toast.success('Видео удалено');
      fetchVideos();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      toast.error('Не удалось удалить видео');
    }
  };

  const startEdit = (item: VideoItem) => {
    setEditingVideo(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      video_url: item.video_url,
      thumbnail_url: item.thumbnail_url || '',
    });
    setDialogOpen(true);
  };

  const startCreate = () => {
    setEditingVideo(null);
    setFormData({ title: '', description: '', video_url: '', thumbnail_url: '' });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <section id="videos" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">Загрузка видео...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="videos" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h2 className="text-4xl font-bold mb-4 text-primary">Видеогалерея</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Смотрите процесс создания изделий и мастер-классы
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
                  Добавить видео
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingVideo ? 'Редактировать видео' : 'Новое видео'}
                  </DialogTitle>
                  <DialogDescription>
                    Вставьте ссылку на YouTube видео (например: https://www.youtube.com/watch?v=VIDEO_ID)
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Название</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="video_url">Ссылка на видео (YouTube embed)</Label>
                    <Input
                      id="video_url"
                      type="url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      placeholder="https://www.youtube.com/embed/VIDEO_ID"
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Используйте формат embed: youtube.com/embed/VIDEO_ID
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="thumbnail_url">Ссылка на превью (необязательно)</Label>
                    <Input
                      id="thumbnail_url"
                      type="url"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button type="submit">
                      {editingVideo ? 'Сохранить' : 'Добавить'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video overflow-hidden bg-muted">
                <iframe
                  src={item.video_url}
                  title={item.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                {item.description && (
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                )}
              </CardHeader>
              {adminMode && (
                <CardContent>
                  <div className="flex gap-2">
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
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            Пока нет видео
          </div>
        )}
      </div>
    </section>
  );
}
