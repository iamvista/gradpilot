"""
資料模型
Database Models for GradPilot 2.0
"""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# 匯入所有模型
from .user import User
from .todo import Todo
from .note import Note
from .pomodoro import PomodoroSession
from .reference import Reference

__all__ = ['db', 'User', 'Todo', 'Note', 'PomodoroSession', 'Reference']
