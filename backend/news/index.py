"""
API для управления новостями
Поддерживает: получение списка новостей, создание, обновление, удаление
"""
import json
import os
import psycopg2
from typing import Dict, Any, Optional
from datetime import datetime

def get_db_connection():
    """Создание подключения к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик запросов для управления новостями
    GET / - получить все новости
    GET /?id=123 - получить конкретную новость
    POST / - создать новость (body: {title, content, image_url})
    PUT /?id=123 - обновить новость (body: {title, content, image_url, is_published})
    DELETE /?id=123 - удалить новость
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
            news_id = params.get('id')
            
            if news_id:
                # Получить одну новость
                cur.execute(
                    "SELECT id, title, content, image_url, created_at, updated_at, is_published FROM news WHERE id = %s",
                    (news_id,)
                )
                row = cur.fetchone()
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'News not found'}),
                        'isBase64Encoded': False
                    }
                
                result = {
                    'id': row[0],
                    'title': row[1],
                    'content': row[2],
                    'image_url': row[3],
                    'created_at': row[4].isoformat() if row[4] else None,
                    'updated_at': row[5].isoformat() if row[5] else None,
                    'is_published': row[6]
                }
            else:
                # Получить все новости
                cur.execute(
                    "SELECT id, title, content, image_url, created_at, updated_at, is_published FROM news WHERE is_published = true ORDER BY created_at DESC"
                )
                rows = cur.fetchall()
                result = [{
                    'id': row[0],
                    'title': row[1],
                    'content': row[2],
                    'image_url': row[3],
                    'created_at': row[4].isoformat() if row[4] else None,
                    'updated_at': row[5].isoformat() if row[5] else None,
                    'is_published': row[6]
                } for row in rows]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Создать новость
            body_data = json.loads(event.get('body', '{}'))
            title = body_data.get('title', '').strip()
            content = body_data.get('content', '').strip()
            image_url = body_data.get('image_url', '').strip()
            
            if not title or not content:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Title and content are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "INSERT INTO news (title, content, image_url) VALUES (%s, %s, %s) RETURNING id, title, content, image_url, created_at, updated_at, is_published",
                (title, content, image_url if image_url else None)
            )
            row = cur.fetchone()
            conn.commit()
            
            result = {
                'id': row[0],
                'title': row[1],
                'content': row[2],
                'image_url': row[3],
                'created_at': row[4].isoformat() if row[4] else None,
                'updated_at': row[5].isoformat() if row[5] else None,
                'is_published': row[6]
            }
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            # Обновить новость
            params = event.get('queryStringParameters', {}) or {}
            news_id = params.get('id')
            
            if not news_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'News ID is required'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            title = body_data.get('title', '').strip()
            content = body_data.get('content', '').strip()
            image_url = body_data.get('image_url', '').strip()
            is_published = body_data.get('is_published', True)
            
            if not title or not content:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Title and content are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """UPDATE news 
                   SET title = %s, content = %s, image_url = %s, is_published = %s, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = %s
                   RETURNING id, title, content, image_url, created_at, updated_at, is_published""",
                (title, content, image_url if image_url else None, is_published, news_id)
            )
            row = cur.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'News not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            result = {
                'id': row[0],
                'title': row[1],
                'content': row[2],
                'image_url': row[3],
                'created_at': row[4].isoformat() if row[4] else None,
                'updated_at': row[5].isoformat() if row[5] else None,
                'is_published': row[6]
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            # Удалить новость
            params = event.get('queryStringParameters', {}) or {}
            news_id = params.get('id')
            
            if not news_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'News ID is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("DELETE FROM news WHERE id = %s RETURNING id", (news_id,))
            row = cur.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'News not found'}),
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
