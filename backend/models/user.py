"""
用戶模型
User Model
"""

from . import db
from datetime import datetime
import bcrypt


class User(db.Model):
    """用戶資料表"""

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    username = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    # 用戶設定
    timezone = db.Column(db.String(50), default='Asia/Taipei')
    pomodoro_duration = db.Column(db.Integer, default=25)  # 分鐘
    break_duration = db.Column(db.Integer, default=5)  # 分鐘

    # 時間戳
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 關聯
    todos = db.relationship('Todo', backref='user', lazy=True, cascade='all, delete-orphan')
    notes = db.relationship('Note', backref='user', lazy=True, cascade='all, delete-orphan')
    pomodoro_sessions = db.relationship('PomodoroSession', backref='user', lazy=True, cascade='all, delete-orphan')
    references = db.relationship('Reference', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        """設定密碼（加密）"""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        """驗證密碼"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'timezone': self.timezone,
            'pomodoro_duration': self.pomodoro_duration,
            'break_duration': self.break_duration,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<User {self.email}>'
