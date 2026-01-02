"""
搜尋路由
Search Routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Todo, Note
from sqlalchemy import or_

search_bp = Blueprint('search', __name__, url_prefix='/api/search')


@search_bp.route('/', methods=['GET'])
@jwt_required()
def search_all():
    """全局搜尋 - 搜尋待辦事項和筆記"""
    try:
        user_id = int(get_jwt_identity())
        query = request.args.get('q', '').strip()

        if not query:
            return jsonify({'error': '請提供搜尋關鍵字'}), 400

        if len(query) < 2:
            return jsonify({'error': '搜尋關鍵字至少需要 2 個字元'}), 400

        # 搜尋待辦事項
        todos = Todo.query.filter(
            Todo.user_id == user_id,
            or_(
                Todo.title.ilike(f'%{query}%'),
                Todo.description.ilike(f'%{query}%'),
                Todo.tags.ilike(f'%{query}%')
            )
        ).order_by(Todo.created_at.desc()).limit(20).all()

        # 搜尋筆記
        notes = Note.query.filter(
            Note.user_id == user_id,
            or_(
                Note.title.ilike(f'%{query}%'),
                Note.content.ilike(f'%{query}%'),
                Note.tags.ilike(f'%{query}%'),
                Note.category.ilike(f'%{query}%')
            )
        ).order_by(Note.updated_at.desc()).limit(20).all()

        return jsonify({
            'query': query,
            'results': {
                'todos': [todo.to_dict() for todo in todos],
                'notes': [note.to_dict() for note in notes],
                'total': len(todos) + len(notes)
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@search_bp.route('/todos', methods=['GET'])
@jwt_required()
def search_todos():
    """搜尋待辦事項"""
    try:
        user_id = int(get_jwt_identity())
        query = request.args.get('q', '').strip()
        limit = request.args.get('limit', 20, type=int)

        if not query:
            return jsonify({'error': '請提供搜尋關鍵字'}), 400

        todos = Todo.query.filter(
            Todo.user_id == user_id,
            or_(
                Todo.title.ilike(f'%{query}%'),
                Todo.description.ilike(f'%{query}%'),
                Todo.tags.ilike(f'%{query}%')
            )
        ).order_by(Todo.created_at.desc()).limit(limit).all()

        return jsonify({
            'query': query,
            'results': [todo.to_dict() for todo in todos],
            'total': len(todos)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@search_bp.route('/notes', methods=['GET'])
@jwt_required()
def search_notes():
    """搜尋筆記"""
    try:
        user_id = int(get_jwt_identity())
        query = request.args.get('q', '').strip()
        limit = request.args.get('limit', 20, type=int)

        if not query:
            return jsonify({'error': '請提供搜尋關鍵字'}), 400

        notes = Note.query.filter(
            Note.user_id == user_id,
            or_(
                Note.title.ilike(f'%{query}%'),
                Note.content.ilike(f'%{query}%'),
                Note.tags.ilike(f'%{query}%'),
                Note.category.ilike(f'%{query}%')
            )
        ).order_by(Note.updated_at.desc()).limit(limit).all()

        return jsonify({
            'query': query,
            'results': [note.to_dict() for note in notes],
            'total': len(notes)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
