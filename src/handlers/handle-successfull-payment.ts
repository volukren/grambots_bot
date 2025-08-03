import { Filter } from "grammy";
import BotContext from "../types/bot-context";
import { prisma } from "../lib/prisma";
import { ADMIN_CHAT_ID } from "../lib/constants";

export default async function handleSuccessfullPayment(
  ctx: Filter<BotContext, "message:successful_payment">
) {
  if (!ctx.message || !ctx.message.successful_payment || !ctx.from) {
    return;
  }

  const payment = ctx.message.successful_payment;

  const payload = JSON.parse(payment.invoice_payload) as {
    submissionId: string;
  };

  const submissionId = parseInt(payload.submissionId);

  const submission = await prisma.botSubmission.findUnique({
    where: { id: submissionId },
  });
  if (!submission) {
    await ctx.reply(
      "❌ An error occurred: bot submission not found.\n\n" +
        "If you have any questions, please contact @volukren"
    );
    return;
  }

  await prisma.botSubmission.update({
    data: {
      status: "paid",
    },
    where: {
      id: submission.id,
    },
  });

  return await Promise.all([
    ctx.reply(
      "✅ Payment successful! Your bot has been added to the review queue.\n\n" +
        "We will review your bot as soon as possible and notify you once it's approved and published on grambots.com.\n\n" +
        "Thank you for your submission!"
    ),
    ctx.api.sendMessage(
      `${ADMIN_CHAT_ID}`,
      `🤖 New bot submission received!\n\n` +
        `📋 Submission ID: ${submission.id}\n` +
        `🤖 Bot Username: @${submission.username}\n` +
        `👤 Submitted by: ${ctx.from.first_name} (@${
          ctx.from.username || "N/A"
        })\n` +
        `💰 Payment: ${payment.total_amount} ${payment.currency}\n` +
        `📅 Submitted: ${new Date().toISOString()}\n\n` +
        `Please review and approve/reject this submission.`
    ),
  ]);
}
