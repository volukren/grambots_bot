import { NextFunction } from "grammy";
import { prisma } from "../lib/prisma";
import BotContext from "../types/bot-context";

export async function attachChat(ctx: BotContext, next: NextFunction) {
  if (ctx.preCheckoutQuery) {
    return next();
  }
  const chatId = ctx.chat?.id;
  if (!chatId) {
    console.error("Chat ID is not found");
    return;
  }

  let chatFromDB = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chatFromDB) {
    chatFromDB = await prisma.chat.create({
      data: {
        id: chatId,
        username: ctx.chat?.username,
        firstName: ctx.chat?.first_name,
        lastName: ctx.chat?.last_name,
      },
    });
    console.info(`New chat created: ${chatId}`);
  }
  ctx.dbChat = chatFromDB;
  return next();
}
