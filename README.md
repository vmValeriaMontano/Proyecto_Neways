# 🛍️ Sitio Web "Neways" 

Plataforma web de comercio electrónico desarrollada para la gestión, exhibición y venta de productos (categorías: *Mujer, Accesorios y Gift Cards*), con soporte para la estructura geográfica y municipal de El Salvador, catálogo interactivo y panel administrativo.

---

## Proyecto

> **⚠️ Importante:** Los últimos commits de la rama `main` corresponden únicamente a configuraciones de despliegue para una **vista previa de prueba**: https://proyecto-neways-1.onrender.com/

Para evitar errores de configuración o incompatibilidades de entorno al levantar el proyecto de forma local, **se recomienda comenzar a trabajar o revisar el código base desde el commit `47fad4b`** (última versión estable de desarrollo).

```bash
git checkout 47fad4b
```

---

## 🛠️ Stack Tecnológico

* **Frontend:** React / Vite
* **Backend:** Node.js / Express
* **Base de Datos:** PostgreSQL
* **Despliegue (Vista Previa):** Render

---

## 🚀 Instalación y Ejecución en Entorno Local

Sigue estos pasos en tu terminal para descargar el repositorio y levantar ambos servicios de manera local:

### 1. Clonar el repositorio y ubicarse en el commit estable
```bash
git clone https://github.com/vmValeriaMontano/Proyecto_Neways.git
cd Proyecto_Neways
git checkout 47fad4b
```

### 2. Configurar y ejecutar el Backend (`neways-backend`)
Abre una terminal, ingresa a la carpeta del servidor, instala las dependencias y levanta el entorno de desarrollo:
```bash
cd neways-backend
npm install
```

Antes de iniciar el servidor, asegúrate de configurar el archivo `.env` en la raíz de `neways-backend` con las credenciales de tu instancia local de PostgreSQL:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=neways_db
DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_contraseña_postgres
```

Luego, ejecuta el servidor:
```bash
npm run dev
```

### 3. Configurar y ejecutar el Frontend (`neways-frontend`)
En una **segunda terminal** (manteniendo el backend encendido), ingresa a la carpeta del cliente e inicia la interfaz web:
```bash
cd neways-frontend
npm install
npm run dev
```
