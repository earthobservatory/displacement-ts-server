from flask import jsonify, Blueprint

from leaflet_ts import app

mod = Blueprint('services/main', __name__)


@mod.route('/services')
def index():
    return jsonify({'success': True, 'content': "Leaflet Time-Series app"})
