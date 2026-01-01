"""
配置文件
Configuration for GradPilot 2.0
"""

import os
from datetime import timedelta

class Config:
    """基礎配置"""

    # 安全性
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # JWT 配置
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # 資料庫配置
    # 將 postgresql:// 替換為 postgresql+psycopg:// 以使用 psycopg3 驅動
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///gradpilot.db'
    if DATABASE_URL.startswith('postgresql://'):
        DATABASE_URL = DATABASE_URL.replace('postgresql://', 'postgresql+psycopg://', 1)
    elif DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql+psycopg://', 1)
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # CORS 配置
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173').split(',')

    # 應用配置
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB


class DevelopmentConfig(Config):
    """開發環境配置"""
    DEBUG = True
    SQLALCHEMY_ECHO = True  # 顯示 SQL 語句


class ProductionConfig(Config):
    """生產環境配置"""
    DEBUG = False

    # 生產環境必須設定這些環境變數
    @classmethod
    def init_app(cls, app):
        if not os.environ.get('SECRET_KEY'):
            raise ValueError("生產環境必須設定 SECRET_KEY 環境變數")
        if not os.environ.get('DATABASE_URL'):
            raise ValueError("生產環境必須設定 DATABASE_URL 環境變數")


class TestingConfig(Config):
    """測試環境配置"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'


# 配置字典
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
