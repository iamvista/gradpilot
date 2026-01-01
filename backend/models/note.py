"""
筆記模型
Note Model
"""

from . import db
from datetime import datetime


class Note(db.Model):
    """筆記資料表"""

    __tablename__ = 'notes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    # 內容
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text)

    # 分類和標籤
    category = db.Column(db.String(50))  # 例如：靈感、文獻、實驗
    tags = db.Column(db.String(255))  # 逗號分隔的標籤

    # 顏色標記（用於視覺區分）
    color = db.Column(db.String(20), default='yellow')

    # 置頂
    pinned = db.Column(db.Boolean, default=False, index=True)

    # 時間戳
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'category': self.category,
            'tags': self.tags.split(',') if self.tags else [],
            'color': self.color,
            'pinned': self.pinned,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Note {self.title}>'
