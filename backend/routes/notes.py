"""
筆記路由
Notes Routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Note

notes_bp = Blueprint('notes', __name__, url_prefix='/api/notes')


@notes_bp.route('/', methods=['GET'])
@jwt_required()
def get_notes():
    """獲取用戶的所有筆記"""
    try:
        user_id = int(get_jwt_identity())

        # 查詢參數
        category = request.args.get('category')
        pinned = request.args.get('pinned')

        query = Note.query.filter_by(user_id=user_id)

        if category:
            query = query.filter_by(category=category)

        if pinned is not None:
            query = query.filter_by(pinned=pinned.lower() == 'true')

        notes = query.order_by(Note.pinned.desc(), Note.updated_at.desc()).all()

        return jsonify([note.to_dict() for note in notes]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notes_bp.route('/', methods=['POST'])
@jwt_required()
def create_note():
    """創建新筆記"""
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

        note = Note(
            user_id=user_id,
            title=data['title'],
            content=data.get('content', ''),
            category=data.get('category'),
            tags=tags_value,
            color=data.get('color', 'yellow'),
            pinned=data.get('pinned', False)
        )

        db.session.add(note)
        db.session.commit()

        return jsonify(note.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@notes_bp.route('/<int:note_id>', methods=['PUT'])
@jwt_required()
def update_note(note_id):
    """更新筆記"""
    try:
        user_id = int(get_jwt_identity())
        note = Note.query.filter_by(id=note_id, user_id=user_id).first()

        if not note:
            return jsonify({'error': '筆記不存在'}), 404

        data = request.get_json()

        if 'title' in data:
            note.title = data['title']
        if 'content' in data:
            note.content = data['content']
        if 'category' in data:
            note.category = data['category']
        if 'tags' in data:
            # 處理 tags - 接受字串或陣列
            tags_input = data['tags']
            if isinstance(tags_input, list):
                note.tags = ','.join(tags_input) if tags_input else None
            elif isinstance(tags_input, str):
                note.tags = tags_input if tags_input.strip() else None
            else:
                note.tags = None
        if 'color' in data:
            note.color = data['color']
        if 'pinned' in data:
            note.pinned = data['pinned']

        db.session.commit()

        return jsonify(note.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@notes_bp.route('/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    """刪除筆記"""
    try:
        user_id = int(get_jwt_identity())
        note = Note.query.filter_by(id=note_id, user_id=user_id).first()

        if not note:
            return jsonify({'error': '筆記不存在'}), 404

        db.session.delete(note)
        db.session.commit()

        return jsonify({'message': '刪除成功'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
