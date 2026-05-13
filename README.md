# Amethyst

A personal portfolio site built to showcase projects, fabrication work, and builds. Features a cyberpunk-styled public frontend and a private admin dashboard for managing all content.

---

## Features

**Public Site**
- Home page with editable hero, bio, and skills section
- Project gallery with tag-based filtering
- Full project detail pages — markdown descriptions, photo galleries, YouTube embeds
- Animated circuit board background with glowing data pulses
- Fully responsive

**Admin Dashboard** *(password protected — access via `/login`)*
- Create, edit, and delete projects
- Upload photos directly (no external hosting needed)
- Edit home page content — name, bio, hero text, skills, links
- Manage the Hub (private links to self-hosted services)
- User management

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router + Pages API) |
| Language | TypeScript 5 |
| Database | SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| Auth | [iron-session](https://github.com/vvo/iron-session) (encrypted cookie sessions) |
| Markdown | [react-markdown](https://github.com/remarkjs/react-markdown) + remark-gfm |
| Styling | Custom CSS (no Tailwind classes in markup) |
| Container | Docker + Docker Compose |

---

## Running Locally

**Prerequisites:** Node.js 18+, npm

```bash
git clone https://github.com/RayderC/Amethyst.git
cd Amethyst
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On first run, navigate to `/setup` to create your admin account.

---

## Running with Docker

The easiest way to self-host. No environment variables required — a session secret is auto-generated on first start.

```bash
# Build the image
docker build -t amethyst:latest .

# Start with docker compose
docker compose up -d
```

The site runs on port `3000`. Data and uploaded images are persisted in local volumes:

```
./data/      ← SQLite database
./uploads/   ← Uploaded images (served at /uploads/*)
```

To update after pulling new code:

```bash
docker build -t amethyst:latest .
docker compose down && docker compose up -d
```

---

## Environment Variables

All variables are optional — the app runs without any configuration.

| Variable | Default | Description |
|---|---|---|
| `SESSION_SECRET` | auto-generated | Cookie encryption key (min 32 chars). Set this in production to keep sessions across restarts. |
| `DATABASE_PATH` | `./amethyst.db` | Path to the SQLite database file |
| `SESSION_COOKIE_SECURE` | `true` in production | Set to `false` if running without HTTPS |

---

## Project Structure

```
app/
  components/       → Shared UI (Navigation, ProjectCard, MarkdownEditor, CircuitBackground)
  dashboard/        → Admin pages (projects, home editor, hub, users)
  projects/         → Public project list and detail pages
  hub/              → Private service links page
  page.tsx          → Home page (reads config from DB)
  layout.tsx        → Root layout (circuit canvas, metadata)

pages/api/          → All API routes (Next.js Pages Router)
  projects/         → CRUD for projects
  site-config.ts    → Home page content API
  upload.ts         → Image upload handler
  sessions/         → Hub service links
  login/logout/user → Auth

lib/
  db.ts             → SQLite connection and migrations
  session.ts        → iron-session config
  siteConfig.ts     → Default site content (overridden by DB)

public/uploads/     → Uploaded images (gitignored)
```

---

## First-Time Setup

1. Start the app (`npm run dev` or Docker)
2. Go to `/setup` — create your admin account
3. Log in at `/login`
4. Go to **Dashboard → Home Page** to set your name, bio, hero text, and skills
5. Go to **Dashboard → Projects** to add your first project
6. Toggle "Feature on home page" on projects you want shown on the front page

---

## License

MIT
