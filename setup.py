import os
import re
from setuptools import find_packages, setup


def get_version(*file_paths):
    """Retrieves the version from specific file"""
    filename = os.path.join(os.path.dirname(__file__), *file_paths)
    version_file = open(filename).read()
    version_match = re.search(r"^__version__ = ['\"]([^'\"]*)['\"]", version_file, re.M)
    if version_match:
        return version_match.group(1)
    raise RuntimeError('Unable to find version string.')


version = get_version("htmx_forms", "__init__.py")
readme = open('README.md').read()
history = open('CHANGELOG.md').read().replace('.. :changelog:', '')


setup(name='django-htmx-forms',
      version=version,
      description='A Django helper app to add editing capabilities to the frontend using Django, HTMX and modal forms.',
      long_description=readme + '\n\n' + history,
      long_description_content_type='text/markdown',
      url='http://github.com/morlandi/django-htmx-forms',
      author='Mario Orlandi',
      author_email='morlandi@brainstorm.it',
      license='MIT',
      include_package_data=True,
      packages=find_packages(),
      zip_safe=False,
      classifiers=[
        'Development Status :: 2 - Pre-Alpha',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Framework :: Django',
        'Framework :: Django :: 5.0',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Natural Language :: English',
        'Programming Language :: Python :: 3.12',
    ],
)
