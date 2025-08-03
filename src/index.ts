import dotenv from "dotenv";
dotenv.config();

import { Bot } from "grammy";
import BotContext from "./types/bot-context";
import { attachChat } from "./middleware/attach-chat";
import { handleStart } from "./handlers/handle-start";
import handleMessage from "./handlers/handle-message";
import handlePrecheckoutQuery from "./handlers/handle-precheckout-query";
import handleSuccessfullPayment from "./handlers/handle-successfull-payment";
import { ADMIN_CHAT_ID } from "./lib/constants";
import { prisma } from "./lib/prisma";

const bot = new Bot<BotContext>(process.env.BOT_TOKEN as string);

bot.use(attachChat);

bot.command("start", handleStart);

bot.command("approve", async (ctx) => {
  // Check if user is admin
  if (ctx.dbChat.id !== ADMIN_CHAT_ID) {
    return ctx.reply("❌ You don't have permission to approve submissions.", {
      reply_parameters: { message_id: ctx.message!.message_id },
    });
  }

  const submissionId = parseInt(ctx.match);

  if (isNaN(submissionId)) {
    return ctx.reply(
      "❌ Invalid submission ID. Please provide a valid number.",
      {
        reply_parameters: { message_id: ctx.message!.message_id },
      }
    );
  }

  try {
    // Find the submission
    const submission = await prisma.botSubmission.findUnique({
      where: { id: submissionId },
      include: { chat: true },
    });

    if (!submission) {
      return ctx.reply(`❌ Submission with ID ${submissionId} not found.`, {
        reply_parameters: { message_id: ctx.message!.message_id },
      });
    }

    if (submission.status !== "paid") {
      return ctx.reply(
        `❌ Submission ${submissionId} (@${submission.username}) is not paid yet. Current status: ${submission.status}`,
        { reply_parameters: { message_id: ctx.message!.message_id } }
      );
    }

    // Update submission status to approved
    await prisma.botSubmission.update({
      where: { id: submissionId },
      data: { status: "approved" },
    });

    // Send confirmation to admin
    await ctx.reply(
      `✅ Submission approved successfully!\n\n` +
        `🤖 Bot: @${submission.username}\n` +
        `👤 Submitted by: ${
          submission.chat.firstName || submission.chat.username || "Unknown"
        }\n` +
        `🆔 Submission ID: ${submissionId}`,
      { reply_parameters: { message_id: ctx.message!.message_id } }
    );

    // Notify the submitter
    try {
      await ctx.api.sendMessage(
        submission.chatId.toString(),
        `🎉 Great news! Your bot @${submission.username} has been approved and published on grambots.com!\n\n` +
          `Thank you for your submission`
      );
    } catch (error) {
      // If we can't send message to submitter, log it but don't fail the approval
      console.error(`Failed to notify submitter ${submission.chatId}:`, error);
      await ctx.reply(
        `⚠️ Submission approved, but couldn't notify the submitter. They may have blocked the bot.`
      );
    }
  } catch (error) {
    console.error("Error approving submission:", error);
    return ctx.reply("❌ An error occurred while approving the submission.", {
      reply_parameters: { message_id: ctx.message!.message_id },
    });
  }
});

bot.on("pre_checkout_query", handlePrecheckoutQuery);

bot.on("message:successful_payment", handleSuccessfullPayment);

bot.on("message:text", handleMessage);

bot.catch((err) => {
  console.error("Error in bot", err);
});

bot.start();
