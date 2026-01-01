"""
番茄鐘路由
Pomodoro Routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, PomodoroSession
from datetime import datetime, timedelta
from sqlalchemy import func

pomodoro_bp = Blueprint('pomodoro', __name__, url_prefix='/api/pomodoro')


@pomodoro_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_sessions():
    """獲取番茄鐘記錄"""
    try:
        user_id = get_jwt_identity()

        # 查詢參數
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        limit = request.args.get('limit', 100, type=int)

        query = PomodoroSession.query.filter_by(user_id=user_id)

        if start_date:
            query = query.filter(PomodoroSession.started_at >= datetime.fromisoformat(start_date))

        if end_date:
            query = query.filter(PomodoroSession.started_at <= datetime.fromisoformat(end_date))

        sessions = query.order_by(PomodoroSession.started_at.desc()).limit(limit).all()

        return jsonify([session.to_dict() for session in sessions]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@pomodoro_bp.route('/sessions', methods=['POST'])
@jwt_required()
def create_session():
    """記錄新的番茄鐘會話"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        session = PomodoroSession(
            user_id=user_id,
            duration=data.get('duration', 25),
            session_type=data.get('session_type', 'focus'),
            completed=data.get('completed', True),
            task_name=data.get('task_name'),
            started_at=datetime.fromisoformat(data['started_at']) if data.get('started_at') else datetime.utcnow(),
            ended_at=datetime.fromisoformat(data['ended_at']) if data.get('ended_at') else datetime.utcnow()
        )

        db.session.add(session)
        db.session.commit()

        return jsonify(session.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@pomodoro_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_statistics():
    """獲取番茄鐘統計資料"""
    try:
        user_id = get_jwt_identity()

        # 查詢參數
        period = request.args.get('period', 'week')  # week, month, year

        # 計算時間範圍
        now = datetime.utcnow()
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'month':
            start_date = now - timedelta(days=30)
        elif period == 'year':
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=7)

        # 查詢會話
        sessions = PomodoroSession.query.filter(
            PomodoroSession.user_id == user_id,
            PomodoroSession.started_at >= start_date,
            PomodoroSession.session_type == 'focus',
            PomodoroSession.completed == True
        ).all()

        # 計算統計
        total_sessions = len(sessions)
        total_minutes = sum(s.duration for s in sessions)
        total_hours = round(total_minutes / 60, 1)

        # 每日統計
        daily_stats = {}
        for session in sessions:
            date_key = session.started_at.strftime('%Y-%m-%d')
            if date_key not in daily_stats:
                daily_stats[date_key] = {'sessions': 0, 'minutes': 0}
            daily_stats[date_key]['sessions'] += 1
            daily_stats[date_key]['minutes'] += session.duration

        # 轉換為列表
        daily_list = [
            {
                'date': date,
                'sessions': stats['sessions'],
                'minutes': stats['minutes'],
                'hours': round(stats['minutes'] / 60, 1)
            }
            for date, stats in sorted(daily_stats.items())
        ]

        return jsonify({
            'period': period,
            'total_sessions': total_sessions,
            'total_minutes': total_minutes,
            'total_hours': total_hours,
            'daily_stats': daily_list,
            'average_per_day': round(total_minutes / 7 if period == 'week' else total_minutes / 30, 1)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
