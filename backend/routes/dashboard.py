"""
儀表板路由
Dashboard Routes
"""

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Todo, Note, PomodoroSession
from datetime import datetime, timedelta
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')


@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """獲取儀表板統計資料"""
    try:
        user_id = int(get_jwt_identity())

        # 今日日期
        today = datetime.utcnow().date()
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())

        # 待辦事項統計
        total_todos = Todo.query.filter_by(user_id=user_id).count()
        completed_todos = Todo.query.filter_by(user_id=user_id, completed=True).count()
        pending_todos = total_todos - completed_todos

        today_completed_todos = Todo.query.filter(
            Todo.user_id == user_id,
            Todo.completed == True,
            Todo.completed_at >= today_start,
            Todo.completed_at <= today_end
        ).count()

        # 筆記統計
        total_notes = Note.query.filter_by(user_id=user_id).count()
        pinned_notes = Note.query.filter_by(user_id=user_id, pinned=True).count()

        # 今日番茄鐘統計
        today_sessions = PomodoroSession.query.filter(
            PomodoroSession.user_id == user_id,
            PomodoroSession.started_at >= today_start,
            PomodoroSession.started_at <= today_end,
            PomodoroSession.session_type == 'focus',
            PomodoroSession.completed == True
        ).all()

        today_pomodoros = len(today_sessions)
        today_focus_minutes = sum(s.duration for s in today_sessions)
        today_focus_hours = round(today_focus_minutes / 60, 1)

        # 本週番茄鐘統計
        week_start = today_start - timedelta(days=today.weekday())
        week_sessions = PomodoroSession.query.filter(
            PomodoroSession.user_id == user_id,
            PomodoroSession.started_at >= week_start,
            PomodoroSession.session_type == 'focus',
            PomodoroSession.completed == True
        ).all()

        week_pomodoros = len(week_sessions)
        week_focus_minutes = sum(s.duration for s in week_sessions)

        # 即將到期的待辦事項
        upcoming_todos = Todo.query.filter(
            Todo.user_id == user_id,
            Todo.completed == False,
            Todo.due_date != None,
            Todo.due_date >= today_start
        ).order_by(Todo.due_date.asc()).limit(5).all()

        # 最近更新的筆記
        recent_notes = Note.query.filter_by(
            user_id=user_id
        ).order_by(Note.updated_at.desc()).limit(5).all()

        return jsonify({
            'todos': {
                'total': total_todos,
                'completed': completed_todos,
                'pending': pending_todos,
                'today_completed': today_completed_todos,
                'completion_rate': round(completed_todos / total_todos * 100, 1) if total_todos > 0 else 0
            },
            'notes': {
                'total': total_notes,
                'pinned': pinned_notes
            },
            'pomodoro': {
                'today': {
                    'sessions': today_pomodoros,
                    'minutes': today_focus_minutes,
                    'hours': today_focus_hours
                },
                'week': {
                    'sessions': week_pomodoros,
                    'minutes': week_focus_minutes,
                    'hours': round(week_focus_minutes / 60, 1)
                }
            },
            'upcoming_todos': [todo.to_dict() for todo in upcoming_todos],
            'recent_notes': [note.to_dict() for note in recent_notes]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
