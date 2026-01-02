#!/usr/bin/env python
"""創建測試數據"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from models import db, User, Todo, Note
from datetime import datetime, timedelta

def create_test_data():
    app = create_app('development')

    with app.app_context():
        # 查找用戶
        user = User.query.filter_by(email='iamvista@gmail.com').first()

        if not user:
            print("找不到用戶，請先註冊")
            return

        print(f"為用戶 {user.username} (ID: {user.id}) 創建測試數據...")

        # 創建測試待辦事項
        test_todos = [
            {
                'title': '完成論文第三章',
                'description': '撰寫研究方法論部分，包含數據收集與分析方法',
                'priority': 'high',
                'tags': '論文,研究',
                'due_date': datetime.now() + timedelta(days=7)
            },
            {
                'title': '準備研討會報告',
                'description': '整理最近的研究進展，製作簡報',
                'priority': 'medium',
                'tags': '報告,研討會',
                'due_date': datetime.now() + timedelta(days=3)
            },
            {
                'title': '閱讀參考文獻',
                'description': '閱讀5篇關於機器學習的最新論文',
                'priority': 'low',
                'tags': '閱讀,文獻',
                'due_date': datetime.now() + timedelta(days=14)
            }
        ]

        for todo_data in test_todos:
            existing = Todo.query.filter_by(
                user_id=user.id,
                title=todo_data['title']
            ).first()

            if not existing:
                todo = Todo(user_id=user.id, **todo_data)
                db.session.add(todo)
                print(f"  ✓ 創建待辦: {todo_data['title']}")

        # 創建測試筆記
        test_notes = [
            {
                'title': '機器學習筆記',
                'content': '深度學習的基本概念：神經網絡、反向傳播、梯度下降。重點關注卷積神經網絡在圖像識別中的應用。',
                'category': '學習筆記',
                'tags': '機器學習,深度學習',
                'color': '#3b82f6'
            },
            {
                'title': '研究想法',
                'content': '可以嘗試將強化學習應用到推薦系統中，結合用戶行為數據進行個性化推薦。',
                'category': '研究',
                'tags': '研究,想法',
                'color': '#10b981',
                'pinned': True
            },
            {
                'title': '會議記錄',
                'content': '與指導教授討論論文進度，建議補充更多實驗數據，下週五前完成修改。',
                'category': '會議',
                'tags': '會議,論文',
                'color': '#f59e0b'
            }
        ]

        for note_data in test_notes:
            existing = Note.query.filter_by(
                user_id=user.id,
                title=note_data['title']
            ).first()

            if not existing:
                note = Note(user_id=user.id, **note_data)
                db.session.add(note)
                print(f"  ✓ 創建筆記: {note_data['title']}")

        db.session.commit()
        print("\n✅ 測試數據創建完成！")

        # 顯示統計
        todo_count = Todo.query.filter_by(user_id=user.id).count()
        note_count = Note.query.filter_by(user_id=user.id).count()
        print(f"\n目前數據統計：")
        print(f"  待辦事項: {todo_count} 個")
        print(f"  筆記: {note_count} 個")

if __name__ == '__main__':
    create_test_data()
