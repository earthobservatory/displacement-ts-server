from sdscli.adapters.hysds.fabfile import *
from sdscli.adapters.hysds.fabfile import resolve_role as rr
from sdscli.conf_utils import get_user_config_path, get_user_files_path
import yaml
import os

#####################################
# Add Leaflet Time Series Server role 
#####################################

# define private EC2 IP addresses from .sds/config for time series server host
context = {}
this_dir = os.path.dirname(os.path.abspath(__file__))
#sds_cfg = get_user_config_path()
sds_cfg = os.path.expanduser(os.path.join('~', '.sds', 'config.test'))
if not os.path.isfile(sds_cfg):
    raise RuntimeError("SDS configuration file doesn't exist. Run 'sds configure'.")
print(sds_cfg)
with open(sds_cfg) as f:
    context = yaml.load(f,Loader=yaml.FullLoader)
    print(context)
