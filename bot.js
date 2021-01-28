const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('Welcome'))
bot.on('text', (ctx) => {
  console.log('ctx', ctx.update.message.chat)
  ctx.reply(`Still busy, I'll get back shortly.`)})
bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

module.exports = bot