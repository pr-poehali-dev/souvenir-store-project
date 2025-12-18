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

const products = [
  {
    id: 1,
    name: 'Ваза из осины №111',
    description: 'Размер 20,5×16 см, высота 10 см. Плавные линии осины создают изящную форму, будто созданную самим ветром.',
    price: '2 500 ₽',
    priceNum: 2500,
    category: 'Вазы',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_939a7e38.jpg',
    available: true
  },
  {
    id: 2,
    name: 'Шкатулка из берёзы №113',
    description: 'Размер 12×10 см, высота 8 см. Природная фактура берёзы с тёмными включениями создаёт живописный узор.',
    price: '1 500 ₽',
    priceNum: 1500,
    category: 'Шкатулки',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_999fa5cc.jpg',
    available: true
  },
  {
    id: 3,
    name: 'Ваза из берёзы №133',
    description: 'Размер 19×21 см, высота 13 см. Объёмная форма с необычным основанием, подчёркивающая текстуру древесины.',
    price: '3 000 ₽',
    priceNum: 3000,
    category: 'Вазы',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_2650fca9.jpg',
    available: true
  },
  {
    id: 4,
    name: 'Ваза из берёзы №92',
    description: 'Размер 20×16 см, высота 12 см. Волнистые края и органичная форма создают эффект морской раковины.',
    price: '3 000 ₽',
    priceNum: 3000,
    category: 'Вазы',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.43_9e50f45d.jpg',
    available: true
  },
  {
    id: 5,
    name: 'Ваза из берёзы №114',
    description: 'Размер 25×28 см, высота 19 см. Крупная ваза с выразительной текстурой и природными включениями.',
    price: '9 000 ₽',
    priceNum: 9000,
    category: 'Вазы',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_0a58527b.jpg',
    available: true
  },
  {
    id: 6,
    name: 'Шкатулка из капа берёзы №21',
    description: 'Размер 11×11 см, высота 11 см. Компактная шкатулка с уникальным рисунком капа и природной фактурой.',
    price: '1 700 ₽',
    priceNum: 1700,
    category: 'Шкатулки',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_2aa4c392.jpg',
    available: true
  },
  {
    id: 7,
    name: 'Подсвечник из бузины №42',
    description: 'Размер 10×10 см, высота 22 см. Высокий элегантный подсвечник с естественными наростами.',
    price: '1 000 ₽',
    priceNum: 1000,
    category: 'Подсвечники',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_2ba5876e.jpg',
    available: true
  },
  {
    id: 8,
    name: 'Конфетница из берёзы №77',
    description: 'Размер 16×13 см, высота 13 см. Утончённая форма на изящной ножке с природными узорами.',
    price: '1 700 ₽',
    priceNum: 1700,
    category: 'Конфетницы',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_6b1b3824.jpg',
    available: true
  },
  {
    id: 9,
    name: 'Ваза из берёзы №115',
    description: 'Размер 24×12 см, высота 13 см. Необычная раздвоенная форма, напоминающая природную расщелину.',
    price: '2 700 ₽',
    priceNum: 2700,
    category: 'Вазы',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_6c752827.jpg',
    available: true
  },
  {
    id: 10,
    name: 'Ваза из берёзы №117 (детальный вид)',
    description: 'Размер 39×29 см, высота 19,5 см. Крупная декоративная ваза с выраженной фактурой и органичным основанием.',
    price: '13 000 ₽',
    priceNum: 13000,
    category: 'Вазы',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_6f2f760f.jpg',
    available: true
  },
  {
    id: 11,
    name: 'Ваза из берёзы №117',
    description: 'Размер 39×29 см, высота 19,5 см. Крупная декоративная ваза с выраженной фактурой и органичным основанием.',
    price: '13 000 ₽',
    priceNum: 13000,
    category: 'Вазы',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_9ead7830.jpg',
    available: true
  },
  {
    id: 12,
    name: 'Ваза из берёзы №134',
    description: 'Размер 23×23 см, высота 15 см. Тёмные природные включения создают контрастный рисунок на светлой древесине.',
    price: '9 000 ₽',
    priceNum: 9000,
    category: 'Вазы',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_682a1093.jpg',
    available: true
  },
  {
    id: 13,
    name: 'Декоративная чаша из берёзы №104',
    description: 'Размер 26×20 см, высота 8 см. Широкая чаша с золотистыми переливами и природной текстурой.',
    price: 'По запросу',
    priceNum: 0,
    category: 'Декор',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.43_62c6a861.jpg',
    available: true
  },
  {
    id: 14,
    name: 'Шкатулка из черёмухи/берёзы №119',
    description: 'Комбинированная работа с контрастом светлой берёзы и тёмной черёмухи. Уникальное сочетание пород.',
    price: '1 700 ₽',
    priceNum: 1700,
    category: 'Шкатулки',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_46d33e20.jpg',
    available: true
  },
  {
    id: 15,
    name: 'Ваза из черёмухи №110',
    description: 'Размер 21×16 см, высота 11 см. Фигурные края и насыщенный природный рисунок черёмухи с контрастными включениями.',
    price: '4 500 ₽',
    priceNum: 4500,
    category: 'Вазы',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_b9ad141e.jpg',
    available: true
  },
  {
    id: 16,
    name: 'Ваза из капа берёзы №87',
    description: 'Размер 23×10 см, высота 11 см. Золотистые оттенки капа с природными наростами и выразительной текстурой.',
    price: '2 500 ₽',
    priceNum: 2500,
    category: 'Вазы',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_da5fc4f9.jpg',
    available: true
  },
  {
    id: 17,
    name: 'Конфетница из капа берёзы №29',
    description: 'Размер 22×12 см, высота 5 см. Изящная плоская форма с мягкими линиями и мраморным узором капа.',
    price: '2 000 ₽',
    priceNum: 2000,
    category: 'Конфетницы',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_ddef6712.jpg',
    available: true
  },
  {
    id: 18,
    name: 'Декоративная ваза из берёзы №100',
    description: 'Размер 17×13,5 см, высота 11,5 см. Органичная форма с природными линиями и мягкими переходами.',
    price: '2 000 ₽',
    priceNum: 2000,
    category: 'Декор',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_e2bd3762.jpg',
    available: true
  },
  {
    id: 19,
    name: 'Шкатулка из капа берёзы №67',
    description: 'Размер 14×13 см, высота 5 см. Двойная шкатулка с уникальным рисунком капа и природными включениями.',
    price: '1 500 ₽',
    priceNum: 1500,
    category: 'Шкатулки',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_efcc7889.jpg',
    available: true
  },
  {
    id: 20,
    name: 'Конфетница из черёмухи №22',
    description: 'Размер 14×18 см, высота 7 см. Богатейший рисунок капа с золотистыми переливами на изящной ножке.',
    price: '1 700 ₽',
    priceNum: 1700,
    category: 'Конфетницы',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_5752bf2b.jpg',
    available: true
  },
  {
    id: 21,
    name: 'Ваза из берёзы №27',
    description: 'Размер 17×12 см, высота 12 см. Свободная форма с плавными изгибами и контрастным основанием.',
    price: '2 800 ₽',
    priceNum: 2800,
    category: 'Вазы',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_50143ecd.jpg',
    available: true
  },
  {
    id: 22,
    name: 'Декоративная композиция из берёзы №107',
    description: 'Размер 37×29,5 см, высота 22 см. Впечатляющая скульптурная форма с выраженной текстурой и природными линиями.',
    price: '4 500 ₽',
    priceNum: 4500,
    category: 'Декор',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_68582e8d.jpg',
    available: true
  },
  {
    id: 23,
    name: 'Ваза из берёзы №118',
    description: 'Размер 31×27 см, высота 16 см. Изящная белоснежная ваза с утончёнными формами на органичном основании.',
    price: '9 000 ₽',
    priceNum: 9000,
    category: 'Вазы',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_39350279.jpg',
    available: true
  },
  {
    id: 24,
    name: 'Шкатулка из капа берёзы №23',
    description: 'Размер 13×11 см, высота 9 см. Компактная шкатулка с выраженным рисунком капа на фактурном основании.',
    price: '1 700 ₽',
    priceNum: 1700,
    category: 'Шкатулки',
    image: 'https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_afe33472.jpg',
    available: true
  }
];

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