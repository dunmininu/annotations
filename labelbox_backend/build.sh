#!/usr/bin/env bash
# Exit on error
set -o errexit

cd labelbox_backend

# Install Python dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate