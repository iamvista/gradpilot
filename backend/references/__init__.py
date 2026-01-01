"""
References Module
文獻管理模組

包含文獻解析、格式化和 API 查詢功能
"""

from .parser import ReferenceParser
from .formatter import ReferenceFormatter
from .api_client import APIClient

__all__ = ['ReferenceParser', 'ReferenceFormatter', 'APIClient']
