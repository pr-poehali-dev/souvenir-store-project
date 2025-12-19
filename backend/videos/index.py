"""
API для управления видео
Поддерживает: получение списка видео, создание, обновление, удаление
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
    Обработчик запросов для управления видео
    GET / - получить все видео
    GET /?id=123 - получить конкретное видео
    POST / - создать видео (body: {title, description, video_url, thumbnail_url})
    PUT /?id=123 - обновить видео (body: {title, description, video_url, thumbnail_url, is_published})
    DELETE /?id=123 - удалить видео
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
            video_id = params.get('id')
            
            if video_id:
                # Получить одно видео
                cur.execute(
                    "SELECT id, title, description, video_url, thumbnail_url, created_at, updated_at, is_published FROM videos WHERE id = %s",
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
                # Получить все видео
                cur.execute(
                    "SELECT id, title, description, video_url, thumbnail_url, created_at, updated_at, is_published FROM videos WHERE is_published = true ORDER BY created_at DESC"
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
            # Создать видео с загрузкой файла
            import base64
            import uuid
            import boto3
            
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
            
            # Загрузка видео в S3
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
                "INSERT INTO videos (title, description, video_url, thumbnail_url) VALUES (%s, %s, %s, %s) RETURNING id, title, description, video_url, thumbnail_url, created_at, updated_at, is_published",
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
            # Обновить видео
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
                """UPDATE videos 
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
            # Удалить видео
            params = event.get('queryStringParameters', {}) or {}
            video_id = params.get('id')
            
            if not video_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Video ID is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("DELETE FROM videos WHERE id = %s RETURNING id", (video_id,))
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