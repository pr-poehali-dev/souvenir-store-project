import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

const products = [
  {
    id: 1,
    name: 'Ваза "Лесная симфония"',
    description: 'Высота 35 см, диаметр 20 см. Уникальные природные узоры капа создают неповторимую композицию, напоминающую лесную чащу на рассвете.',
    price: '45 000 ₽',
    image: 'https://cdn.poehali.dev/projects/befd58b1-207d-44d6-91e9-e354a96a9201/files/b47d2ed9-8262-470f-8737-7107778b8497.jpg',
    available: true
  },
  {
    id: 2,
    name: 'Шкатулка "Янтарная тайна"',
    description: 'Размер 15×10×8 см. Золотистые переливы сувеля создают эффект застывшего янтаря. Идеальна для хранения украшений.',
    price: '28 000 ₽',
    image: 'https://cdn.poehali.dev/projects/befd58b1-207d-44d6-91e9-e354a96a9201/files/0a8f301f-1316-455e-b130-18302433f496.jpg',
    available: true
  },
  {
    id: 3,
    name: 'Подсвечник "Огонь природы"',
    description: 'Высота 18 см. Каждый завиток древесины кажется языком пламени, застывшим в дереве. Авторская работа.',
    price: '22 000 ₽',
    image: 'https://cdn.poehali.dev/projects/befd58b1-207d-44d6-91e9-e354a96a9201/files/71213e88-ab2e-44ca-a62c-bbc3c1ace355.jpg',
    available: true
  }
];

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [customOrderOpen, setCustomOrderOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="TreePine" className="text-primary" size={32} />
            <h1 className="text-3xl font-bold text-primary">Природный шедевр</h1>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#catalog" className="text-foreground/80 hover:text-primary transition-colors">Каталог</a>
            <a href="#custom-order" className="text-foreground/80 hover:text-primary transition-colors">Заказать</a>
            <a href="#contact" className="text-foreground/80 hover:text-primary transition-colors">Контакты</a>
          </nav>
        </div>
      </header>

      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-background via-muted/30 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-primary">
              Искусство, созданное природой
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Каждое изделие из капа и сувеля — это уникальная песня природы. 
              Неповторимые узоры, созданные за десятилетия, оживают в руках мастера.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg" onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>
                <Icon name="Eye" className="mr-2" size={20} />
                Смотреть коллекцию
              </Button>
              <Button size="lg" variant="outline" className="text-lg" onClick={() => setCustomOrderOpen(true)}>
                <Icon name="Wrench" className="mr-2" size={20} />
                Заказать изделие
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
      </section>

      <section id="catalog" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Галерея готовых изделий</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Каждое изделие — эксклюзив. Невозможно повторить то, что создала природа.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <Card 
                key={product.id} 
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scale-in cursor-pointer group"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative overflow-hidden aspect-square">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.available && (
                    <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      В наличии
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription className="text-base line-clamp-3">{product.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">{product.price}</span>
                  <Button onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(product);
                    setOrderDialogOpen(true);
                  }}>
                    <Icon name="ShoppingCart" className="mr-2" size={18} />
                    Заказать
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="custom-order" className="py-20 bg-gradient-to-br from-accent/5 to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Индивидуальный заказ</h2>
              <p className="text-xl text-muted-foreground">
                Создадим изделие по вашим параметрам. Опишите ваше видение, и мы воплотим его в дереве.
              </p>
            </div>

            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle className="text-2xl">Форма заказа</CardTitle>
                <CardDescription>Заполните параметры, и мы свяжемся с вами для обсуждения деталей</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="product-type">Тип изделия</Label>
                  <select 
                    id="product-type"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option>Ваза</option>
                    <option>Шкатулка</option>
                    <option>Подсвечник</option>
                    <option>Другое</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Высота (см)</Label>
                    <Input id="height" type="number" placeholder="30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diameter">Диаметр (см)</Label>
                    <Input id="diameter" type="number" placeholder="15" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание и пожелания</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Опишите, что вы хотите увидеть в изделии..."
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Ваше имя</Label>
                  <Input id="name" placeholder="Иван Иванов" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input id="phone" type="tel" placeholder="+7 (999) 123-45-67" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="example@mail.ru" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg">
                  <Icon name="Send" className="mr-2" size={20} />
                  Отправить заявку
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Свяжитесь с нами</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                  <Icon name="Phone" size={32} />
                </div>
                <h3 className="text-xl font-semibold">Телефон</h3>
                <p className="text-primary-foreground/80">+7 (999) 123-45-67</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                  <Icon name="Mail" size={32} />
                </div>
                <h3 className="text-xl font-semibold">Email</h3>
                <p className="text-primary-foreground/80">info@wood-art.ru</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                  <Icon name="MapPin" size={32} />
                </div>
                <h3 className="text-xl font-semibold">Мастерская</h3>
                <p className="text-primary-foreground/80">Москва, ул. Мастеров, 12</p>
              </div>
            </div>
            <p className="text-lg text-primary-foreground/90">
              Работаем с 9:00 до 18:00 по будням. Готовы ответить на все ваши вопросы!
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-primary/90 text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-80">© 2024 Природный шедевр. Все права защищены.</p>
          <p className="text-xs opacity-60 mt-2">Каждое изделие создаётся с любовью к природе и мастерству</p>
        </div>
      </footer>

      <Dialog open={!!selectedProduct && !orderDialogOpen} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl">{selectedProduct.name}</DialogTitle>
                <DialogDescription className="text-base">{selectedProduct.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="w-full rounded-lg"
                />
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-primary">{selectedProduct.price}</span>
                  <Button size="lg" onClick={() => {
                    setOrderDialogOpen(true);
                  }}>
                    <Icon name="ShoppingCart" className="mr-2" size={20} />
                    Оформить заказ
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Оформление заказа</DialogTitle>
            <DialogDescription>
              {selectedProduct && `Изделие: ${selectedProduct.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order-name">Ваше имя</Label>
              <Input id="order-name" placeholder="Иван Иванов" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-phone">Телефон</Label>
              <Input id="order-phone" type="tel" placeholder="+7 (999) 123-45-67" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-email">Email</Label>
              <Input id="order-email" type="email" placeholder="example@mail.ru" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-comment">Комментарий</Label>
              <Textarea id="order-comment" placeholder="Дополнительные пожелания..." rows={3} />
            </div>
            <Button className="w-full" size="lg">
              <Icon name="Check" className="mr-2" size={20} />
              Подтвердить заказ
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={customOrderOpen} onOpenChange={setCustomOrderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Быстрый переход</DialogTitle>
            <DialogDescription>
              Перейти к форме индивидуального заказа?
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => {
            setCustomOrderOpen(false);
            document.getElementById('custom-order')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Перейти к форме
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
