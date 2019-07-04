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

# define private EC2 IP addresses from .sds/config for time series server host
context = {}
this_dir = os.path.dirname(os.path.abspath(__file__))
#sds_cfg = get_user_config_path()
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


def update_ts_server():
    # updates leaflet time series server with displacement-ts-server repo
    role, hysds_dir, hostname = resolve_role()
    if role == 'leaflet_serv':
        if exists('%s/ops/displacement-ts-server' % hysds_dir) is True:    
            sudo_rm_rf('%s/ops/displacement-ts-server' % hysds_dir)
        update_verdi(context)
    if role == 'leaflet_serv':
        rsync_project('%s/ops/' % hysds_dir, '~/mozart/ops/displacement-ts-server',
                      ssh_opts="-o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no")
        cp_rp('~/verdi/ops/displacement-ts-server/verdi_configs/supervisord.conf', '~/verdi/etc/') 
        

def test():
    # Test fabric function
    print(resolve_role())
    run('whoami')
