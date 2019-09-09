from sdscli.adapters.hysds.fabfile import *
from sdscli.adapters.hysds.fabfile import resolve_role as rr
from sdscli.conf_utils import get_user_config_path, get_user_files_path
from sdscli.adapters.hysds.update import update_verdi
from fabric.contrib.files import exists
import yaml
import os


#####################################
# Add Leaflet Time Series Server role 
#####################################

# define private EC2 IP address from .sds/tss_config for time series server host
context = {}
this_dir = os.path.dirname(os.path.abspath(__file__))
sds_cfg = os.path.expanduser(os.path.join('~', '.sds', 'tss_config'))
if not os.path.isfile(sds_cfg):
    raise RuntimeError("SDS configuration file doesn't exist. Run 'sds configure'.")
with open(sds_cfg) as f:
    context = yaml.load(f,Loader=yaml.FullLoader)

ts_host = '%s' % context['TS_PVT_IP']
env.roledefs['leaflet_serv'] = [ts_host]
env.roledefs['verdi'] = [ts_host]

def resolve_role():
    # assign hysds_dir to leaflet serv role
    role, hysds_dir, hostname = rr()
    if role == 'leaflet_serv':
        hysds_dir = 'verdi'
    return role, hysds_dir, hostname

def send_celeryconf(node_type):
    # send celeryconfig.py from mozart to leaflet server
    ctx = get_context(node_type)
    template_dir = os.path.join(ops_dir, 'mozart/ops/hysds/configs/celery')
    if node_type == 'mozart':
        base_dir = "mozart"
    elif node_type == 'metrics':
        base_dir = "metrics"
    elif node_type in ('verdi', 'verdi-asg', 'leaflet_serv'):
        base_dir = "verdi"
    elif node_type == 'grq':
        base_dir = "sciflo"
    else:
        raise RuntimeError("Unknown node type: %s" % node_type)
    tmpl = 'celeryconfig.py.tmpl'
    user_path = get_user_files_path()
    if node_type == 'leaflet_serv':
        tmpl_asg = 'celeryconfig.py.tmpl.asg'
        if os.path.exists(os.path.join(user_path, tmpl_asg)):
            tmpl = tmpl_asg
    dest_file = '~/%s/ops/hysds/celeryconfig.py' % base_dir
    upload_template(tmpl, dest_file, use_jinja=True, context=ctx,
                    template_dir=resolve_files_dir(tmpl, template_dir))

def update_ts_server():
    # updates leaflet time series server with displacement-ts-server repo
    role, hysds_dir, hostname = resolve_role()
    if role == 'leaflet_serv':
        if exists('%s/ops/displacement-ts-server' % hysds_dir) is True:    
            sudo_rm_rf('%s/ops/displacement-ts-server' % hysds_dir)
        update_verdi(context)
        send_celeryconf(role)
        rsync_project('%s/ops/' % hysds_dir, '~/mozart/ops/displacement-ts-server',
                      ssh_opts="-o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no")
        cp_rp('~/verdi/ops/displacement-ts-server/verdi_configs/supervisord.conf', '~/verdi/etc/')

def test():
    # Test fabric function
    print(resolve_role())
    run('whoami')
