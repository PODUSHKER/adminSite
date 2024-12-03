const TelegramBot = require('node-telegram-bot-api')
const { Client } = require('../models/associations.js')

const bot = new TelegramBot('TOKEN', {
    polling: {
        interval: 3000,
        autoStart: true
    }
})


bot.on('text', async (message) => {
    if (message.text === '/start') {
        bot.sendMessage(message.chat.id, 'Добро пожаловать в наш сайт', {
            reply_markup: {
                keyboard: [
                    [{ text: 'Регистрация', request_contact: true }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    }
    bot.deleteMessage(message.chat.id, message.message_id)
})

bot.on('contact', async (contact) => {
    const telegramUserId = contact.contact.user_id;
    const telegramId = contact.from.username

    const client = await Client.findOne({ where: { telegramUserId: contact.contact.user_id } })
    if (!client) {
        await new Client({ telegramId, telegramUserId }).save()
        bot.sendMessage(telegramUserId, 'Данные отправлены на обработку')
    }
    else {
        bot.sendMessage(telegramUserId, 'Вы уже зарегистрированы!')
    }

})
module.exports = bot;