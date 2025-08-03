import { Chat } from "@prisma/client";
import { Context as BaseContext } from "grammy";

export default interface BotContext extends BaseContext {
  dbChat: Chat;
}
