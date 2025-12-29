import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const PRODUCTS_API = 'https://functions.poehali.dev/aefdf81d-2d51-454c-a70c-4677389f4c2c';
const UPLOAD_IMAGE_API = 'https://functions.poehali.dev/4fe14c97-3236-4d72-ad8d-f7255b576bcb';
const RESET_PRODUCTS_API = 'https://functions.poehali.dev/7016ce14-f249-4f4b-9a4c-648f46150d2f';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: string;
  priceNum: number;
  category: string;
  image?: string;
  available: boolean;
}

const CACHE_KEY = 'products_cache';
const CACHE_DURATION = 5 * 60 * 1000;

interface CachedData {
  data: Product[];
  timestamp: number;
}

export default function CatalogSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('adminPassword') || 'admin2025';
  });
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [priceRange, setPriceRange] = useState<string>('Все');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_text: '',
    price_num: 0,
    category: 'Вазы',
    image_url: '',
    is_available: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const categories = ['Все', 'Вазы', 'Шкатулки', 'Конфетницы', 'Подсвечники', 'Пепельницы', 'Декор'];
  const priceRanges = [
    { label: 'Все', min: 0, max: Infinity },
    { label: 'До 2 000 ₽', min: 0, max: 2000 },
    { label: '2 000 - 5 000 ₽', min: 2000, max: 5000 },
    { label: '5 000 - 10 000 ₽', min: 5000, max: 10000 },
    { label: 'Более 10 000 ₽', min: 10000, max: Infinity },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const cachedData: CachedData = JSON.parse(cached);
          const now = Date.now();
          if (now - cachedData.timestamp < CACHE_DURATION) {
            console.log('Loaded from cache');
            setProducts(cachedData.data);
            setLoading(false);
            return;
          }
        }
      }
      
      const response = await fetch(PRODUCTS_API);
      const data = await response.json();
      console.log('Loaded from API:', data);
      setProducts(data);
      
      const cacheData: CachedData = {
        data: data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      toast.error('Не удалось загрузить каталог');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        const response = await fetch(`${PRODUCTS_API}?id=${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) throw new Error('Ошибка обновления');
        toast.success('Товар обновлён');
      } else {
        const response = await fetch(PRODUCTS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) throw new Error('Ошибка создания');
        toast.success('Товар добавлен');
      }
      
      setFormData({ name: '', description: '', price_text: '', price_num: 0, category: 'Вазы', image_url: '', is_available: true });
      setEditingProduct(null);
      setDialogOpen(false);
      localStorage.removeItem(CACHE_KEY);
      fetchProducts(true);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Не удалось сохранить товар');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить этот товар?')) return;
    
    try {
      const response = await fetch(`${PRODUCTS_API}?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Ошибка удаления');
      toast.success('Товар удалён');
      localStorage.removeItem(CACHE_KEY);
      fetchProducts(true);
    } catch (error) {
      console.error('Ошибка удаления:', error);
      toast.error('Не удалось удалить товар');
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      const response = await fetch(`${PRODUCTS_API}?id=${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price_text: product.price,
          price_num: product.priceNum,
          category: product.category,
          image_url: product.image,
          is_available: !product.available,
        }),
      });
      
      if (!response.ok) throw new Error('Ошибка обновления');
      toast.success(product.available ? 'Товар снят с продажи' : 'Товар возвращён в продажу');
      localStorage.removeItem(CACHE_KEY);
      fetchProducts(true);
    } catch (error) {
      console.error('Ошибка обновления:', error);
      toast.error('Не удалось обновить статус');
    }
  };

  const startEdit = (item: Product) => {
    setEditingProduct(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price_text: item.price,
      price_num: item.priceNum,
      category: item.category,
      image_url: item.image || '',
      is_available: item.available,
    });
    setDialogOpen(true);
  };

  const startCreate = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price_text: '', price_num: 0, category: 'Вазы', image_url: '', is_available: true });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 5 МБ');
      return;
    }

    setUploadingImage(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        const response = await fetch(UPLOAD_IMAGE_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            filename: file.name,
          }),
        });

        if (!response.ok) throw new Error('Ошибка загрузки');
        
        const data = await response.json();
        setFormData({ ...formData, image_url: data.url });
        toast.success('Изображение загружено');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      toast.error('Не удалось загрузить изображение');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleResetDatabase = async () => {
    const adminSecret = prompt('Введите секретный ключ администратора для сброса базы:');
    if (!adminSecret) return;
    
    if (!confirm('ВНИМАНИЕ! Это удалит ВСЕ товары и загрузит начальный каталог (22 товара). Продолжить?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(RESET_PRODUCTS_API, {
        method: 'POST',
        headers: {
          'X-Admin-Secret': adminSecret,
        },
      });
      
      if (response.status === 403) {
        toast.error('Неверный секретный ключ администратора');
        setLoading(false);
        return;
      }
      
      if (!response.ok) throw new Error('Ошибка сброса базы');
      
      const data = await response.json();
      toast.success(data.message || 'База данных обновлена');
      localStorage.removeItem(CACHE_KEY);
      fetchProducts(true);
    } catch (error) {
      console.error('Ошибка сброса базы:', error);
      toast.error('Не удалось обновить базу данных');
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    if (!adminMode && !product.available) return false;
    const categoryMatch = selectedCategory === 'Все' || product.category === selectedCategory;
    const currentRange = priceRanges.find(r => r.label === priceRange);
    const priceMatch = !currentRange || (product.priceNum >= currentRange.min && product.priceNum < currentRange.max);
    return categoryMatch && priceMatch;
  });

  console.log('Filtered products:', filteredProducts);

  if (loading) {
    return (
      <section id="catalog" className="min-h-screen py-20 bg-muted/30 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="text-center">Загрузка каталога...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="catalog" className="min-h-screen py-20 bg-muted/30 flex items-center">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h2 className="text-4xl font-bold mb-4 text-primary">Наш каталог</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Каждое изделие уникально и создано вручную
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (adminMode) {
                setAdminMode(false);
              } else {
                setPasswordDialogOpen(true);
              }
            }}
            className="ml-4"
          >
            <Icon name={adminMode ? 'EyeOff' : 'Eye'} size={20} />
          </Button>
        </div>

        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Вход для администратора</DialogTitle>
              <DialogDescription>
                Введите пароль для доступа к редактированию каталога
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin-password">Пароль</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (passwordInput === adminPassword) {
                        setAdminMode(true);
                        setPasswordDialogOpen(false);
                        setPasswordInput('');
                        toast.success('Вход выполнен');
                      } else {
                        toast.error('Неверный пароль');
                      }
                    }
                  }}
                  placeholder="Введите пароль"
                />
              </div>
              <Button
                onClick={() => {
                  if (passwordInput === adminPassword) {
                    setAdminMode(true);
                    setPasswordDialogOpen(false);
                    setPasswordInput('');
                    toast.success('Вход выполнен');
                  } else {
                    toast.error('Неверный пароль');
                  }
                }}
                className="w-full"
              >
                Войти
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Смена пароля администратора</DialogTitle>
              <DialogDescription>
                Введите новый пароль для доступа к редактированию каталога
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-password">Новый пароль</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                />
              </div>
              <Button
                onClick={() => {
                  if (!newPassword || newPassword.length < 6) {
                    toast.error('Пароль должен быть минимум 6 символов');
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    toast.error('Пароли не совпадают');
                    return;
                  }
                  setAdminPassword(newPassword);
                  localStorage.setItem('adminPassword', newPassword);
                  setChangePasswordOpen(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  toast.success('Пароль успешно изменён');
                }}
                className="w-full"
              >
                Сохранить пароль
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {adminMode && (
          <div className="mb-8 flex justify-center gap-4">
            <Button onClick={() => setChangePasswordOpen(true)} variant="outline">
              <Icon name="Key" className="mr-2" size={20} />
              Сменить пароль
            </Button>
            <Button onClick={handleResetDatabase} variant="destructive">
              <Icon name="RotateCcw" className="mr-2" size={20} />
              Сбросить базу
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={startCreate}>
                  <Icon name="Plus" className="mr-2" size={20} />
                  Добавить товар
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Редактировать товар' : 'Новый товар'}
                  </DialogTitle>
                  <DialogDescription>
                    Заполните информацию о товаре
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Название</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price_text">Цена (текст)</Label>
                      <Input
                        id="price_text"
                        value={formData.price_text}
                        onChange={(e) => setFormData({ ...formData, price_text: e.target.value })}
                        placeholder="2 500 ₽"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price_num">Цена (число)</Label>
                      <Input
                        id="price_num"
                        type="number"
                        value={formData.price_num}
                        onChange={(e) => setFormData({ ...formData, price_num: parseInt(e.target.value) || 0 })}
                        placeholder="2500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c !== 'Все').map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Изображение товара</Label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="flex-1"
                      />
                      {uploadingImage && <span className="text-sm text-muted-foreground">Загрузка...</span>}
                    </div>
                    {formData.image_url && (
                      <div className="space-y-2">
                        <img src={formData.image_url} alt="Превью" className="w-32 h-32 object-cover rounded border" />
                        <Input
                          type="url"
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          placeholder="Или введите ссылку на изображение"
                          className="text-sm"
                        />
                      </div>
                    )}
                    {!formData.image_url && (
                      <Input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="Или введите ссылку на изображение"
                        className="text-sm"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_available"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="is_available">В наличии</Label>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button type="submit">
                      {editingProduct ? 'Сохранить' : 'Добавить'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        <div className="flex justify-center mb-8">
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map(range => (
                <SelectItem key={range.label} value={range.label}>{range.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${!product.available && adminMode ? 'opacity-60' : ''}`}>
              {product.image && (
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader className="p-3">
                <CardTitle className="line-clamp-2 text-sm">{product.name}</CardTitle>
                <CardDescription className="line-clamp-1 text-xs">{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-lg font-bold text-primary">{product.price}</p>
                {!product.available && <p className="text-xs text-destructive mt-1">Продано</p>}
              </CardContent>
              <CardFooter className="flex gap-2">
                {!adminMode && product.available && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedProduct(product);
                      setOrderDialogOpen(true);
                    }}
                  >
                    Заказать
                  </Button>
                )}
                {adminMode && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => startEdit(product)}>
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant={product.available ? 'secondary' : 'default'}
                      onClick={() => toggleAvailability(product)}
                    >
                      <Icon name={product.available ? 'X' : 'Check'} size={16} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            Нет товаров по выбранным фильтрам
          </div>
        )}
      </div>

      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заказать: {selectedProduct?.name}</DialogTitle>
            <DialogDescription>Оставьте свои контакты, и мы свяжемся с вами</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="order-name">Ваше имя</Label>
              <Input id="order-name" placeholder="Иван Иванов" />
            </div>
            <div>
              <Label htmlFor="order-phone">Телефон</Label>
              <Input id="order-phone" type="tel" placeholder="+7 (999) 123-45-67" />
            </div>
            <Button className="w-full">
              <Icon name="Send" className="mr-2" size={20} />
              Отправить заявку
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}