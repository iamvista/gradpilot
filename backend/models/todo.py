"""
待辦事項模型
Todo Model
"""

from . import db
from datetime import datetime


class Todo(db.Model):
    """待辦事項資料表"""

    __tablename__ = 'todos'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    # 內容
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    completed = db.Column(db.Boolean, default=False, index=True)

    # 優先級和標籤
    priority = db.Column(db.String(20), default='medium')  # low, medium, high
    tags = db.Column(db.String(255))  # 逗號分隔的標籤

    # 截止日期
    due_date = db.Column(db.DateTime)

    # 排序
    order = db.Column(db.Integer, default=0)

    # 時間戳
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'priority': self.priority,
            'tags': self.tags.split(',') if self.tags else [],
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'order': self.order,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

    def __repr__(self):
        return f'<Todo {self.title}>'
