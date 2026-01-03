"""
Gunicorn 配置文件
Production WSGI Server Configuration
"""

import os

# Worker 進程數 (Render 免費方案限制 512MB RAM，使用 2 個 worker)
workers = int(os.getenv("WEB_CONCURRENCY", 2))

# Worker 類型
worker_class = "sync"

# 綁定地址
bind = "0.0.0.0:5000"

# 超時設定（針對 Render 免費方案優化）
timeout = 60
keepalive = 5

# 日誌
accesslog = "-"
errorlog = "-"
loglevel = "info"

# 優雅重啟
graceful_timeout = 30

# 記憶體優化：不預載應用（減少記憶體使用）
preload_app = False

# 最大請求數（自動重啟 worker 釋放記憶體）
max_requests = 1000
max_requests_jitter = 50
