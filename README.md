# Memoria

Memoria is a web application to track your working hours and sessions.

## Features
- **Session Tracking**: Start, pause, and stop work sessions.
- **Tagging System**: Categorize sessions with tags (e.g., Development, Meeting).
- **Reports**: View daily, weekly, and monthly reports.
- **Authentication**: Secure login and registration using JWT.

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd memoria
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy the example environment file and fill in your details:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your `DATABASE_URL`, `DIRECT_URL`, and `JWT_SECRET`.

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm test`: Runs the test suite using Jest.
