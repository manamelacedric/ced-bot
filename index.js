require('dotenv').config()
const express = require('express')
const bot = require('./bot')

const app = express()

app.use(express.json())

app.get('/', (_, res) => res.send('Server working.'))
app.post('/form', (req, res) => {
  const { name, email, cellphone, message } = req.body
  const chatId = process.env.ID

  if (!name) {
    return res.status(500).json({
      success: false, error: { message: 'please specify you name'}
    })
  }

  // todo: fix the order
  const messages = [
    bot.telegram.sendMessage(chatId, 'New Form Submission'),
    bot.telegram.sendMessage(chatId, `Name: ${name}`),
    bot.telegram.sendMessage(chatId, `Contacts: ${cellphone} ${email}`),
    bot.telegram.sendMessage(chatId, `Message: ${message}`),
  ]
  Promise.all(messages)
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.log('SendMessage Error: ', err)
      res.status(500).json({ success: true })
    })
  
})

app.listen(parseInt(process.env.PORT, 10), (err) => {
  if(err) console.log('Failed to start the server')
  console.log('Server listening on port ' + process.env.PORT)
  bot.launch()
})