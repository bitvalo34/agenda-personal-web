# Agenda Personal Web – Guía de despliegue y uso

**Versión:** 2025‑06‑10
**Autor:** Erwin Sebastián Arévalo Toc
**Repositorio:** `https://github.com/bitvalo34/agenda-personal-web`

---

## Índice

1. [Requisitos mínimos](#requisitos-mínimos)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Variables de entorno (.env)](#variables-de-entorno-env)
4. [Despliegue – Opción A: Hostinger Business/Cloud](#opción-a-hostinger-businesscloud)
5. [Despliegue – Opción B: VPS con Docker Compose](#opción-b-vps-con-docker-compose)
6. [Scripts útiles](#scripts-útiles)
7. [Pruebas finales del cliente](#pruebas-finales-del-cliente)
8. [Preguntas frecuentes](#preguntas-frecuentes)

---

## Requisitos mínimos

| PC local                       | Servidor Hostinger                                   |
| ------------------------------ | ---------------------------------------------------- |
| • Windows 10/11, macOS o Linux | • Plan **Business/Cloud** con Node.js *o* VPS Docker |
| • Git 2.4+                     | • MySQL 8.x                                          |
| • Docker Desktop (si usa VPS)  | • Dominio apuntado a Hostinger                       |
| • Cliente SSH (OpenSSH)        | • Correo SMTP válido (para reset de contraseña)      |

> **Tiempo estimado de despliegue** ≤ 30 min.

---

## Estructura del proyecto

```
agenda-personal-web/
├─ backend/        # API Express + MySQL
│  ├─ db/          # schema.sql, seed.sql
│  ├─ index.js     # punto de entrada
│  └─ Dockerfile
├─ frontend/       # React 19 (Vite)
│  ├─ src/
│  └─ vite.config.js
├─ docker-compose.yml
├─ .env.example    # plantilla env
└─ README.md
```

---

## Variables de entorno (.env)

Copie `.env.example` → `.env` y complete:

```env
# Base de datos
DB_HOST=db                # docker ➜ servicio db | hosting ➜ mysql.dominio.com
DB_USER=agenda_user
DB_PASS=AgendaPwd2025$
DB_NAME=agenda_web

# JWT
JWT_SECRET=L8pT85bRcC1e1$

# SMTP (Mailtrap, Gmail App PW, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=correo@dominio.com
SMTP_PASS=contraseña_de_aplicación
```

---

## Opción A: Hostinger Business/Cloud

### 1 · Preparar la base de datos

1. **hPanel → Databases → MySQL Databases → Add New Database**.
2. Anotar *DB\_NAME*, *Username*, *Password* y *Host*.
3. **Remote MySQL**: añadir `%` o la IP de la app.
4. **phpMyAdmin → Import → schema.sql** (carpeta `backend/db`).

### 2 · Subir el backend

| Acción                                         | Paso en hPanel                                                                      |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| Crear carpeta `api`                            | **File Manager → public\_html**                                                     |
| Subir `backend.zip`                            | Botón **Upload** → extraer                                                          |
| **Websites → Node .js** → *Create Application* | Domain `api.dominio.com` – Node 18 – Start file `index.js` – dir `/public_html/api` |
| Variables de entorno                           | Pegar valores de `.env` (prod)                                                      |
| **Install npm** & **Restart**                  | App queda en estado *Running*                                                       |

### 3 · Subir el frontend

```bash
cd frontend
VITE_API=https://api.dominio.com npm run build
zip -r dist.zip dist
```

File Manager → *Upload* `dist.zip` en **public\_html** → *Extract*.

### 4 · Habilitar HTTPS

*SSL/TLS* → Let’s Encrypt → *Activate* para dominio y subdominio.

---

## Opción B: VPS con Docker Compose

```bash
ssh root@IP_VPS
# 1 Clonar y configurar
git clone https://github.com/cliente/agenda-personal-web.git /opt/agenda
cd /opt/agenda && cp .env.example .env
nano .env   # rellenar prod

# 2 Levantar servicios
docker compose up -d --build

# 3 Verificar
curl http://localhost:3000/contacts   # debería devolver []
```

> **Puertos**: abrir 80 & 443 en *VPS Firewall*.

---

## Scripts útiles

```bash
# backend
npm run dev        # nodemon local
npm test           # jest + supertest

# frontend
npm run dev        # vite
npm run lint       # eslint
npm run build      # producción

# docker
docker compose logs -f api      # ver logs
```

---

## Pruebas finales del cliente

1. `https://api.dominio.com/contacts` responde `[]`.
2. Login con usuario admin (seed).
   • Crear contacto → aparece en lista.
   • Editar y guardar.
   • Eliminar.
3. **Exportar** Excel → abre `agenda.xlsx` con datos.
4. **Importar** Excel de muestra → nuevos contactos visibles.
5. **Olvidé contraseña**: llega correo y link restablece exitosamente.
6. Frontend renderiza correctamente en móvil (inspector responsive 360 px).

---

## Preguntas frecuentes

| Pregunta                                             | Respuesta                                                                |                |
| ---------------------------------------------------- | ------------------------------------------------------------------------ | -------------- |
| ¿Cómo actualizo backend?                             | **Business**: subir archivos y *Restart App*.                            |                |
| **VPS**: `git pull && docker compose up -d --build`. |                                                                          |                |
| ¿Cambiar color/fondo?                                | Edita `frontend/src/index.css`, vuelve a `npm run build` y sube `dist/`. |                |
| ¿Backups?                                            | Plan Business tiene snapshot diario; VPS usa \`mysqldump                 | gzip\` + cron. |
| ¿Límites de tamaño?                                  | Importación Excel limitada a **2 MB** (módulo multer).                   |                |

---

> **Contacto de soporte**
> Si algo no funciona, envíe captura de consola (Logs hPanel o `docker logs api`) y le indicaremos el siguiente paso.
