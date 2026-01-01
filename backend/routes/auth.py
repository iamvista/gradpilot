"""
認證路由
Authentication Routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import db, User

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """用戶註冊"""
    try:
        data = request.get_json()

        # 驗證必填欄位
        if not data.get('email') or not data.get('password') or not data.get('username'):
            return jsonify({'error': '請提供 email、username 和 password'}), 400

        # 檢查 email 是否已存在
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': '此 email 已被註冊'}), 400

        # 創建新用戶
        user = User(
            email=data['email'],
            username=data['username']
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

        # 生成 JWT token
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)

        return jsonify({
            'message': '註冊成功',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """用戶登入"""
    try:
        data = request.get_json()

        if not data.get('email') or not data.get('password'):
            return jsonify({'error': '請提供 email 和 password'}), 400

        # 查找用戶
        user = User.query.filter_by(email=data['email']).first()

        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Email 或密碼錯誤'}), 401

        # 生成 JWT token
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)

        return jsonify({
            'message': '登入成功',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """獲取當前用戶資訊"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': '用戶不存在'}), 404

        return jsonify(user.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """刷新 access token"""
    try:
        user_id = get_jwt_identity()
        access_token = create_access_token(identity=user_id)

        return jsonify({'access_token': access_token}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/delete-account', methods=['DELETE'])
def delete_account_by_email():
    """通過 email 刪除帳號（無需認證）"""
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({'error': '請提供 email'}), 400

        # 查找用戶
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': '找不到該用戶'}), 404

        # 刪除用戶相關的所有資料
        from models.todo import Todo
        from models.note import Note
        from models.pomodoro import PomodoroSession

        Todo.query.filter_by(user_id=user.id).delete()
        Note.query.filter_by(user_id=user.id).delete()
        PomodoroSession.query.filter_by(user_id=user.id).delete()

        # 刪除用戶
        db.session.delete(user)
        db.session.commit()

        return jsonify({'message': '帳號已成功刪除'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
