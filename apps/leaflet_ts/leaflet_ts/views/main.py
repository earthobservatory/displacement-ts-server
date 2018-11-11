from datetime import datetime
from subprocess import check_output
import hashlib
from flask import render_template, Blueprint, g, redirect, session, request, url_for, flash, abort
from flask_login import login_required, login_user, logout_user, current_user
from flask import request
from leaflet_ts import app, db, lm
from leaflet_ts.models.user import User
from leaflet_ts.lib.forms import LoginForm
from leaflet_ts.lib.ldap import ldap_user_verified
import re

mod = Blueprint('views/main', __name__)

# get public ip
PUBLIC_IP = check_output(
    ['dig', '@resolver1.opendns.com', '+short', 'myip.opendns.com']).strip()


@lm.user_loader
def load_user(username):
    return User.query.get(username)


@app.before_request
def before_request():
    g.user = current_user


@app.errorhandler(404)
def page_not_found(e):
    error_msg = """Error code 404: Page doesn't exist. Please check the URL. 
                   If you feel there is an issue with our application, 
                   please contact geraldjohn.m.manipon__at__jpl.nasa.gov."""
    return render_template(
        'error.html',
        title='HySDS Resource Management: Encountered Error',
        current_year=datetime.now().year,
        error_msg=error_msg), 404


@app.errorhandler(500)
def internal_server_error(e):
    return render_template(
        'error.html',
        title='HySDS Resource Management: Encountered Error',
        current_year=datetime.now().year,
        error_msg="Error code 500: " + str(e)), 500


@app.errorhandler(501)
def unimplemented(e):
    return render_template(
        'error.html',
        title='HySDS Resource Management: Encountered Error',
        current_year=datetime.now().year,
        error_msg="Error code 501: " + str(e)), 501


REG = re.compile(":\d*")


@app.after_request
def add_cors_header(response):
    '''
   Adds a CORs response header to the response
   '''
    host = request.headers.get("Host")
    host = REG.sub("", host)
    response.headers['Access-Control-Allow-Origin'] = host
    return response


@mod.route('/login', methods=['GET', 'POST'])
def login():
    if g.user is not None and g.user.is_authenticated:
        return redirect(url_for('views/main.index'))
    form = LoginForm()
    if form.validate_on_submit():
        #session['remember_me'] = form.remember_me.data
        username = form.username.data
        password = form.password.data
        # authenticate ops user account
        if username == app.config['OPS_USER']:
            ops_passwd_hex = hashlib.sha224(password).hexdigest()
            if app.config['OPS_PASSWORD_HASH'] == ops_passwd_hex:
                ldap_info = {}
            else:
                ldap_info = None
        else:
            # for everyone else authenticate via LDAP
            ldap_info = ldap_user_verified(username, password)
        if ldap_info is not None:
            user = load_user(username)
            #app.logger.info('user loaded: %s' % user)
            if user is None:
                user = User()
                user.id = form.username.data
                user.ldap_info = ldap_info
                db.session.add(user)
                db.session.commit()
            #app.logger.info('user: %s' % user)
            login_user(user)
            flash("Successfully authenticated.")
            return redirect(
                request.args.get('next') or url_for('views/main.index'))
        flash("Error trying to authenticate.")
    else:
        for error in form.errors:
            flash('%s: %s' % (error, '; '.join(form.errors[error])))
    return render_template(
        'login.html',
        title='ARIA Time-Series',
        form=form,
        current_year=datetime.now().year)


@mod.route('/logout')
def logout():
    logout_user()
    flash("Successfully logged out.")
    return redirect(url_for('views/main.index'))


@mod.route('/')
def index():
    #app.logger.debug("Got here")
    now = datetime.utcnow()
    return render_template(
        'index.html',
        title='ARIA Time-Series',
        last_updated=now.isoformat() + 'Z',
        current_year=now.year)
