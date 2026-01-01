"""
WSGI 入口文件
用於生產環境部署 (Gunicorn)
"""

from app import create_app
import os

app = create_app(os.environ.get('FLASK_ENV', 'production'))

if __name__ == "__main__":
    app.run()
