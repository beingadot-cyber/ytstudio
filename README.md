# Creator Studio Demo

A polished, full-stack fictional creator analytics dashboard built with Next.js, PostgreSQL, and Drizzle ORM.

> ⚠️ **DEMO — Fictional Analytics**: All views, subscribers, revenue, watch time, likes, and comments are generated for demonstration purposes only. This dashboard does not connect to any real video platform or service.

---

## Features

- 🎬 **Video Management** — Full CRUD for demo videos with thumbnail upload
- 📊 **Analytics Dashboard** — Interactive charts powered by Recharts
- 💰 **Revenue Tracking** — Fictional earnings in Indian Rupee (₹)
- 💬 **Comments Management** — Create, hide, and delete demo comments
- 🔐 **Authentication** — Secure JWT-based auth with HTTP-only cookies
- 🔮 **Analytics Generator** — Generate fictional daily analytics for any date range
- 🔍 **Global Search** — Search videos and comments from the topbar
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Authentication page |
| `/dashboard` | Overview with metrics and charts |
| `/content` | Video list with filters and pagination |
| `/content/:id` | Video analytics detail page |
| `/analytics` | Channel-wide analytics |
| `/revenue` | Revenue breakdown |
| `/comments` | Comment management |
| `/settings` | Profile and data management |
| `/admin` | Admin panel overview |
| `/admin/videos` | Admin video management |
| `/admin/videos/new` | Create new video |
| `/admin/videos/:id/edit` | Edit video details |
| `/admin/analytics` | Edit analytics + generator |
| `/admin/comments` | Redirects to /comments |
| `/admin/revenue` | Redirects to /revenue |

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: bcryptjs + jose (JWT)
- **Icons**: Lucide React

## Demo Credentials

```
Username: admin
Password: Admin@123
```

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
JWT_SECRET=your-secret-key
NEXT_PUBLIC_APP_NAME=Creator Studio Demo
```

## Seed Data

The database is automatically seeded on first startup with:
- 20 fictional videos across categories (Programming, Design, DevOps, etc.)
- 90 days of daily analytics per video
- 344+ fictional comments
- Revenue records for each video

All data is internally consistent:
- Likes ≤ Views
- Comments ≤ Views  
- Daily sums approximately equal totals
- Revenue is proportional to views (RPM model)

## Architecture

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/               # REST API endpoints
│   ├── dashboard/         # Dashboard page
│   ├── content/           # Content management
│   ├── analytics/         # Analytics overview
│   ├── revenue/           # Revenue page
│   ├── comments/          # Comments management
│   ├── settings/          # Settings page
│   ├── admin/             # Admin panel
│   └── login/             # Login page
├── components/
│   ├── layout/            # Sidebar, Topbar, DashboardLayout
│   └── ui/                # Reusable components
├── db/                    # Drizzle ORM configuration
├── hooks/                 # React hooks (useAuth, useToast)
└── lib/                   # Utilities (auth, seed, utils)
```
