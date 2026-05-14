# How Your Git-Based CMS Actually Works — Honest, Code-Verified Answers

Every answer below is verified against your actual code. No assumptions.

---

## 1. DATA STORAGE — Where does the data go?

**Answer: Directly committed to GitHub. Immediately. No queue, no batch, no memory buffer.**

When you submit a blog post from the live website:

```
Frontend → POST /api/save-blog → Vercel Serverless Function → GitHub API commit → Done
```

The data is written **directly into `src/data/blog.yaml`** on your GitHub `main` branch in a single atomic commit. There is:
- ❌ No in-memory queue
- ❌ No batch accumulation system
- ❌ No temporary storage
- ✅ One blog submission = one GitHub commit, every time

> [!IMPORTANT]
> Your blog data lives inside `blog.yaml` in your Git repository. GitHub **is** your database. There is no separate database, no Redis, no localStorage persistence on the server.

---

## 2. COMMIT BEHAVIOR — When does the commit happen?

**Answer: Instantly on submit. One commit per blog post.**

The moment you click "Commit Push" (AdminPanel) or confirm in the Chatbot:
1. The API validates your password
2. Checks rate limiting (was the last commit < 30 seconds ago?)
3. If clear → **immediately commits to GitHub**

There is **no batching system**. The term "batched" in the success message refers to the fact that **deployment is skipped** (via `[skip ci]`), not that commits are batched. Each blog post creates its own individual commit.

### Rate Limiting Behavior
If you submit two posts within 30 seconds of each other:
- First post: ✅ commits successfully
- Second post: ❌ rejected with `429 Too Many Requests`
- The API tells you exactly how many seconds to wait

The rate limiter works by checking the **timestamp of the last commit that touched `blog.yaml`** via the GitHub API. This works across serverless cold starts because the source of truth is GitHub itself, not server memory.

---

## 3. DEPLOYMENT FLOW — When does Vercel deploy?

**Answer: CMS commits do NOT trigger a Vercel deploy. You control when deploys happen.**

Your commit message includes `[skip ci]`:
```
chore(blog): add "My Post Title" via CMS [skip ci]
```

Vercel sees `[skip ci]` and **ignores the commit entirely** — no build, no deploy.

### So when DOES the site update with new posts?

Your site updates when **any of these happen**:
1. You push a code change (any commit WITHOUT `[skip ci]`)
2. You manually trigger a deploy from the Vercel dashboard
3. You set up a scheduled cron deploy in Vercel (e.g., daily at midnight)

### The critical thing to understand:

```
Blog submitted via CMS
  → Data is on GitHub ✅ (committed)
  → Data is NOT on the live site yet ❌ (no deploy)
  → Live site still serves the OLD blog.yaml from the last build
```

The new post only appears on the live site after the next Vercel build, which pulls the latest `blog.yaml` from GitHub.

---

## 4. DELAYED PUBLISHING (publishAt)

**Answer: `publishAt` does NOT exist in your system. It was never implemented.**

Your blog post schema has these fields:
- `id`, `title`, `slug`, `content`, `category`, `type`, `date`, `readingTime`
- `featured` (boolean)
- `draft` (boolean)
- `resources` (optional array)

There is no `publishAt` field, no scheduled publishing logic, and no cron job checking dates.

### If you want scheduled visibility, here's what you actually have:

The `draft` field. Setting `draft: true` hides the post from visitors:
```typescript
// Blog.tsx line 76
result = result.filter(p => !p.draft || isAdmin);
```

**Workflow for "delayed publishing":** Create the post with `draft: true` → later, manually edit `blog.yaml` on GitHub to set `draft: false` → next deploy shows it.

---

## 5. ADMIN vs VISITOR VIEW

### What the Admin sees:
- ✅ All posts (including `draft: true` posts)
- ✅ Optimistic UI injection — the new post appears **instantly** in the browser after submission (injected into React state), even before Vercel rebuilds
- ✅ The "Publishing..." badge on freshly submitted posts

### What the Visitor sees:
- ✅ Only posts where `draft` is `false` (or undefined)
- ❌ Cannot see draft posts
- ❌ Cannot see the Admin Panel or Chatbot
- ❌ **Will NOT see newly CMS-committed posts** until the next Vercel deploy happens

### The "Optimistic UI" illusion:
When you (as admin) submit a post, it appears instantly in YOUR browser because the code injects it into local React state:
```typescript
const handleOptimisticInject = (newPost: BlogPost) => {
  const pended = { ...newPost, isPending: true };
  setPosts(prev => [...prev, pended]);
};
```
But this is **only in your browser session's memory**. If you refresh the page, it's gone — until Vercel rebuilds with the updated `blog.yaml`.

---

## 6. RATE LIMITING

| Scenario | Result |
|---|---|
| Submit 1 post | ✅ Commits to GitHub |
| Submit another post 10 seconds later | ❌ `429` — "Wait 20 seconds" |
| Submit after 30 seconds | ✅ Commits to GitHub |
| Submit same title twice on same day | ❌ `409` — "Duplicate detected" |
| Submit with wrong password | ❌ `401` — "Invalid Password" |
| Submit with missing title/content | ❌ `400` — "Missing fields" |

The 30-second cooldown is configurable at the top of `api/save-blog.ts`:
```typescript
const RATE_LIMIT_SECONDS = 30;
```

---

## 7. FAILURE CASES

| Failure | What Happens | User Sees |
|---|---|---|
| **Wrong password** | API returns `401` instantly, nothing touches GitHub | "Invalid Password" error |
| **GitHub token expired** | API returns `500` when trying to fetch `blog.yaml` | Error with token diagnostic info |
| **SHA collision** (someone else edited `blog.yaml` simultaneously) | GitHub rejects the commit, API returns `500` | "SHA collision — try again" |
| **Rate limited** | API returns `429` with `Retry-After` header | "Wait X seconds" message |
| **Vercel function timeout** (>10s) | Request dies mid-execution | Network error in frontend |
| **GitHub API down** | Fetch/commit calls fail, API returns `500` | Generic server error |

In ALL failure cases: **no data is lost from your existing blog.yaml**. The worst case is that a new post doesn't get added. Your existing data is never corrupted because GitHub commits are atomic.

---

## 8. COMPLETE PIPELINE — Step by Step

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Admin submits blog post                                │
│  Frontend sends POST /api/save-blog with password + blogData    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  STEP 2: Vercel Serverless Function executes                    │
│  ├─ Validates password against ADMIN_PASSWORD env var            │
│  ├─ Checks rate limit (last commit on blog.yaml < 30s ago?)     │
│  ├─ Fetches current blog.yaml from GitHub (gets SHA)            │
│  ├─ Parses YAML, checks for duplicate titles                    │
│  ├─ Computes: id, slug, readingTime                             │
│  ├─ Appends new post to array                                   │
│  ├─ Serializes back to YAML                                     │
│  └─ Commits to GitHub with message containing [skip ci]         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  STEP 3: GitHub receives the commit                             │
│  ├─ blog.yaml is updated on the main branch                     │
│  ├─ Vercel webhook fires, sees [skip ci], does NOTHING          │
│  └─ Data is safely stored. No deploy triggered.                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  STEP 4: Frontend receives success response                     │
│  ├─ Optimistic UI injects the post into local React state       │
│  ├─ Admin sees the post immediately (with "Publishing..." badge)│
│  └─ Badge clears after 4 seconds                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  STEP 5: Deployment (MANUAL / SEPARATE)                         │
│  ├─ Push any code change → Vercel rebuilds → new posts go live  │
│  ├─ OR: Vercel Dashboard → "Redeploy" button                    │
│  └─ Visitors now see the new posts                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary Table

| Question | Answer |
|---|---|
| Where is data stored? | GitHub (`blog.yaml` on `main` branch) |
| When does commit happen? | Instantly on submit (1 post = 1 commit) |
| Is there batching? | No. Only rate limiting (30s cooldown) |
| Does Vercel auto-deploy? | No. `[skip ci]` blocks it |
| When do new posts go live? | On the next manual deploy or code push |
| Does `publishAt` exist? | No. Not implemented |
| Can visitors see drafts? | No. `draft: true` is filtered out |
| Can admin see posts instantly? | Yes, via optimistic UI (local state only) |
| What if I refresh after submitting? | The optimistic post disappears until Vercel rebuilds |
