# Senorito POS: Docker Development Guide

This project uses Docker Compose for local development. Docker supplies Node, npm, PHP, Composer, and the project's packages, so a new computer only needs Git and Docker Desktop.

## What is included

```text
Browser → http://localhost:5173 → React + Vite container
Browser → http://127.0.0.1:8000/api → Laravel container → Supabase PostgreSQL
```

The database is not a Docker container: it is the existing Supabase cloud database. Therefore, both computers use the same data.

## Files that make Docker work

| File | Purpose |
| --- | --- |
| `compose.yml` | Starts and connects the frontend and backend containers. |
| `Dockerfile.dev` | Defines the Node/Vite frontend environment. |
| `backend/Dockerfile.dev` | Defines the PHP/Laravel backend environment. |
| `.dockerignore` files | Keep local packages, build output, and secrets out of Docker images. |

## Set up a second computer

### 1. Install the prerequisites

1. Install Git if it is not already installed.
2. Install Docker Desktop for Windows. Start Docker Desktop and wait until it reports that the engine is running.
3. Open PowerShell and verify it:

   ```powershell
   docker --version
   docker compose version
   ```

The second computer does **not** need local Node.js, npm, PHP, Composer, Laragon, Axios, or TanStack Query.

### 2. Get the latest source code

Clone the private repository once, or pull the latest version if it is already cloned:

```powershell
git clone <your-private-repository-url>
cd senorito-pos-system
```

Later updates use:

```powershell
git pull
```

### 3. Securely copy environment files

Git deliberately does not include these private files:

```text
.env
backend/.env
```

Copy them from the main computer through a private channel, such as an encrypted USB drive, password manager secure note, or a private file transfer. Put them in the same paths on the new computer.

Never commit these files, upload them publicly, or send their contents in chat.

### 4. Start the app

From the project root:

```powershell
docker compose up --build
```

On the first run, Docker downloads its base images and installs all JavaScript and PHP packages inside containers. This can take a few minutes. Later starts are usually faster:

```powershell
docker compose up
```

Open the app at [http://localhost:5173](http://localhost:5173).

Keep the terminal open while the containers run. Stop them with `Ctrl + C`.

To run in the background:

```powershell
docker compose up -d
```

View logs or stop background containers:

```powershell
docker compose logs -f
docker compose down
```

## Everyday development workflow

1. Start Docker with `docker compose up`.
2. Edit React or Laravel files normally in VS Code.
3. Save files. Vite refreshes the frontend automatically; Laravel reads changed PHP code on the next request.
4. Commit and push code changes using Git.
5. On the other computer: `git pull`, then restart Docker if necessary.

Rebuild after changing a Dockerfile, `package.json`, `package-lock.json`, `composer.json`, or `composer.lock`:

```powershell
docker compose up --build
```

## Before relying on the second computer

Commit the Docker configuration with your source code:

```powershell
git add .dockerignore Dockerfile.dev compose.yml backend/.dockerignore backend/Dockerfile.dev DOCKER_DEVELOPMENT_GUIDE.md
git commit -m "Add Docker development environment"
git push
```

Also verify one API action (for example, login or loading dashboard data) and one frontend edit/hot reload on the main computer first.

## Common issues

### `docker` is not recognized

Docker Desktop is not installed, not running, or PowerShell needs to be reopened after installation.

### Port 5173 or 8000 is already in use

Stop the process using the port. A local Vite server, `php artisan serve`, or Laragon site can conflict with Docker. You can also change the left side of the mapping in `compose.yml`, such as `"5174:5173"`.

### A new dependency does not appear

Rebuild first:

```powershell
docker compose up --build
```

If it is still stale, stop Docker and recreate its dependency volumes:

```powershell
docker compose down -v
docker compose up --build
```

`-v` deletes Docker-managed package volumes only; it does not delete the source code folder. Docker will reinstall packages on the next build.

## Security requirement

The frontend `.env` currently has a Supabase service-role key using a `VITE_*` variable. Vite variables are visible in the browser, so a service-role key must never be placed there.

Before sharing or deploying this project, rotate that key in Supabase, remove it from the frontend `.env`, and move admin-only Supabase operations into protected Laravel backend endpoints. Keep the replacement secret only in `backend/.env`.

## Docker and Git have different jobs

- Git moves and versions the code.
- Docker makes the runtime consistent.
- `.env` files provide private configuration separately.

Use all three together.
