# Amethyst

A self-hosted personal portfolio built for makers, welders, and fabricators. Post your projects with photos, YouTube embeds, and full markdown writeups. Everything is managed through a private admin dashboard — no external CMS, no cloud accounts, no subscriptions.

---

## Features

### Public Site
- **Home page** — Editable hero, bio, and skills section. All content is changed from the dashboard with no code edits required.
- **Projects** — Full project list with tag-based filtering. Each project supports a thumbnail, photo gallery, YouTube embed, and a complete markdown writeup.
- **Hub** — A private bookmarks page for self-hosted services (Jellyfin, Nextcloud, Plex, Portainer, etc.) with auto-fetched favicons. Visible to any logged-in user.
- **Animated cyberpunk UI** — Circuit board background, neon glows, scan effects, and a glitch animation on the hero title.
- **Fully responsive** — Works on desktop and mobile. The admin dashboard has a slide-out drawer on small screens.

### Admin Dashboard
- **Projects** — Create, edit, and delete projects. Upload thumbnail and gallery photos directly (no external hosting needed). YouTube URL auto-parses into an embed.
- **Home Page Editor** — Change your name, badge text, hero lines, bio, skills list, email, and GitHub link. Updates the live site instantly.
- **Hub Manager** — Add, edit, and reorder links to self-hosted services. Favicon is auto-fetched from the service URL.
- **Users** — Create additional accounts (admin or regular user). Only admins can access the dashboard; regular users can only access the Hub.

### Access Levels
| Page | Public | Logged-in User | Admin |
|---|---|---|---|
| Home, Projects | ✓ | ✓ | ✓ |
| Hub | — | ✓ | ✓ |
| Dashboard | — | — | ✓ |

---

## Quick Start with Docker

The recommended way to run Amethyst. No environment variables required.

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

## Docker Compose

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

---

## Environment Variables

All variables are optional. The app runs out of the box with no configuration.

| Variable | Default | Description |
|---|---|---|
| `SESSION_SECRET` | auto-generated | Cookie encryption key (min 32 chars). **Recommended in production** — keeps sessions alive across container restarts. |
| `DATABASE_PATH` | `/data/amethyst.db` | Path to the SQLite database inside the container. |
| `SESSION_COOKIE_SECURE` | `false` | Set to `true` when running behind a TLS-terminating reverse proxy (HTTPS). |

### Example with fixed session secret

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

| Path | Contains |
|---|---|
| `/data` | SQLite database (`amethyst.db`) |
| `/app/public/uploads` | Uploaded images, served at `/uploads/*` |

Mount both as volumes so data survives container updates.

---

## Reverse Proxy (NGINX)

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

## Updating

```bash
docker pull rayderc/amethyst:latest
docker compose down && docker compose up -d
```

Database and uploads are preserved in volumes — nothing is lost on update.

---

## Running Locally

**Prerequisites:** Node.js 20+, npm

```bash
git clone https://github.com/RayderC/Amethyst.git
cd Amethyst
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then navigate to `/setup` to create your admin account.

---

## First-Time Setup

1. Start the app (Docker or `npm run dev`)
2. Go to `/setup` — create your admin account (only works before any user exists)
3. Log in at `/login`
4. **Dashboard → Home Page** — set your name, bio, hero text, and skills
5. **Dashboard → Projects → New Project** — add your first project
6. Toggle **"Feature on home page"** to show it on the front page
7. **Dashboard → Hub** — add links to your self-hosted services

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router + Pages API Routes) |
| Language | TypeScript 5 |
| Database | SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| Auth | [iron-session](https://github.com/vvo/iron-session) (encrypted cookie sessions) |
| Markdown | [react-markdown](https://github.com/remarkjs/react-markdown) + remark-gfm |
| Styling | Custom CSS with CSS custom properties |
| Container | Docker (multi-platform: `linux/amd64`, `linux/arm64`) |

---

## Project Structure

```
app/
  components/        Shared UI — Navigation, ProjectCard, MarkdownEditor,
                     CircuitBackground, FooterAuth
  dashboard/         Protected admin pages — projects, home editor, hub, users
  hub/               Private service links page (any logged-in user)
  projects/          Public project list and detail pages
  page.tsx           Home page (server-rendered, reads config from DB)
  layout.tsx         Root layout — circuit canvas, dynamic metadata

pages/api/           API routes (Next.js Pages Router)
  login / logout / user / register / setup
  projects/          CRUD for portfolio projects
  sessions/          CRUD for hub service links
  site-config        Home page content
  users/             User management
  favicon            Favicon proxy (direct fetch → Google fallback)

lib/
  db.ts              SQLite connection, schema migrations, helpers
  session.ts         iron-session config
  siteConfig.ts      Default site content (overridden by DB values)
  url.ts             URL normalization helpers

public/uploads/      Uploaded images (gitignored, mounted as Docker volume)
```

---

## License

MIT
