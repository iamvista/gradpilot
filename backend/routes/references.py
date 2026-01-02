"""
文獻管理 API
References Management API Routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Reference
from references import ReferenceParser, ReferenceFormatter, APIClient
from sqlalchemy import or_

references_bp = Blueprint('references', __name__, url_prefix='/api/references')

# 初始化服務
parser = ReferenceParser()
api_client = APIClient()


@references_bp.route('/parse', methods=['POST'])
@jwt_required()
def parse_reference():
    """
    解析文獻
    POST /api/references/parse
    Body: { "text": "文獻文字", "enrich": true/false }
    """
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({'error': '缺少文獻文字'}), 400

    text = data['text'].strip()
    enrich = data.get('enrich', True)

    if not text:
        return jsonify({'error': '文獻文字不能為空'}), 400

    try:
        # 解析文獻
        parsed = parser.parse_reference(text)

        # 如果需要補全且有 DOI 或標題
        if enrich and (parsed.get('doi') or parsed.get('title')):
            parsed = api_client.enrich_reference(parsed)

        return jsonify({
            'success': True,
            'data': parsed
        }), 200

    except Exception as e:
        return jsonify({'error': f'解析失敗: {str(e)}'}), 500


@references_bp.route('/', methods=['GET'])
@jwt_required()
def get_references():
    """
    獲取文獻列表
    GET /api/references?type=article&tags=machine learning&search=title keyword
    """
    user_id = int(get_jwt_identity())

    # 獲取查詢參數
    ref_type = request.args.get('type')
    tags = request.args.get('tags')
    search = request.args.get('search')
    sort = request.args.get('sort', 'created_at')  # created_at, updated_at, year, title
    order = request.args.get('order', 'desc')  # asc, desc

    # 構建查詢
    query = Reference.query.filter_by(user_id=user_id)

    # 篩選類型
    if ref_type:
        query = query.filter_by(reference_type=ref_type)

    # 篩選標籤
    if tags:
        query = query.filter(Reference.tags.ilike(f'%{tags}%'))

    # 搜尋
    if search:
        query = query.filter(
            or_(
                Reference.title.ilike(f'%{search}%'),
                Reference.journal.ilike(f'%{search}%'),
                Reference.notes.ilike(f'%{search}%')
            )
        )

    # 排序
    if sort == 'year':
        sort_column = Reference.year
    elif sort == 'title':
        sort_column = Reference.title
    elif sort == 'updated_at':
        sort_column = Reference.updated_at
    else:
        sort_column = Reference.created_at

    if order == 'asc':
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    references = query.all()

    return jsonify({
        'success': True,
        'count': len(references),
        'references': [ref.to_dict() for ref in references]
    }), 200


@references_bp.route('/', methods=['POST'])
@jwt_required()
def create_reference():
    """
    創建文獻
    POST /api/references
    Body: { ...reference data... }
    """
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or 'title' not in data:
        return jsonify({'error': '缺少標題'}), 400

    try:
        reference = Reference(
            user_id=user_id,
            title=data['title'],
            authors=data.get('authors', []),
            year=data.get('year'),
            journal=data.get('journal'),
            volume=data.get('volume'),
            issue=data.get('issue'),
            pages=data.get('pages'),
            publisher=data.get('publisher'),
            doi=data.get('doi'),
            url=data.get('url'),
            reference_type=data.get('type', 'article'),
            tags=data.get('tags', ''),
            notes=data.get('notes', ''),
            original_text=data.get('original_text', ''),
            confidence=data.get('confidence', 0.0),
            completeness=data.get('completeness', 0.0),
            enriched=data.get('enriched', False)
        )

        db.session.add(reference)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': '文獻創建成功',
            'reference': reference.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'創建失敗: {str(e)}'}), 500


@references_bp.route('/<int:ref_id>', methods=['GET'])
@jwt_required()
def get_reference(ref_id):
    """獲取單個文獻"""
    user_id = int(get_jwt_identity())

    reference = Reference.query.filter_by(id=ref_id, user_id=user_id).first()

    if not reference:
        return jsonify({'error': '文獻不存在'}), 404

    return jsonify({
        'success': True,
        'reference': reference.to_dict()
    }), 200


@references_bp.route('/<int:ref_id>', methods=['PUT'])
@jwt_required()
def update_reference(ref_id):
    """更新文獻"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    reference = Reference.query.filter_by(id=ref_id, user_id=user_id).first()

    if not reference:
        return jsonify({'error': '文獻不存在'}), 404

    try:
        # 更新允許的欄位
        updatable_fields = [
            'title', 'authors', 'year', 'journal', 'volume', 'issue',
            'pages', 'publisher', 'doi', 'url', 'reference_type',
            'tags', 'notes'
        ]

        for field in updatable_fields:
            if field in data:
                setattr(reference, field, data[field])

        db.session.commit()

        return jsonify({
            'success': True,
            'message': '文獻更新成功',
            'reference': reference.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'更新失敗: {str(e)}'}), 500


@references_bp.route('/<int:ref_id>', methods=['DELETE'])
@jwt_required()
def delete_reference(ref_id):
    """刪除文獻"""
    user_id = int(get_jwt_identity())

    reference = Reference.query.filter_by(id=ref_id, user_id=user_id).first()

    if not reference:
        return jsonify({'error': '文獻不存在'}), 404

    try:
        db.session.delete(reference)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': '文獻刪除成功'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'刪除失敗: {str(e)}'}), 500


@references_bp.route('/format', methods=['POST'])
@jwt_required()
def format_reference():
    """
    格式化文獻
    POST /api/references/format
    Body: { "reference": {...}, "style": "apa" }
    """
    data = request.get_json()

    if not data or 'reference' not in data:
        return jsonify({'error': '缺少文獻資料'}), 400

    reference_data = data['reference']
    style = data.get('style', 'apa').lower()

    try:
        formatted = ReferenceFormatter.format(reference_data, style)

        return jsonify({
            'success': True,
            'formatted': formatted,
            'style': style
        }), 200

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'格式化失敗: {str(e)}'}), 500


@references_bp.route('/export', methods=['GET'])
@jwt_required()
def export_references():
    """
    導出文獻為 BibTeX 格式
    GET /api/references/export?format=bibtex&ids=1,2,3
    """
    user_id = int(get_jwt_identity())
    format_type = request.args.get('format', 'bibtex')
    ids_str = request.args.get('ids')

    # 構建查詢
    query = Reference.query.filter_by(user_id=user_id)

    # 如果指定了 ID，只導出這些文獻
    if ids_str:
        ids = [int(id.strip()) for id in ids_str.split(',')]
        query = query.filter(Reference.id.in_(ids))

    references = query.all()

    if format_type == 'bibtex':
        bibtex_entries = []
        for ref in references:
            entry = _to_bibtex(ref)
            bibtex_entries.append(entry)

        bibtex_content = '\n\n'.join(bibtex_entries)

        return bibtex_content, 200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': 'attachment; filename=references.bib'
        }
    else:
        return jsonify({'error': '不支援的格式'}), 400


def _to_bibtex(reference):
    """將 Reference 物件轉換為 BibTeX 格式"""
    ref_type = reference.reference_type or 'article'

    # BibTeX key: 第一作者姓 + 年份
    if reference.authors and len(reference.authors) > 0:
        first_author = reference.authors[0].get('last', 'Unknown')
    else:
        first_author = 'Unknown'

    year = reference.year or 'n.d.'
    key = f"{first_author}{year}"

    # 作者列表
    authors_str = ' and '.join([
        f"{a.get('first', '')} {a.get('last', '')}"
        for a in reference.authors
    ]) if reference.authors else ''

    # 構建 BibTeX 條目
    lines = [f"@{ref_type}{{{key},"]

    if reference.title:
        lines.append(f"  title = {{{reference.title}}},")
    if authors_str:
        lines.append(f"  author = {{{authors_str}}},")
    if reference.year:
        lines.append(f"  year = {{{reference.year}}},")
    if reference.journal:
        lines.append(f"  journal = {{{reference.journal}}},")
    if reference.volume:
        lines.append(f"  volume = {{{reference.volume}}},")
    if reference.issue:
        lines.append(f"  number = {{{reference.issue}}},")
    if reference.pages:
        lines.append(f"  pages = {{{reference.pages}}},")
    if reference.publisher:
        lines.append(f"  publisher = {{{reference.publisher}}},")
    if reference.doi:
        lines.append(f"  doi = {{{reference.doi}}},")
    if reference.url:
        lines.append(f"  url = {{{reference.url}}},")

    lines.append("}")

    return '\n'.join(lines)


@references_bp.route('/styles', methods=['GET'])
@jwt_required()
def get_available_styles():
    """獲取所有可用的引用格式"""
    styles = ReferenceFormatter.get_available_styles()

    return jsonify({
        'success': True,
        'styles': styles
    }), 200
