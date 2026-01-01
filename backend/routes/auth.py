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

        # 生成 JWT token（identity 必須是字符串）
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

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

        # 生成 JWT token（identity 必須是字符串）
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

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
        user_id = int(get_jwt_identity())  # 轉換字符串為整數
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': '用戶不存在'}), 404

        return jsonify(user.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    """更新當前用戶資訊"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': '用戶不存在'}), 404

        data = request.get_json()

        # 可更新的字段
        if 'username' in data:
            if not data['username']:
                return jsonify({'error': '用戶名不能為空'}), 400
            user.username = data['username']

        if 'email' in data:
            if not data['email']:
                return jsonify({'error': '郵箱不能為空'}), 400
            # 檢查郵箱是否已被其他用戶使用
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': '此郵箱已被使用'}), 400
            user.email = data['email']

        if 'timezone' in data:
            user.timezone = data['timezone']

        if 'pomodoro_duration' in data:
            duration = data['pomodoro_duration']
            if not isinstance(duration, int) or duration < 1 or duration > 60:
                return jsonify({'error': '番茄鐘時長必須在 1-60 分鐘之間'}), 400
            user.pomodoro_duration = duration

        if 'break_duration' in data:
            duration = data['break_duration']
            if not isinstance(duration, int) or duration < 1 or duration > 30:
                return jsonify({'error': '休息時長必須在 1-30 分鐘之間'}), 400
            user.break_duration = duration

        db.session.commit()

        return jsonify({
            'message': '資料更新成功',
            'user': user.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """修改密碼（已登入用戶）"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': '用戶不存在'}), 404

        data = request.get_json()
        old_password = data.get('old_password')
        new_password = data.get('new_password')

        if not old_password or not new_password:
            return jsonify({'error': '請提供舊密碼和新密碼'}), 400

        # 驗證舊密碼
        if not user.check_password(old_password):
            return jsonify({'error': '舊密碼錯誤'}), 401

        # 驗證新密碼
        if len(new_password) < 6:
            return jsonify({'error': '新密碼至少需要 6 個字符'}), 400

        if old_password == new_password:
            return jsonify({'error': '新密碼不能與舊密碼相同'}), 400

        # 更新密碼
        user.set_password(new_password)
        db.session.commit()

        return jsonify({'message': '密碼修改成功'}), 200

    except Exception as e:
        db.session.rollback()
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


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """請求密碼重置 - 生成重置 token"""
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({'error': '請提供 email'}), 400

        # 查找用戶
        user = User.query.filter_by(email=email).first()
        if not user:
            # 為了安全性，即使用戶不存在也返回成功消息
            return jsonify({
                'message': '如果該郵箱存在，重置鏈接已發送',
                'note': '請檢查您的郵箱'
            }), 200

        # 生成重置 token（15 分鐘有效）
        from datetime import timedelta
        reset_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(minutes=15),
            additional_claims={'type': 'password_reset'}
        )

        # TODO: 未來可以在這裡發送郵件
        # send_reset_email(user.email, reset_token)

        return jsonify({
            'message': '密碼重置 token 已生成',
            'reset_token': reset_token,
            'expires_in': '15 分鐘',
            'note': '請妥善保管此 token，使用它來重置密碼'
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/reset-password', methods=['POST'])
@jwt_required()
def reset_password():
    """使用重置 token 重置密碼"""
    try:
        # 獲取 JWT claims
        from flask_jwt_extended import get_jwt
        claims = get_jwt()

        # 驗證這是密碼重置 token
        if claims.get('type') != 'password_reset':
            return jsonify({'error': '無效的重置 token'}), 401

        data = request.get_json()
        new_password = data.get('new_password')

        if not new_password:
            return jsonify({'error': '請提供新密碼'}), 400

        if len(new_password) < 6:
            return jsonify({'error': '密碼至少需要 6 個字符'}), 400

        # 獲取用戶 ID 並更新密碼
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': '用戶不存在'}), 404

        # 更新密碼
        user.set_password(new_password)
        db.session.commit()

        return jsonify({
            'message': '密碼重置成功',
            'note': '請使用新密碼登入'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
