"""
API для сброса и загрузки всех товаров
ВНИМАНИЕ: Удаляет ВСЕ товары и загружает новые
"""
import json
import os
import psycopg2
from typing import Dict, Any, List

INITIAL_PRODUCTS = [
    {
        "name": "Ваза из осины №111",
        "description": "Размер 20,5×16 см, высота 10 см. Плавные линии осины создают изящную форму, будто созданную самим ветром.",
        "price_text": "2 500 ₽",
        "price_num": 2500,
        "category": "Вазы",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_939a7e38.jpg"
    },
    {
        "name": "Шкатулка из берёзы №113",
        "description": "Размер 12×10 см, высота 8 см. Природная фактура берёзы с тёмными включениями создаёт живописный узор.",
        "price_text": "1 500 ₽",
        "price_num": 1500,
        "category": "Шкатулки",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_999fa5cc.jpg"
    },
    {
        "name": "Ваза из берёзы №133",
        "description": "Размер 19×21 см, высота 13 см. Объёмная форма с необычным основанием, подчёркивающая текстуру древесины.",
        "price_text": "3 000 ₽",
        "price_num": 3000,
        "category": "Вазы",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_2650fca9.jpg"
    },
    {
        "name": "Ваза из берёзы №92",
        "description": "Размер 20×16 см, высота 12 см. Волнистые края и органичная форма создают эффект морской раковины.",
        "price_text": "3 000 ₽",
        "price_num": 3000,
        "category": "Вазы",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.43_9e50f45d.jpg"
    },
    {
        "name": "Ваза из берёзы №114",
        "description": "Размер 25×28 см, высота 19 см. Крупная ваза с выразительной текстурой и природными включениями.",
        "price_text": "9 000 ₽",
        "price_num": 9000,
        "category": "Вазы",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_0a58527b.jpg"
    },
    {
        "name": "Шкатулка из капа берёзы №21",
        "description": "Размер 11×11 см, высота 11 см. Компактная шкатулка с уникальным рисунком капа и природной фактурой.",
        "price_text": "1 700 ₽",
        "price_num": 1700,
        "category": "Шкатулки",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_2aa4c392.jpg"
    },
    {
        "name": "Подсвечник из бузины №42",
        "description": "Размер 10×10 см, высота 22 см. Высокий элегантный подсвечник с естественными наростами.",
        "price_text": "1 000 ₽",
        "price_num": 1000,
        "category": "Подсвечники",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_2ba5876e.jpg"
    },
    {
        "name": "Конфетница из берёзы №77",
        "description": "Размер 16×13 см, высота 13 см. Утончённая форма на изящной ножке с природными узорами.",
        "price_text": "1 700 ₽",
        "price_num": 1700,
        "category": "Конфетницы",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_6b1b3824.jpg"
    },
    {
        "name": "Ваза из берёзы №115",
        "description": "Размер 24×12 см, высота 13 см. Необычная раздвоенная форма, напоминающая природную расщелину.",
        "price_text": "2 700 ₽",
        "price_num": 2700,
        "category": "Вазы",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_6c752827.jpg"
    },
    {
        "name": "Ваза из берёзы №117",
        "description": "Размер 39×29 см, высота 19,5 см. Крупная декоративная ваза с выраженной фактурой и органичным основанием.",
        "price_text": "13 000 ₽",
        "price_num": 13000,
        "category": "Вазы",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_9ead7830.jpg"
    },
    {
        "name": "Ваза из берёзы №134",
        "description": "Размер 23×23 см, высота 15 см. Тёмные природные включения создают контрастный рисунок на светлой древесине.",
        "price_text": "9 000 ₽",
        "price_num": 9000,
        "category": "Вазы",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_682a1093.jpg"
    },
    {
        "name": "Декоративная чаша из берёзы №104",
        "description": "Размер 26×20 см, высота 8 см. Широкая чаша с золотистыми переливами и природной текстурой.",
        "price_text": "По запросу",
        "price_num": 0,
        "category": "Декор",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.43_62c6a861.jpg"
    },
    {
        "name": "Шкатулка из черёмухи/берёзы №119",
        "description": "Комбинированная работа с контрастом светлой берёзы и тёмной черёмухи. Уникальное сочетание пород.",
        "price_text": "1 700 ₽",
        "price_num": 1700,
        "category": "Шкатулки",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_46d33e20.jpg"
    },
    {
        "name": "Ваза из черёмухи №110",
        "description": "Размер 21×16 см, высота 11 см. Фигурные края и насыщенный природный рисунок черёмухи с контрастными включениями.",
        "price_text": "4 500 ₽",
        "price_num": 4500,
        "category": "Вазы",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_b9ad141e.jpg"
    },
    {
        "name": "Ваза из капа берёзы №87",
        "description": "Размер 23×10 см, высота 11 см. Золотистые оттенки капа с природными наростами и выразительной текстурой.",
        "price_text": "2 500 ₽",
        "price_num": 2500,
        "category": "Вазы",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_da5fc4f9.jpg"
    },
    {
        "name": "Конфетница из капа берёзы №29",
        "description": "Размер 22×12 см, высота 5 см. Изящная плоская форма с мягкими линиями и мраморным узором капа.",
        "price_text": "2 000 ₽",
        "price_num": 2000,
        "category": "Конфетницы",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_ddef6712.jpg"
    },
    {
        "name": "Декоративная ваза из берёзы №100",
        "description": "Размер 17×13,5 см, высота 11,5 см. Органичная форма с природными линиями и мягкими переходами.",
        "price_text": "2 000 ₽",
        "price_num": 2000,
        "category": "Декор",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_e2bd3762.jpg"
    },
    {
        "name": "Шкатулка из капа берёзы №67",
        "description": "Размер 14×13 см, высота 5 см. Двойная шкатулка с уникальным рисунком капа и природными включениями.",
        "price_text": "1 500 ₽",
        "price_num": 1500,
        "category": "Шкатулки",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_efcc7889.jpg"
    },
    {
        "name": "Конфетница из черёмухи №22",
        "description": "Размер 14×18 см, высота 7 см. Богатейший рисунок капа с золотистыми переливами на изящной ножке.",
        "price_text": "1 700 ₽",
        "price_num": 1700,
        "category": "Конфетницы",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_5752bf2b.jpg"
    },
    {
        "name": "Ваза из берёзы №27",
        "description": "Размер 17×12 см, высота 12 см. Свободная форма с плавными изгибами и контрастным основанием.",
        "price_text": "2 800 ₽",
        "price_num": 2800,
        "category": "Вазы",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_50143ecd.jpg"
    },
    {
        "name": "Декоративная композиция из берёзы №107",
        "description": "Размер 37×29,5 см, высота 22 см. Впечатляющая скульптурная форма с выраженной текстурой и природными линиями.",
        "price_text": "4 500 ₽",
        "price_num": 4500,
        "category": "Декор",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_68582e8d.jpg"
    },
    {
        "name": "Ваза из берёзы №118",
        "description": "Размер 31×27 см, высота 16 см. Изящная белоснежная ваза с утончёнными формами на органичном основании.",
        "price_text": "9 000 ₽",
        "price_num": 9000,
        "category": "Вазы",
        "image_url": "https://cdn.poehali.dev/files/Изображение WhatsApp 2024-10-19 в 10.13.44_afe33472.jpg"
    }
]

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Сбрасывает базу товаров и загружает начальные данные
    POST / - удалить все товары и загрузить INITIAL_PRODUCTS
    """
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("DELETE FROM products")
        
        for product in INITIAL_PRODUCTS:
            cur.execute(
                """INSERT INTO products (name, description, price_text, price_num, category, image_url, is_available) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (
                    product['name'],
                    product['description'],
                    product['price_text'],
                    product['price_num'],
                    product['category'],
                    product.get('image_url'),
                    True
                )
            )
        
        conn.commit()
        
        cur.execute("SELECT COUNT(*) FROM products")
        count = cur.fetchone()[0]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': f'База обновлена. Загружено {count} товаров',
                'count': count
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()
