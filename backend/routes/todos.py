"""
待辦事項路由
Todo Routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Todo
from datetime import datetime

todos_bp = Blueprint('todos', __name__, url_prefix='/api/todos')


@todos_bp.route('/', methods=['GET'])
@jwt_required()
def get_todos():
    """獲取用戶的所有待辦事項"""
    try:
        user_id = int(get_jwt_identity())

        # 查詢參數
        completed = request.args.get('completed')
        priority = request.args.get('priority')

        query = Todo.query.filter_by(user_id=user_id)

        if completed is not None:
            query = query.filter_by(completed=completed.lower() == 'true')

        if priority:
            query = query.filter_by(priority=priority)

        todos = query.order_by(Todo.order.asc(), Todo.created_at.desc()).all()

        return jsonify([todo.to_dict() for todo in todos]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@todos_bp.route('/', methods=['POST'])
@jwt_required()
def create_todo():
    """創建新待辦事項"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        if not data.get('title'):
            return jsonify({'error': '標題不能為空'}), 400

        # 處理 tags - 接受字串或陣列
        tags_input = data.get('tags')
        if isinstance(tags_input, list):
            tags_value = ','.join(tags_input) if tags_input else None
        elif isinstance(tags_input, str):
            tags_value = tags_input if tags_input.strip() else None
        else:
            tags_value = None

        todo = Todo(
            user_id=user_id,
            title=data['title'],
            description=data.get('description', ''),
            priority=data.get('priority', 'medium'),
            tags=tags_value,
            due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None
        )

        db.session.add(todo)
        db.session.commit()

        return jsonify(todo.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@todos_bp.route('/<int:todo_id>', methods=['GET'])
@jwt_required()
def get_todo(todo_id):
    """獲取單個待辦事項"""
    try:
        user_id = int(get_jwt_identity())
        todo = Todo.query.filter_by(id=todo_id, user_id=user_id).first()

        if not todo:
            return jsonify({'error': '待辦事項不存在'}), 404

        return jsonify(todo.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@todos_bp.route('/<int:todo_id>', methods=['PUT'])
@jwt_required()
def update_todo(todo_id):
    """更新待辦事項"""
    try:
        user_id = int(get_jwt_identity())
        todo = Todo.query.filter_by(id=todo_id, user_id=user_id).first()

        if not todo:
            return jsonify({'error': '待辦事項不存在'}), 404

        data = request.get_json()

        if 'title' in data:
            todo.title = data['title']
        if 'description' in data:
            todo.description = data['description']
        if 'completed' in data:
            todo.completed = data['completed']
            if data['completed']:
                todo.completed_at = datetime.utcnow()
            else:
                todo.completed_at = None
        if 'priority' in data:
            todo.priority = data['priority']
        if 'tags' in data:
            # 處理 tags - 接受字串或陣列
            tags_input = data['tags']
            if isinstance(tags_input, list):
                todo.tags = ','.join(tags_input) if tags_input else None
            elif isinstance(tags_input, str):
                todo.tags = tags_input if tags_input.strip() else None
            else:
                todo.tags = None
        if 'due_date' in data:
            todo.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None
        if 'order' in data:
            todo.order = data['order']

        db.session.commit()

        return jsonify(todo.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@todos_bp.route('/<int:todo_id>', methods=['DELETE'])
@jwt_required()
def delete_todo(todo_id):
    """刪除待辦事項"""
    try:
        user_id = int(get_jwt_identity())
        todo = Todo.query.filter_by(id=todo_id, user_id=user_id).first()

        if not todo:
            return jsonify({'error': '待辦事項不存在'}), 404

        db.session.delete(todo)
        db.session.commit()

        return jsonify({'message': '刪除成功'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
