import BotContext from "../types/bot-context";

export default async function handlePrecheckoutQuery(ctx: BotContext) {
  console.info("Received pre checkout query");
  return ctx.answerPreCheckoutQuery(true).catch((err) => {
    console.error("Error in pre_checkout_query: ", err);
  });
}
