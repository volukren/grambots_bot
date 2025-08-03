# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Telegram Bot application** for grambots.com - a bot submission service that allows users to submit their Telegram bots for inclusion on the grambots.com website. The bot handles submissions through a payment system using Telegram Stars.

## Development Commands

```bash
# Development (auto-reload)
npm run dev

# Build TypeScript
npm run build

# Production start (requires build first)
npm start

# Database operations (Prisma)
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema changes
npx prisma migrate dev # Create and apply migrations
npx prisma studio      # Database GUI
```

## Architecture & Technology Stack

- **Framework**: Grammy (Telegram Bot framework for Node.js)
- **Language**: TypeScript (ES2016, CommonJS)
- **Database**: SQLite with Prisma ORM
- **Package Manager**: pnpm
- **Payment**: Telegram Stars integration

## Code Structure

```
src/
├── handlers/          # Command and message handlers
│   ├── handle-start.ts    # /start command 
│   └── handle-message.ts  # /submit command with payment flow
├── middleware/        # Bot middleware
│   └── attach-chat.ts     # Attaches DB chat info to Grammy context
├── lib/              # Utilities
│   ├── constants.ts       # Admin chat ID and app constants
│   └── prisma.ts         # Prisma client instance
├── types/            # Type definitions
│   └── bot-context.ts    # Extended Grammy context interface
└── index.ts          # Main bot setup and error handling
```

## Database Schema

Two main entities in SQLite:
- **chats** - Telegram user/chat information  
- **bot_submissions** - Submitted bot usernames linked to chats

Database file: `prisma/dev.db`

## Bot Functionality

**Commands:**
- `/start` - Welcome message with submission instructions
- `/submit @bot_username` - Initiates bot submission with payment flow

**Key Features:**
- Payment processing via Telegram Stars
- Admin privileges (reduced fees for admin users)
- Database tracking of users and submissions
- Error handling with user-friendly messages

## Environment Variables

Required in `.env`:
```
BOT_TOKEN=your_telegram_bot_token
DATABASE_URL=file:./dev.db
```

## Development Notes

- Uses Grammy's middleware system for context enhancement
- Admin chat ID is hardcoded in `src/lib/constants.ts`
- Payment amounts differ for admin vs regular users
- Global error catching prevents bot crashes
- TypeScript strict mode enabled for type safety