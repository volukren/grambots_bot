-- CreateTable
CREATE TABLE "chats" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "username" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "bot_submissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "chat_id" BIGINT NOT NULL,
    CONSTRAINT "bot_submissions_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "bot_submissions_username_key" ON "bot_submissions"("username");
