# 📘 Documento Maestro — Ruta de Progresión (Career Tracker)

## 1. Resumen
SPA single-file (`index.html`, HTML+CSS+JS vanilla, sin dependencias de build) que gestiona
una ruta de estudio IT. Estado persistido en `localStorage` (keys `ruta-it-v6`, `ruta-it-log-v6`).
Este documento define cómo migrarla a una arquitectura con base de datos y Docker.

## 2. Reglas de negocio
| Regla | Valor |
|-------|-------|
| Máx. columnas por entorno | 8 |
| Colores únicos por entorno | 16 preset, no repetibles |
| Estados de item | 0=Pendiente, 1=En curso, 2=Completado (cíclico) |
| Entornos | Independientes (columnas + items propios). Mínimo 1 |
| Tiempo | Entero en horas (sufijo "h" fijo) |
| Campo `action` | Texto libre opcional ("detalles de lo realizado") |
| Frases | 20, rotan en pares cada 120 s |

## 3. Modelo de datos actual (localStorage)
```json
{
  "activeEnv": "env-main",
  "envs": [{
    "id": "env-main", "name": "Ruta IT 2026", "icon": "🚀",
    "columns": [{"id":"badges","num":1,"name":"Badges rápidos","icon":"⚡","color":"#34d399"}],
    "items":   [{"id":"scrum","col":"badges","title":"Scrum Fundamentals","detail":"...","action":"",
                 "time":3,"cert":"CertiProf","impact":"Alto","url":"","state":0}]
  }]
}
```

## 4. Esquema relacional propuesto (PostgreSQL 16)
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE environments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(80) NOT NULL,
  icon       VARCHAR(8)  NOT NULL DEFAULT '🌱',
  is_active  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE columns (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  env_id  UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
  num     SMALLINT NOT NULL CHECK (num BETWEEN 1 AND 8),
  name    VARCHAR(80) NOT NULL,
  icon    VARCHAR(8)  NOT NULL DEFAULT '📁',
  color   CHAR(7)     NOT NULL,
  UNIQUE (env_id, color)                     -- colores no repetidos por entorno
);

CREATE TABLE items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id  UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title      VARCHAR(160) NOT NULL,
  detail     TEXT         NOT NULL DEFAULT '',
  action     TEXT         NOT NULL DEFAULT '',   -- campo Acción (opcional)
  time_h     SMALLINT     NOT NULL DEFAULT 0 CHECK (time_h >= 0),
  cert       VARCHAR(80)  NOT NULL DEFAULT '—',
  impact     VARCHAR(20)  NOT NULL DEFAULT 'Alto'
             CHECK (impact IN ('Medio','Medio-alto','Alto','Muy alto')),
  url        TEXT         NOT NULL DEFAULT '',
  state      SMALLINT     NOT NULL DEFAULT 0 CHECK (state IN (0,1,2)),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_items_column ON items(column_id);

CREATE TABLE activity_log (
  id         BIGSERIAL PRIMARY KEY,
  env_name   VARCHAR(80),
  message    TEXT NOT NULL,
  cls        VARCHAR(10) NOT NULL DEFAULT 'rs',   -- ok | run | rs
  detail     TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quotes (
  id     SMALLSERIAL PRIMARY KEY,
  text   TEXT NOT NULL,
  author VARCHAR(80) NOT NULL
);
-- Seed: INSERT INTO quotes ... (las 20 frases del array QUOTES del index.html)
```

## 5. API REST propuesta (Node/Express o similar)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/state` | `{activeEnv, envs:[...columns,items]}` completo |
| PUT | `/api/state/active-env` | `{envId}` cambia entorno activo |
| POST | `/api/envs` · PATCH/DELETE `/api/envs/:id` | CRUD entornos |
| POST | `/api/envs/:id/columns` · PATCH/DELETE `/api/columns/:id` | CRUD columnas (validar máx. 8 y color único) |
| POST | `/api/columns/:id/items` · PATCH/DELETE `/api/items/:id` | CRUD items |
| PATCH | `/api/items/:id/state` | `{state:0\|1\|2}` |
| GET | `/api/logs?limit=12` · POST `/api/logs` | Registro de actividad |
| GET | `/api/quotes/random?n=2` | Par de frases aleatorias sin repetir |

Validaciones en backend: máx. 8 columnas/entorno, color único, `state ∈ {0,1,2}`, mínimo 1 entorno.

## 6. Estructura de proyecto para Docker
```
career-tracker/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── index.html          ← la SPA actual
├── backend/
│   ├── Dockerfile
│   ├── package.json        ← express, pg, cors
│   └── server.js
└── db/
    └── init.sql            ← esquema de la sección 4
```

### frontend/Dockerfile
```dockerfile
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### frontend/nginx.conf
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  location /api/ { proxy_pass http://api:3000/; }
  location / { try_files $uri /index.html; }
}
```

### backend/Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js ./
ENV PORT=3000
EXPOSE 3000
CMD ["node","server.js"]
```

### docker-compose.yml
```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: career
      POSTGRES_USER: career
      POSTGRES_PASSWORD: ${DB_PASSWORD:-career}
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL","pg_isready -U career"]
      interval: 5s
      retries: 10
  api:
    build: ./backend
    environment:
      DATABASE_URL: postgres://career:${DB_PASSWORD:-career}@db:5432/career
    depends_on:
      db: { condition: service_healthy }
  web:
    build: ./frontend
    ports: ["8080:80"]
    depends_on: [api]
volumes:
  db-data:
```

**Ejecutar:** `docker compose up -d --build` → app en `http://localhost:8080`

## 7. Plan de migración del frontend
1. Crear `api.js` con funciones `fetch` que espejen las funciones actuales:
   `load()→GET /api/state`, `persist()→PATCH por entidad`, `log()→POST /api/logs`.
2. Sustituir `save(KEY,…)/load(KEY,…)` por llamadas async (mantener localStorage como caché offline).
3. Exportar datos actuales desde consola: `copy(localStorage.getItem('ruta-it-v6'))`
   → script `seed.sql` o `POST /api/import` que reciba el JSON de la sección 3.
4. El mapeo JSON→SQL es directo: `envs→environments`, `columns→columns`, `items→items`
   (`time→time_h`, `col→column_id`).

## 8. Checklist de aceptación
- [ ] `docker compose up -d --build` levanta db+api+web sin errores
- [ ] GET `/api/state` devuelve el entorno seed con 5 columnas y 19 items
- [ ] Crear 9ª columna → error 400 "Máximo 8 columnas"
- [ ] Color duplicado en mismo entorno → error 409
- [ ] PATCH state cicla 0→1→2→0 y recalcula stats
- [ ] Eliminar entorno en cascada borra columnas e items
- [ ] UI en :8080 idéntica a la SPA local