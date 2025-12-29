"""
Единый API для управления контентом (новости и видео)
Поддерживает: получение, создание, обновление, удаление новостей и видео
"""
import json
import os
import psycopg2
from typing import Dict, Any
import base64
import uuid
import boto3

def get_db_connection():
    """Создание подключения к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик запросов для управления контентом
    
    Новости:
    GET /news - получить все новости
    GET /news?id=123 - получить конкретную новость
    POST /news - создать новость
    PUT /news?id=123 - обновить новость
    DELETE /news?id=123 - удалить новость
    
    Видео:
    GET /videos - получить все видео
    GET /videos?id=123 - получить конкретное видео
    POST /videos - создать видео
    PUT /videos?id=123 - обновить видео
    DELETE /videos?id=123 - удалить видео
    """
    method: str = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters', {}) or {}
    content_type = params.get('type', 'news')
    
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
    
    if content_type == 'news':
        return handle_news(event, method)
    elif content_type == 'videos':
        return handle_videos(event, method)
    else:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid type parameter. Use ?type=news or ?type=videos'}),
            'isBase64Encoded': False
        }

def handle_news(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """Обработка запросов к новостям"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            news_id = params.get('id')
            
            if news_id:
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
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
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
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
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
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
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
                'body': json.dumps({'message': 'News deleted successfully'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()

def handle_videos(event: Dict[str, Any], method: str) -> Dict[str, Any]:
    """Обработка запросов к видео"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            video_id = params.get('id')
            
            if video_id:
                cur.execute(
                    "SELECT id, title, description, video_url, thumbnail_url, created_at, updated_at, is_published FROM t_p4274353_souvenir_store_proje.videos WHERE id = %s",
                    (video_id,)
                )
                row = cur.fetchone()
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Video not found'}),
                        'isBase64Encoded': False
                    }
                
                result = {
                    'id': row[0],
                    'title': row[1],
                    'description': row[2],
                    'video_url': row[3],
                    'thumbnail_url': row[4],
                    'created_at': row[5].isoformat() if row[5] else None,
                    'updated_at': row[6].isoformat() if row[6] else None,
                    'is_published': row[7]
                }
            else:
                cur.execute(
                    "SELECT id, title, description, video_url, thumbnail_url, created_at, updated_at, is_published FROM t_p4274353_souvenir_store_proje.videos WHERE is_published = true ORDER BY created_at DESC"
                )
                rows = cur.fetchall()
                result = [{
                    'id': row[0],
                    'title': row[1],
                    'description': row[2],
                    'video_url': row[3],
                    'thumbnail_url': row[4],
                    'created_at': row[5].isoformat() if row[5] else None,
                    'updated_at': row[6].isoformat() if row[6] else None,
                    'is_published': row[7]
                } for row in rows]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            title = body_data.get('title', '').strip()
            description = body_data.get('description', '').strip()
            video_base64 = body_data.get('video_data', '')
            thumbnail_base64 = body_data.get('thumbnail_data', '')
            
            if not title or not video_base64:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Title and video_data are required'}),
                    'isBase64Encoded': False
                }
            
            s3 = boto3.client('s3',
                endpoint_url='https://bucket.poehali.dev',
                aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
            )
            
            video_id = str(uuid.uuid4())
            video_key = f'videos/{video_id}.mp4'
            
            video_data = base64.b64decode(video_base64)
            s3.put_object(
                Bucket='files',
                Key=video_key,
                Body=video_data,
                ContentType='video/mp4'
            )
            
            video_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{video_key}"
            
            thumbnail_url = None
            if thumbnail_base64:
                thumbnail_key = f'videos/thumbnails/{video_id}.jpg'
                thumbnail_data = base64.b64decode(thumbnail_base64)
                s3.put_object(
                    Bucket='files',
                    Key=thumbnail_key,
                    Body=thumbnail_data,
                    ContentType='image/jpeg'
                )
                thumbnail_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{thumbnail_key}"
            
            cur.execute(
                "INSERT INTO t_p4274353_souvenir_store_proje.videos (title, description, video_url, thumbnail_url) VALUES (%s, %s, %s, %s) RETURNING id, title, description, video_url, thumbnail_url, created_at, updated_at, is_published",
                (title, description if description else None, video_url, thumbnail_url if thumbnail_url else None)
            )
            row = cur.fetchone()
            conn.commit()
            
            result = {
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'video_url': row[3],
                'thumbnail_url': row[4],
                'created_at': row[5].isoformat() if row[5] else None,
                'updated_at': row[6].isoformat() if row[6] else None,
                'is_published': row[7]
            }
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            params = event.get('queryStringParameters', {}) or {}
            video_id = params.get('id')
            
            if not video_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Video ID is required'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            title = body_data.get('title', '').strip()
            description = body_data.get('description', '').strip()
            video_url = body_data.get('video_url', '').strip()
            thumbnail_url = body_data.get('thumbnail_url', '').strip()
            is_published = body_data.get('is_published', True)
            
            if not title or not video_url:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Title and video_url are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """UPDATE t_p4274353_souvenir_store_proje.videos 
                   SET title = %s, description = %s, video_url = %s, thumbnail_url = %s, is_published = %s, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = %s
                   RETURNING id, title, description, video_url, thumbnail_url, created_at, updated_at, is_published""",
                (title, description if description else None, video_url, thumbnail_url if thumbnail_url else None, is_published, video_id)
            )
            row = cur.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Video not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            result = {
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'video_url': row[3],
                'thumbnail_url': row[4],
                'created_at': row[5].isoformat() if row[5] else None,
                'updated_at': row[6].isoformat() if row[6] else None,
                'is_published': row[7]
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {}) or {}
            video_id = params.get('id')
            
            if not video_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Video ID is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("DELETE FROM t_p4274353_souvenir_store_proje.videos WHERE id = %s RETURNING id", (video_id,))
            row = cur.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Video not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Video deleted successfully'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()