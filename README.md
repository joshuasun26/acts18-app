# Acts 1:8 Ministry App

Outreach organizer for Lifepoint Church (Buena Park): members sign up, an admin
auto-generates small groups and carpools with smart rules, and posts real-time
announcements. Built with **React + Vite**.

---

## Everyday loop (this is the whole point)

Once the one-time setup below is done, updating the live site is just:

```bash
git add -A
git commit -m "what I changed"
git push
```

That's it. Vercel sees the push and **auto-deploys** in ~30 seconds. No dashboard,
no manual redeploy, no troubleshooting. (Same as the loan-officer app.)

---

## Run it locally

```bash
npm install      # first time only
npm run dev      # opens a local preview at http://localhost:5173
```

Build a production bundle (what Vercel runs):

```bash
npm run build    # outputs to dist/
```

---

## One-time setup: connect GitHub -> Vercel (do this once)

### 1. Put it on GitHub
Create a **new empty repo** at https://github.com/new (e.g. `acts18-app`,
no README/license). Then, from inside this folder:

```bash
git remote add origin https://github.com/joshuasun26/acts18-app.git
git branch -M main
git push -u origin main
```

### 2. Import it into Vercel
1. Go to https://vercel.com/new
2. **Import** the `acts18-app` repo.
3. Framework Preset auto-detects as **Vite** — leave Build Command (`vite build`)
   and Output Directory (`dist`) as-is.
4. Click **Deploy**. You get a live `*.vercel.app` URL.

### 3. Done forever
Every `git push` from now on auto-deploys. To check status or roll back a bad
deploy, use the Vercel dashboard's Deployments tab.

---

## Project structure

```
acts18-app/
  index.html        # Vite entry (loads src/main.jsx)
  src/
    main.jsx        # mounts <App/> into #root
    App.jsx         # the entire app (UI + grouping/carpool logic + base64 photos)
  vite.config.js
  package.json
```

> The 4 hero photos are embedded as base64 inside `App.jsx`, which is why that
> file is large. That's intentional and works fine — no external image hosting needed.
