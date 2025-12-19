import { useState } from 'react';
import NewsSection from '@/components/NewsSection';
import VideosSection from '@/components/VideosSection';
import CatalogSection from '@/components/CatalogSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

const Index = () => {
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
            <a href="#news" className="text-foreground/80 hover:text-primary transition-colors">Новости</a>
            <a href="#videos" className="text-foreground/80 hover:text-primary transition-colors">Видео</a>
            <a href="#custom-order" className="text-foreground/80 hover:text-primary transition-colors">Заказать</a>
            <a href="#contact" className="text-foreground/80 hover:text-primary transition-colors">Контакты</a>
          </nav>
        </div>
      </header>

      <section 
        className="relative py-20 md:py-32 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://cdn.poehali.dev/projects/befd58b1-207d-44d6-91e9-e354a96a9201/files/fbcc8b25-50c5-49db-a3a5-be843413b75d.jpg')`
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
              Искусство, созданное природой
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed drop-shadow-md">
              Каждое изделие из капа и сувеля — это уникальная песня природы. 
              Неповторимые узоры, созданные за десятилетия, оживают в руках мастера.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg" onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>
                <Icon name="Eye" className="mr-2" size={20} />
                Смотреть коллекцию
              </Button>
              <Button size="lg" variant="outline" className="text-lg border-white text-white hover:bg-white/10" onClick={() => setCustomOrderOpen(true)}>
                <Icon name="Wrench" className="mr-2" size={20} />
                Заказать изделие
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
      </section>

      <CatalogSection />

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

      <NewsSection />

      <VideosSection />

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
                <p className="text-primary-foreground/80">+7 (929) 309-08-98</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                  <Icon name="Mail" size={32} />
                </div>
                <h3 className="text-xl font-semibold">Email</h3>
                <p className="text-primary-foreground/80">kav0898@mail.ru</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                  <Icon name="MapPin" size={32} />
                </div>
                <h3 className="text-xl font-semibold">Мастерская</h3>
                <p className="text-primary-foreground/80">с. Вознесенка, Березовский район, ул. Ленина, д. 14</p>
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