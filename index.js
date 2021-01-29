require('dotenv').config()
const express = require('express')
const bot = require('./bot')
const httpCodes = {
  ok: 200,
  badReq: 400,
  noAuth:  403,
  serverErr: 500,
}


const app = express()

app.use(express.json())

app.get('/', (_, res) => res.send('Server working.'))

// auth middleware
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key']
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(httpCodes.noAuth).json({
      success: false,
      error: { message: 'You are not authorised to perform this action.' }
    })
  }
  return next()
})

// logger middleware
app.use((req, _, next) => {
  const { method, originalUrl } = req
  const date = new Date()
  const formatedDate = date.toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })
    .replace(',', '')
    .replace(/\//g, '-')
  console.log(`[${formatedDate}] ${method.toUpperCase()} ${originalUrl}`)
  return next()
})

// bot endpoin
app.post('/', (req, res) => {
  const { name, email, cellphone, message } = req.body
  const chatId = process.env.ID

  if (!name) {
    return res.status(httpCodes.badReq).json({
      success: false, error: { message: 'please specify you name'}
    })
  }

  if (!cellphone) {
    return res.status(httpCodes.badReq).json({
      success: false, error: { message: 'please specify your number'}
    })
  }

  if (!email) {
    return res.status(httpCodes.badReq).json({
      success: false, error: { message: 'please specify your email'}
    })
  }

  if (!message) {
    return res.status(httpCodes.badReq).json({
      success: false, error: { message: 'please specify your message'}
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
      res.status(httpCodes.serverErr).json({ success: true })
    })
  
})

// start server
app.listen(parseInt(process.env.PORT, 10), (err) => {
  if(err) console.log('Failed to start the server')
  console.log('Server listening on port ' + process.env.PORT)
  bot.launch()
})