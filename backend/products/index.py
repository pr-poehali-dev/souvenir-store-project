"""
API для управления товарами каталога
Поддерживает: получение списка товаров, создание, обновление, удаление
"""
import json
import os
import psycopg2
from typing import Dict, Any

def get_db_connection():
    """Создание подключения к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик запросов для управления товарами
    GET / - получить все товары
    GET /?id=123 - получить конкретный товар
    POST / - создать товар (body: {name, description, price_text, price_num, category, image_url, is_available})
    PUT /?id=123 - обновить товар
    DELETE /?id=123 - удалить товар
    """
    method: str = event.get('httpMethod', 'GET')
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            product_id = params.get('id')
            
            if product_id:
                # Получить один товар
                cur.execute(
                    "SELECT id, name, description, price_text, price_num, category, image_url, is_available, created_at, updated_at FROM products WHERE id = %s",
                    (product_id,)
                )
                row = cur.fetchone()
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Product not found'}),
                        'isBase64Encoded': False
                    }
                
                result = {
                    'id': row[0],
                    'name': row[1],
                    'description': row[2],
                    'price': row[3],
                    'priceNum': row[4],
                    'category': row[5],
                    'image': row[6],
                    'available': row[7],
                    'created_at': row[8].isoformat() if row[8] else None,
                    'updated_at': row[9].isoformat() if row[9] else None
                }
            else:
                # Получить все товары
                cur.execute(
                    "SELECT id, name, description, price_text, price_num, category, image_url, is_available FROM products ORDER BY created_at DESC"
                )
                rows = cur.fetchall()
                result = [{
                    'id': row[0],
                    'name': row[1],
                    'description': row[2],
                    'price': row[3],
                    'priceNum': row[4],
                    'category': row[5],
                    'image': row[6],
                    'available': row[7]
                } for row in rows]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Создать товар
            body_data = json.loads(event.get('body', '{}'))
            name = body_data.get('name', '').strip()
            description = body_data.get('description', '').strip()
            price_text = body_data.get('price_text', '').strip()
            price_num = body_data.get('price_num', 0)
            category = body_data.get('category', '').strip()
            image_url = body_data.get('image_url', '').strip()
            is_available = body_data.get('is_available', True)
            
            if not name or not price_text or not category:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Name, price_text and category are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """INSERT INTO products (name, description, price_text, price_num, category, image_url, is_available) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s) 
                   RETURNING id, name, description, price_text, price_num, category, image_url, is_available""",
                (name, description if description else None, price_text, price_num, category, image_url if image_url else None, is_available)
            )
            row = cur.fetchone()
            conn.commit()
            
            result = {
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'price': row[3],
                'priceNum': row[4],
                'category': row[5],
                'image': row[6],
                'available': row[7]
            }
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            # Обновить товар
            params = event.get('queryStringParameters', {}) or {}
            product_id = params.get('id')
            
            if not product_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Product ID is required'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            name = body_data.get('name', '').strip()
            description = body_data.get('description', '').strip()
            price_text = body_data.get('price_text', '').strip()
            price_num = body_data.get('price_num', 0)
            category = body_data.get('category', '').strip()
            image_url = body_data.get('image_url', '').strip()
            is_available = body_data.get('is_available', True)
            
            if not name or not price_text or not category:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Name, price_text and category are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """UPDATE products 
                   SET name = %s, description = %s, price_text = %s, price_num = %s, category = %s, image_url = %s, is_available = %s, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = %s
                   RETURNING id, name, description, price_text, price_num, category, image_url, is_available""",
                (name, description if description else None, price_text, price_num, category, image_url if image_url else None, is_available, product_id)
            )
            row = cur.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Product not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            result = {
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'price': row[3],
                'priceNum': row[4],
                'category': row[5],
                'image': row[6],
                'available': row[7]
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            # Удалить товар
            params = event.get('queryStringParameters', {}) or {}
            product_id = params.get('id')
            
            if not product_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Product ID is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("DELETE FROM products WHERE id = %s RETURNING id", (product_id,))
            row = cur.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Product not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': row[0]}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
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
