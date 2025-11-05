#!/bin/sh

# 1. Ejecutar las migraciones
echo "Ejecutando migraciones (base de datos default)..."
python manage.py makemigrations api
python manage.py migrate --database=default

echo "Ejecutando migraciones (base de datos log_saas)..."
python manage.py migrate --database=log_saas

echo "Ejecutando migraciones (base de datos analytics_saas)..."
python manage.py migrate --database=analytics_saas

# 2. Cargar los datos iniciales
echo "Cargando datos iniciales (seed_data)..."
python manage.py seed_data

# 3. Iniciar el servidor
echo "Iniciando el servidor de Django..."
exec "$@"