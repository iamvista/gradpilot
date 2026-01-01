"""
文獻模型
Reference Model
"""

from . import db
from datetime import datetime


class Reference(db.Model):
    """文獻資料表"""

    __tablename__ = 'references'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # 基本資訊
    title = db.Column(db.Text, nullable=False)
    authors = db.Column(db.JSON, default=list)  # [{'last': '姓', 'first': '名'}, ...]
    year = db.Column(db.String(10))

    # 期刊/出版資訊
    journal = db.Column(db.String(500))
    volume = db.Column(db.String(50))
    issue = db.Column(db.String(50))
    pages = db.Column(db.String(50))
    publisher = db.Column(db.String(500))

    # 識別碼
    doi = db.Column(db.String(255), index=True)
    url = db.Column(db.Text)

    # 類型與分類
    reference_type = db.Column(db.String(50), default='article')  # article, book, website, conference
    tags = db.Column(db.Text)  # 逗號分隔的標籤

    # 個人筆記
    notes = db.Column(db.Text)

    # 元數據
    original_text = db.Column(db.Text)  # 原始輸入文字
    confidence = db.Column(db.Float, default=0.0)  # 解析信心度
    completeness = db.Column(db.Float, default=0.0)  # 資料完整度
    enriched = db.Column(db.Boolean, default=False)  # 是否已通過 API 補全

    # 時間戳
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'authors': self.authors,
            'year': self.year,
            'journal': self.journal,
            'volume': self.volume,
            'issue': self.issue,
            'pages': self.pages,
            'publisher': self.publisher,
            'doi': self.doi,
            'url': self.url,
            'reference_type': self.reference_type,
            'tags': self.tags,
            'notes': self.notes,
            'original_text': self.original_text,
            'confidence': self.confidence,
            'completeness': self.completeness,
            'enriched': self.enriched,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Reference {self.id}: {self.title[:50] if self.title else "Untitled"}>'
