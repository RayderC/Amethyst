# Amethyst — Personal Portfolio

A self-hosted portfolio site for makers, fabricators, and builders. Post your projects with photos, videos, and full markdown writeups. Everything is managed through a private admin dashboard — no external CMS, no cloud accounts, just your own server.

---

## Quick Start

```bash
docker run -d \
  --name amethyst \
  --restart always \
  -p 3000:3000 \
  -v amethyst-data:/data \
  -v amethyst-uploads:/app/public/uploads \
  rayderc/amethyst:latest
```

Then open `http://your-server:3000/setup` to create your admin account.

---

## Docker Compose (Recommended)

```yaml
services:
  amethyst:
    image: rayderc/amethyst:latest
    container_name: amethyst
    restart: always
    ports:
      - 3000:3000
    volumes:
      - ./data:/data
      - ./uploads:/app/public/uploads
```

```bash
docker compose up -d
```

No environment variables required. A session secret is auto-generated on first start.

---

## Features

- **Animated cyberpunk UI** — circuit board background, neon glows, scan effects
- **Project pages** — thumbnail, photo gallery, YouTube embed, full markdown description
- **Photo uploads** — drag-and-drop gallery uploads stored on your own server
- **Tag filtering** — filter projects by material or skill on the public projects page
- **Editable home page** — change your name, bio, hero text, and skills from the dashboard
- **Hub page** — private bookmark page for self-hosted services with auto-fetched favicons
- **Role-based access** — admins control the dashboard; regular users get Hub access only
- **Admin dashboard** — create, edit, delete projects; manage users and hub links
- **No external dependencies** — SQLite database, local file storage, no accounts needed
- **Multi-platform image** — runs on `linux/amd64` and `linux/arm64`

---

## Access Levels

| Page | Public | Logged-in User | Admin |
|---|---|---|---|
| Home, Projects | ✓ | ✓ | ✓ |
| Hub | — | ✓ | ✓ |
| Dashboard | — | — | ✓ |

---

## Environment Variables

All variables are optional. The app works out of the box with no configuration.

| Variable | Default | Description |
|---|---|---|
| `SESSION_SECRET` | auto-generated | Cookie encryption key (min 32 chars). **Set this in production** to keep sessions across container restarts. |
| `DATABASE_PATH` | `/data/amethyst.db` | SQLite database path inside the container |
| `SESSION_COOKIE_SECURE` | `false` | Set to `true` if running behind a TLS-terminating reverse proxy (HTTPS) |

### Example with a fixed session secret

```yaml
services:
  amethyst:
    image: rayderc/amethyst:latest
    container_name: amethyst
    restart: always
    ports:
      - 3000:3000
    environment:
      - SESSION_SECRET=your_random_secret_string_at_least_32_chars
      - SESSION_COOKIE_SECURE=true
    volumes:
      - ./data:/data
      - ./uploads:/app/public/uploads
```

---

## Volumes

| Path | Description |
|---|---|
| `/data` | SQLite database (`amethyst.db`) |
| `/app/public/uploads` | Uploaded images served at `/uploads/*` |

Both paths should be mounted as volumes so data survives container updates.

---

## Reverse Proxy (NGINX example)

```nginx
server {
    listen 443 ssl;
    server_name portfolio.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Set `SESSION_COOKIE_SECURE=true` when running behind HTTPS.

---

## First-Time Setup

1. Start the container
2. Go to `/setup` — create your admin account (only works once, before any user exists)
3. Log in at `/login`
4. **Dashboard → Home Page** — set your name, bio, and skills
5. **Dashboard → Projects → New Project** — add your first project
6. Toggle **"Feature on home page"** to show a project on the front page
7. **Dashboard → Hub** — add links to your self-hosted services

---

## Updating

```bash
docker pull rayderc/amethyst:latest
docker compose down && docker compose up -d
```

Database and uploads are preserved in volumes across updates.

---

## Source

[github.com/RayderC/Amethyst](https://github.com/RayderC/Amethyst)
