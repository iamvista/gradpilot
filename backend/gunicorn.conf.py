"""
Gunicorn 配置文件
Production WSGI Server Configuration
"""

import multiprocessing

# Worker 進程數
workers = multiprocessing.cpu_count() * 2 + 1

# Worker 類型
worker_class = "sync"

# 綁定地址
bind = "0.0.0.0:5000"

# 超時設定
timeout = 120
keepalive = 5

# 日誌
accesslog = "-"
errorlog = "-"
loglevel = "info"

# 優雅重啟
graceful_timeout = 30

# 預載應用
preload_app = True
