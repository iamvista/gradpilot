"""
GradPilot 2.0 - Flask 主應用
Graduate Student Learning Dashboard
"""

from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
import os
from datetime import datetime

from config import config
from models import db
from routes import auth_bp, todos_bp, notes_bp, pomodoro_bp, dashboard_bp


def create_app(config_name=None):
    """應用工廠函數"""

    app = Flask(__name__)
    app.url_map.strict_slashes = False  # 禁用嚴格斜線，避免 CORS 預檢重定向

    # 載入配置
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app.config.from_object(config[config_name])

    # 生產環境檢查
    if config_name == 'production':
        config[config_name].init_app(app)

    # 初始化擴展
    db.init_app(app)
    jwt = JWTManager(app)

    # 配置 CORS - 允許所有必要的方法和標頭
    CORS(app,
         origins=app.config['CORS_ORIGINS'],
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         expose_headers=['Content-Type', 'Authorization'])

    migrate = Migrate(app, db)

    # 註冊藍圖
    app.register_blueprint(auth_bp)
    app.register_blueprint(todos_bp)
    app.register_blueprint(notes_bp)
    app.register_blueprint(pomodoro_bp)
    app.register_blueprint(dashboard_bp)

    # 健康檢查端點
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'gradpilot-v2',
            'version': '2.0.0'
        }), 200

    # JWT 調試端點（僅用於排查問題）
    @app.route('/debug/jwt-config')
    def debug_jwt_config():
        """顯示 JWT 配置信息（不包含敏感密鑰）"""
        import hashlib
        jwt_key = app.config.get('JWT_SECRET_KEY', '')
        jwt_key_hash = hashlib.sha256(jwt_key.encode()).hexdigest()[:16] if jwt_key else 'NOT_SET'

        return jsonify({
            'jwt_secret_key_hash': jwt_key_hash,
            'jwt_access_token_expires': str(app.config.get('JWT_ACCESS_TOKEN_EXPIRES')),
            'flask_env': os.environ.get('FLASK_ENV'),
            'has_jwt_secret': bool(jwt_key and jwt_key != 'jwt-secret-key-change-in-production')
        }), 200

    # 根路徑
    @app.route('/')
    def index():
        return jsonify({
            'message': 'GradPilot 2.0 API',
            'version': '2.0.0',
            'endpoints': {
                'auth': '/api/auth',
                'todos': '/api/todos',
                'notes': '/api/notes',
                'pomodoro': '/api/pomodoro',
                'dashboard': '/api/dashboard'
            }
        }), 200

    # JWT 錯誤處理
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token 已過期',
            'message': '請重新登入'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'error': 'Token 無效',
            'message': f'請提供有效的 Token: {str(error)}'
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'error': '缺少 Token',
            'message': '請先登入'
        }), 401

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        """當 JWT token 有效時，加載用戶資料"""
        from models import User
        user_id = jwt_data["sub"]
        return User.query.filter_by(id=user_id).first()

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token 已被撤銷',
            'message': '請重新登入'
        }), 401

    # 創建資料庫表（延遲執行，避免啟動時因資料庫未就緒而失敗）
    @app.before_request
    def ensure_tables():
        """在第一次請求時創建資料庫表"""
        if not hasattr(app, '_tables_created'):
            try:
                db.create_all()
                app._tables_created = True
            except Exception as e:
                app.logger.warning(f"無法創建資料庫表：{e}")
                # 不拋出異常，允許健康檢查等端點正常運作

    return app


# 用於開發環境直接運行
if __name__ == '__main__':
    app = create_app('development')
    app.run(host='0.0.0.0', port=5000, debug=True)
