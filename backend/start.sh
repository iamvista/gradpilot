#!/bin/bash

# 執行資料庫遷移
echo "Running database migrations..."
flask db upgrade

# 啟動應用
echo "Starting application..."
exec gunicorn --config gunicorn.conf.py wsgi:app
