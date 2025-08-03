import BotContext from "../types/bot-context";

export async function handleStart(ctx: BotContext) {
  return ctx.reply(
    `<b>Welcome to the GramBots Submission Bot!</b>
Easily submit and manage your Telegram bots for inclusion on grambots.com.

To submit a bot:
/submit @your_bot_username`,
    {
      link_preview_options: {
        is_disabled: true,
      },
      parse_mode: "HTML",
    }
  );
}
