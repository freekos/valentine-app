import axios from "axios";

const BOT_TOKEN = "6876501963:AAFoa8BNiv7h96M-LOHyQXI2Sf-jRg_VUAk";

export const telegramBotInstance = axios.create({
  baseURL: `https://api.telegram.org/bot${BOT_TOKEN}`,
});
