"""
數據導出路由
Data Export Routes
"""

from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Todo, Note, PomodoroSession, User
import json
import csv
import io
from datetime import datetime

export_bp = Blueprint('export', __name__, url_prefix='/api/export')


@export_bp.route('/all', methods=['GET'])
@jwt_required()
def export_all_data():
    """導出所有數據為 JSON"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': '用戶不存在'}), 404

        # 收集所有數據
        todos = Todo.query.filter_by(user_id=user_id).all()
        notes = Note.query.filter_by(user_id=user_id).all()
        pomodoro_sessions = PomodoroSession.query.filter_by(user_id=user_id).all()

        data = {
            'export_date': datetime.utcnow().isoformat(),
            'user': {
                'username': user.username,
                'email': user.email,
                'timezone': user.timezone,
                'pomodoro_duration': user.pomodoro_duration,
                'break_duration': user.break_duration
            },
            'todos': [todo.to_dict() for todo in todos],
            'notes': [note.to_dict() for note in notes],
            'pomodoro_sessions': [session.to_dict() for session in pomodoro_sessions],
            'stats': {
                'total_todos': len(todos),
                'total_notes': len(notes),
                'total_pomodoro_sessions': len(pomodoro_sessions)
            }
        }

        # 返回 JSON 文件
        json_data = json.dumps(data, ensure_ascii=False, indent=2)
        buffer = io.BytesIO(json_data.encode('utf-8'))
        buffer.seek(0)

        filename = f"gradpilot_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"

        return send_file(
            buffer,
            mimetype='application/json',
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@export_bp.route('/todos', methods=['GET'])
@jwt_required()
def export_todos():
    """導出待辦事項"""
    try:
        user_id = int(get_jwt_identity())
        format_type = request.args.get('format', 'json')  # json, csv, md

        todos = Todo.query.filter_by(user_id=user_id).order_by(Todo.created_at.desc()).all()

        if format_type == 'json':
            data = {
                'export_date': datetime.utcnow().isoformat(),
                'todos': [todo.to_dict() for todo in todos],
                'total': len(todos)
            }
            json_data = json.dumps(data, ensure_ascii=False, indent=2)
            buffer = io.BytesIO(json_data.encode('utf-8'))
            buffer.seek(0)

            return send_file(
                buffer,
                mimetype='application/json',
                as_attachment=True,
                download_name=f"todos_{datetime.utcnow().strftime('%Y%m%d')}.json"
            )

        elif format_type == 'csv':
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(['標題', '描述', '優先級', '已完成', '標籤', '截止日期', '創建時間'])

            for todo in todos:
                writer.writerow([
                    todo.title,
                    todo.description or '',
                    todo.priority,
                    '是' if todo.completed else '否',
                    todo.tags or '',
                    todo.due_date.isoformat() if todo.due_date else '',
                    todo.created_at.isoformat()
                ])

            buffer = io.BytesIO(output.getvalue().encode('utf-8-sig'))  # 使用 BOM 確保 Excel 正確顯示中文
            buffer.seek(0)

            return send_file(
                buffer,
                mimetype='text/csv',
                as_attachment=True,
                download_name=f"todos_{datetime.utcnow().strftime('%Y%m%d')}.csv"
            )

        elif format_type == 'md':
            lines = ['# 待辦事項清單\n']
            lines.append(f'導出時間：{datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")}\n')
            lines.append(f'總計：{len(todos)} 項\n\n')

            # 按優先級分組
            for priority in ['high', 'medium', 'low']:
                priority_todos = [t for t in todos if t.priority == priority]
                if priority_todos:
                    priority_names = {'high': '高', 'medium': '中', 'low': '低'}
                    lines.append(f'## {priority_names[priority]}優先級\n\n')
                    for todo in priority_todos:
                        status = '✅' if todo.completed else '⬜'
                        lines.append(f'- {status} **{todo.title}**\n')
                        if todo.description:
                            lines.append(f'  - {todo.description}\n')
                        if todo.tags:
                            lines.append(f'  - 標籤: {todo.tags}\n')
                        if todo.due_date:
                            lines.append(f'  - 截止: {todo.due_date.strftime("%Y-%m-%d")}\n')
                        lines.append('\n')

            content = ''.join(lines)
            buffer = io.BytesIO(content.encode('utf-8'))
            buffer.seek(0)

            return send_file(
                buffer,
                mimetype='text/markdown',
                as_attachment=True,
                download_name=f"todos_{datetime.utcnow().strftime('%Y%m%d')}.md"
            )

        else:
            return jsonify({'error': '不支援的格式，請使用 json、csv 或 md'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@export_bp.route('/notes', methods=['GET'])
@jwt_required()
def export_notes():
    """導出筆記"""
    try:
        user_id = int(get_jwt_identity())
        format_type = request.args.get('format', 'json')  # json, md

        notes = Note.query.filter_by(user_id=user_id).order_by(Note.updated_at.desc()).all()

        if format_type == 'json':
            data = {
                'export_date': datetime.utcnow().isoformat(),
                'notes': [note.to_dict() for note in notes],
                'total': len(notes)
            }
            json_data = json.dumps(data, ensure_ascii=False, indent=2)
            buffer = io.BytesIO(json_data.encode('utf-8'))
            buffer.seek(0)

            return send_file(
                buffer,
                mimetype='application/json',
                as_attachment=True,
                download_name=f"notes_{datetime.utcnow().strftime('%Y%m%d')}.json"
            )

        elif format_type == 'md':
            lines = ['# 筆記集合\n']
            lines.append(f'導出時間：{datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")}\n')
            lines.append(f'總計：{len(notes)} 篇\n\n')
            lines.append('---\n\n')

            for note in notes:
                lines.append(f'## {note.title}\n\n')
                if note.category:
                    lines.append(f'**分類：** {note.category}\n\n')
                if note.tags:
                    lines.append(f'**標籤：** {note.tags}\n\n')
                lines.append(f'{note.content}\n\n')
                lines.append(f'_更新時間: {note.updated_at.strftime("%Y-%m-%d %H:%M")}_\n\n')
                lines.append('---\n\n')

            content = ''.join(lines)
            buffer = io.BytesIO(content.encode('utf-8'))
            buffer.seek(0)

            return send_file(
                buffer,
                mimetype='text/markdown',
                as_attachment=True,
                download_name=f"notes_{datetime.utcnow().strftime('%Y%m%d')}.md"
            )

        else:
            return jsonify({'error': '不支援的格式，請使用 json 或 md'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500
