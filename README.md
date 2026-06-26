This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Database & Authentication Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure the `DATABASE_URL` (MariaDB / MySQL connection string) and define a secure `ADMIN_PASSWORD` and `JWT_SECRET`.

## Prisma Commands

The project uses Prisma as the ORM to manage MariaDB databases. Here are the core Prisma CLI commands:

- **Generate Prisma Client**:
  Regenerate the type-safe client whenever the database schema changes:
  ```bash
  npx prisma generate
  ```

- **Push Schema changes directly (Development)**:
  Push your `schema.prisma` updates directly to the database without generating migrations (ideal for early prototype phases):
  ```bash
  npx prisma db push
  # Or force push with data loss if necessary:
  npx prisma db push --accept-data-loss
  ```

- **Database Migrations (Production/Dev Workflow)**:
  Create a migration history and apply changes:
  ```bash
  npx prisma migrate dev --name <migration_name>
  ```
  Apply migrations to a production database:
  ```bash
  npx prisma migrate deploy
  ```

- **Open Prisma Studio**:
  Explore database records visually in a web browser GUI (runs on `http://localhost:5555`):
  ```bash
  npx prisma studio
  ```

- **Database Seeding**:
  If a seed script is configured, run:
  ```bash
  npx prisma db seed
  ```

---

## Deployment & Hosting on Debian Linux (Docker)

To host this project on any Debian device, you can use Docker Compose to orchestrate both the MariaDB database and the Next.js web application.

### Quick Setup

1. Clone this repository on your hosting device.
2. Grant execution permissions and run the setup script:
   ```bash
   chmod +x setup-debian.sh
   ./setup-debian.sh
   ```

The script will automatically:
- Install Docker and Docker Compose (if not present).
- Generate a production `.env` configuration with a secure random JWT secret.
- Spin up the MariaDB and Web containers.
- Run database migrations and seed the real 8CTRL track catalog.

### Manual Docker Commands

If you prefer to run the steps manually:

1. Build and start the containers:
   ```bash
   docker compose up -d --build
   ```
2. Seed the database:
   ```bash
   docker compose exec web npx prisma db seed
   ```

