## REST Migration Quickstart

### Prereqs
- Node.js >= 22
- pnpm >= 9
- Docker + Docker Compose

### 1) Start the stack (recommended)
```bash
cd /Users/ahmedelraei/Documents/Work/college-portal-system
./scripts/start-dev.sh
```

### 2) Local dev (manual)
```bash
cd /Users/ahmedelraei/Documents/Work/college-portal-system/apps/backend
pnpm install
pnpm run dev

cd /Users/ahmedelraei/Documents/Work/college-portal-system/apps/frontend
pnpm install
pnpm run dev
```

### 3) Environment variables
Backend: `apps/backend/.env`
```
PORT=8080
SESSION_SECRET=your-session-secret
FRONTEND_URL=http://localhost:3000
```

Frontend: `apps/frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 4) Example REST calls
Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"studentId":"STU001","password":"password123"}'
```

List courses:
```bash
curl -X GET http://localhost:8080/api/courses \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

Get my registrations:
```bash
curl -X GET http://localhost:8080/api/registrations/me \
  -H "Authorization: Bearer <JWT_TOKEN>"
```
