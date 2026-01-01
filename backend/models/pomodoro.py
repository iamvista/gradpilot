"""
番茄鐘模型
Pomodoro Session Model
"""

from . import db
from datetime import datetime


class PomodoroSession(db.Model):
    """番茄鐘紀錄資料表"""

    __tablename__ = 'pomodoro_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    # 會話資訊
    duration = db.Column(db.Integer, nullable=False)  # 分鐘數
    session_type = db.Column(db.String(20), default='focus')  # focus, break
    completed = db.Column(db.Boolean, default=True)  # 是否完成（未中斷）

    # 任務關聯（可選）
    task_name = db.Column(db.String(255))  # 這段時間在做什麼

    # 時間戳
    started_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)
    ended_at = db.Column(db.DateTime)

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'duration': self.duration,
            'session_type': self.session_type,
            'completed': self.completed,
            'task_name': self.task_name,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'ended_at': self.ended_at.isoformat() if self.ended_at else None
        }

    def __repr__(self):
        return f'<PomodoroSession {self.session_type} {self.duration}min>'
