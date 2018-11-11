from setuptools import setup, find_packages

setup(
    name='leaflet_ts',
    version='0.1',
    long_description='Leaflet Time-Series Web App',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        "flask", "flask-sqlalchemy", "flask-login", "wtforms", "flask-wtf"
    ])
