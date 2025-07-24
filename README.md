# Challenge Backend

Microservicio backend en Node.js para procesamiento eficiente de archivos `.dat` de clientes y volcado en SQL Server. El sistema está preparado para ejecutarse en contenedores Docker y es ideal para entornos Kubernetes.

---

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) y [Docker Compose](https://docs.docker.com/compose/install/) instalados en tu sistema.
- Git instalado para clonar el repositorio.
- Node.js y npm instalados (solo si quieres correr scripts npm desde la terminal).

---

## Pasos para correr el proyecto

### 1. Clonar el repositorio

```sh
git clone <URL_DEL_REPOSITORIO>
cd challenge-backend
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y edítalo si es necesario:

```sh
cp .env.sample .env
```

Asegúrate de que los valores en `.env` sean correctos para tu entorno. Por defecto, ya están configurados para funcionar con el stack Docker incluido.

### 3. Construir y levantar los servicios con Docker

El proyecto incluye scripts npm para facilitar el manejo de los contenedores. Desde la raíz del proyecto, ejecuta:

```sh
npm run docker:up
```

Esto levantará dos servicios:
- **db**: SQL Server con la tabla de clientes ya creada.
- **app**: El microservicio Node.js que procesará los archivos `.dat` de la carpeta `data`.

Para detener los servicios, ejecuta:

```sh
npm run docker:down
```

### 4. Procesamiento de archivos

Coloca tus archivos `.dat` en la carpeta `data/` en la raíz del proyecto.  
El servicio procesará automáticamente todos los archivos existentes al iniciar y quedará escuchando por nuevos archivos que se agreguen.

### 5. Endpoint de health

Puedes verificar que el servicio está corriendo accediendo a:

```
http://localhost:3000/health
```

---

## Estructura del proyecto

- `src/` - Código fuente del microservicio.
- `data/` - Carpeta donde se colocan los archivos `.dat` a procesar.
- `docker/` - Archivos de configuración de Docker y Docker Compose.
- `docs/` - Documentación técnica y decisiones de arquitectura.
- `scripts/` - Script SQL para crear la tabla de destino en SQL Server.

---

## Notas

- El servicio está preparado para funcionar en entornos con recursos limitados (ver sección de recursos en la documentación).
- Los logs y errores se gestionan con Pino y se pueden centralizar fácilmente en producción.
- Para inicializar la base de datos manualmente puedes usar:
  ```sh
  npm run db:init
  ```

---

## Soporte

Para dudas o problemas, revisa la documentación en `docs/` o abre un issue en el repositorio.
