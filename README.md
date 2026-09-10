# Full Stack con Docker

Proyecto de ejemplo: **Backend** (Node/Express + MySQL) + **Frontend** (Astro + React), orquestados con `docker-compose`. Basado en el ejercicio de clase, con los errores del video ya corregidos.

## Estructura

```
fullstack-docker/
├── backend/
│   ├── src/index.js
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/pages/index.astro
│   ├── src/components/TaskList.jsx
│   ├── astro.config.mjs
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── db/
│   └── init.sql
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Cómo correrlo

```bash
git init
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend (API): http://localhost:3000/api/health
- MySQL: puerto 3306 (user: `user`, password: `secret`, db: `app_db`)

Para reiniciar todo desde cero (útil si cambias `db/init.sql`, que solo se ejecuta la primera vez que el volumen se crea):

```bash
docker compose down -v
docker compose up --build
```

## Errores del video que ya están corregidos aquí

1. **Versión de Node**: Astro reciente no soporta Node 20 en algunos casos → se usa `node:22-alpine` en ambos Dockerfiles.
2. **Ruta de `db/init.sql`**: el volumen en `docker-compose.yml` apunta a `./db/init.sql` (raíz del proyecto), no dentro de `backend/`.
3. **Nombre de la tabla**: `task` en `init.sql` debe coincidir exactamente con las queries del backend (`SELECT * FROM task`).
4. **`TaskList.jsx`**: se corrigió un paréntesis faltante y se usa una URL de API relativa (`/api`) para que pase por el proxy de Nginx y no falle por CORS.
5. **`nginx.conf`**: `proxy_pass` apunta a la ruta completa `http://backend:3000/api/` (en el video quedaba incompleta) y se agregaron los `;` faltantes.
6. **Rutas de Nginx**: `root /usr/share/nginx/html;` en vez de `/usr/share/html` (ruta estándar de la imagen `nginx:alpine`), y el `COPY --from=build` del Dockerfile del frontend coincide con esa ruta.

## Tareas pendientes (las que el profe te dejó)

En `backend/src/index.js`, agregar:
- `PUT /api/tasks/:id` → marcar tarea como completada
- `DELETE /api/tasks/:id` → eliminar tarea

Y opcionalmente reflejar esas acciones en `TaskList.jsx` (checkbox para completar, botón para borrar).
