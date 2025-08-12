import { Filter } from "grammy";
import BotContext from "../types/bot-context";
import { prisma } from "../lib/prisma";
import { ADMIN_CHAT_ID } from "../lib/constants";

// message format:
// /submit @bot_username
export default async function handleMessage(
  ctx: Filter<BotContext, "message:text">
) {
  const text = ctx.message.text.trim();

  // Check if message starts with /submit command
  if (!text.startsWith("/submit")) {
    return;
  }

  // Extract bot username from the message
  const parts = text.split(/\s+/);
  if (parts.length < 2) {
    return ctx.reply(
      "❌ Please provide a bot username.\n\nFormat: /submit @your_bot_username",
      { reply_parameters: { message_id: ctx.message.message_id } }
    );
  }

  const botUsername = parts[1];

  // Validate bot username format
  if (!botUsername.startsWith("@") || botUsername.length < 2) {
    return ctx.reply(
      "❌ Invalid bot username format.\n\nFormat: /submit @your_bot_username",
      { reply_parameters: { message_id: ctx.message.message_id } }
    );
  }

  // Remove @ symbol and validate username
  const username = botUsername.slice(1);

  if (await prisma.botSubmission.findUnique({ where: { username } })) {
    return ctx.reply("❌ This bot is already under review.", {
      reply_parameters: { message_id: ctx.message.message_id },
    });
  }

  const savedBotSubmission = await prisma.botSubmission.create({
    data: {
      username,
      chatId: ctx.dbChat.id,
    },
  });

  // Check if user is admin and set payment amount accordingly
  const isAdmin = ctx.dbChat.id === ADMIN_CHAT_ID;
  const amount = isAdmin ? 1 : 100;

  // Send invoice for payment
  return ctx.replyWithInvoice(
    "Bot Submission Fee",
    `To add ${botUsername} to grambots.com, you need to pay ${amount} stars`,
    JSON.stringify({ submissionId: savedBotSubmission.id }),
    "XTR",
    [{ label: "Submission Fee", amount }],
    {
      reply_parameters: { message_id: ctx.message.message_id },
    }
  );
}
