import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const VIDEO_API = 'https://functions.poehali.dev/6fb4d519-a65b-4a6a-8788-e60203447575';

interface VideoItem {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

export default function VideoSection() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(VIDEO_API);
      const data = await response.json();
      setVideos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки видео:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast.error('Выберите видео файл');
      return;
    }

    setUploading(true);
    
    try {
      const video_data = await fileToBase64(videoFile);
      const thumbnail_data = thumbnailFile ? await fileToBase64(thumbnailFile) : '';

      const response = await fetch(VIDEO_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          video_data,
          thumbnail_data,
        }),
      });
      
      if (!response.ok) throw new Error('Ошибка загрузки');
      
      toast.success('Видео загружено');
      setFormData({ title: '', description: '' });
      setVideoFile(null);
      setThumbnailFile(null);
      setDialogOpen(false);
      fetchVideos();
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      toast.error('Не удалось загрузить видео');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить это видео?')) return;
    
    try {
      const response = await fetch(`${VIDEO_API}?id=${id}`, {
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

  const startCreate = () => {
    setFormData({ title: '', description: '' });
    setVideoFile(null);
    setThumbnailFile(null);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <section id="videos" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center">Загрузка видео...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="videos" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h2 className="text-4xl font-bold mb-4 text-primary">Видеогалерея</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Смотрите процесс создания наших уникальных изделий
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
                  <DialogTitle>Загрузить видео</DialogTitle>
                  <DialogDescription>
                    Загрузите видео файл с вашего компьютера
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
                    <Label htmlFor="video">Видео файл (MP4)</Label>
                    <Input
                      id="video"
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="thumbnail">Обложка (опционально)</Label>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={uploading}>
                      Отмена
                    </Button>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? 'Загрузка...' : 'Загрузить'}
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
              <div className="aspect-video bg-black">
                <video
                  src={item.video_url}
                  poster={item.thumbnail_url}
                  controls
                  className="w-full h-full"
                >
                  Ваш браузер не поддерживает видео.
                </video>
              </div>
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
                <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
                {adminMode && (
                  <div className="flex gap-2 mt-4">
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

        {videos.length === 0 && !adminMode && (
          <div className="text-center py-12 text-muted-foreground">
            Видео пока не добавлены
          </div>
        )}
      </div>
    </section>
  );
}
