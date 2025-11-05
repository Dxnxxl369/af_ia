# Sistema de Gestión de Activos Fijos (SaaS)

Este proyecto es una aplicación web y móvil diseñada para la gestión integral de activos fijos de una empresa, siguiendo un modelo de Software como Servicio (SaaS). Permite a las organizaciones registrar, rastrear, y administrar el ciclo de vida completo de sus activos de manera eficiente.

## 📜 Descripción

El sistema se compone de tres partes principales:

1.  **Backend (API REST):** Construido con Django y Django REST Framework, se encarga de toda la lógica de negocio, gestión de datos, autenticación de usuarios y comunicación con la base de datos.
2.  **Frontend (Aplicación Web):** Una interfaz de usuario moderna y reactiva desarrollada con React, Vite y Tailwind CSS, que consume la API del backend para ofrecer una experiencia de usuario fluida en el navegador.
3.  **Aplicación Móvil:** Desarrollada en Flutter, proporciona funcionalidades clave para la gestión de activos sobre la marcha, disponible para plataformas iOS y Android.

El proyecto está completamente contenedorizado usando Docker, lo que facilita su configuración, despliegue y escalabilidad.

## ✨ Características Principales

- **Gestión de Activos:** Registro, edición, y seguimiento de activos fijos.
- **Control de Usuarios:** Sistema de roles y permisos para empleados.
- **Autenticación Segura:** Implementación de JSON Web Tokens (JWT) para proteger la API.
- **Organización:** Administración de departamentos, ubicaciones, categorías y más.
- **Reportes:** Generación de informes en formatos como PDF y Excel.
- **Notificaciones:** Sistema de alertas para eventos importantes (con planes de implementación de WebSockets para notificaciones en tiempo real).
- **Interfaz Personalizable:** Opciones de temas y colores para los usuarios.

## 🧬 Modelo de Datos (Entidades Principales)

A continuación se listan las tablas más importantes de la base de datos principal (`af_saas`):

- **Empresa:** El núcleo del modelo SaaS, a la que se asocian la mayoría de los demás datos.
- **Empleado:** Representa a los usuarios del sistema. Se vincula a un `User` de Django, una `Empresa`, un `Cargo` y `Roles`.
- **ActivoFijo:** El objeto central de la aplicación. Contiene detalles como valor, vida útil y sus relaciones con `Departamento`, `CategoriaActivo`, `Estado`, `Ubicacion` y `Proveedor`.
- **Mantenimiento:** Registra las operaciones de mantenimiento (preventivo/correctivo) sobre un `ActivoFijo`, asignadas a un `Empleado`.
- **RevalorizacionActivo:** Historial de cambios de valor de un `ActivoFijo`.
- **Presupuesto:** Montos asignados a un `Departamento` para un periodo.
- **Suscripcion:** Gestiona el plan (`Básico`, `Profesional`, etc.) y los límites de una `Empresa`.
- **Notificacion:** Almacena mensajes y alertas para un `User` (destinatario).
- **Roles y Permisos:** Definen qué acciones puede realizar cada `Empleado`.
- **Modelos de Soporte:** `Departamento`, `Cargo`, `CategoriaActivo`, `Estado`, `Ubicacion`, `Proveedor`.

Además, el sistema utiliza otras bases de datos para:
- **Logs:** (`log_saas`) para registrar la actividad de los usuarios.
- **Analíticas:** (`analytics_saas`) para almacenar predicciones de IA sobre mantenimiento y presupuestos.

## 🚀 Tecnologías Utilizadas

### Backend (Python)
- **Framework:** Django, Django REST Framework
- **Base de Datos:** PostgreSQL
- **Autenticación:** Simple JWT
- **Servidor WSGI:** Gunicorn
- **Otros:** Pillow (manejo de imágenes), openpyxl/reportlab (reportes)

### Frontend (JavaScript/React)
- **Framework/Librería:** React
- **Bundler:** Vite
- **Estilos:** Tailwind CSS, DaisyUI
- **Routing:** React Router
- **Cliente HTTP:** Axios
- **Iconos:** Lucide React, React Icons

### Móvil (Dart/Flutter)
- **Framework:** Flutter
- **Gestión de Estado:** Provider
- **Cliente HTTP:** http
- **Almacenamiento Local:** Shared Preferences
- **Iconos:** Lucide Flutter

### Infraestructura
- **Contenedorización:** Docker, Docker Compose

## ⚙️ Instalación y Puesta en Marcha

Este proyecto está diseñado para ejecutarse con Docker y Docker Compose, eliminando la necesidad de instalar manualmente las dependencias en su máquina local.

### Prerrequisitos
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/) (generalmente incluido con Docker Desktop)

### Pasos para la Ejecución

1.  **Clonar el Repositorio:**
    ```bash
    git clone <URL-DEL-REPOSITORIO>
    cd af_ia
    ```

2.  **Levantar los Contenedores:**
    Desde el directorio raíz del proyecto, ejecute el siguiente comando:
    ```bash
    docker-compose up --build
    ```
    Este comando construirá las imágenes de los contenedores (si es la primera vez) y los iniciará.

    - El **Backend** estará disponible en `http://localhost:8000`.
    - El **Frontend** estará accesible en `http://localhost:5173`.
    - La base de datos **PostgreSQL** se ejecutará en el puerto `5432` (accesible solo para los otros contenedores).

3.  **Crear un Superusuario (Opcional):**
    Para acceder al panel de administración de Django, puede crear un superusuario. Abra otra terminal y ejecute:
    ```bash
    docker-compose exec backend python manage.py createsuperuser
    ```
    Siga las instrucciones para crear su cuenta de administrador.

4.  **Acceder a la Aplicación:**
    - Abra su navegador y vaya a `http://localhost:5173` para usar la aplicación web.
    - Para la aplicación móvil, deberá configurar un emulador o dispositivo físico y ejecutar el proyecto desde la carpeta `movil/` con el SDK de Flutter.

## 📁 Estructura del Proyecto

```
af_ia/
├── backend/         # Proyecto Django (API REST)
├── frontend3/       # Proyecto React (Aplicación Web)
├── movil/           # Proyecto Flutter (Aplicación Móvil)
├── docker-compose.yml # Orquestación de los servicios
└── README.md        # Este archivo
```
