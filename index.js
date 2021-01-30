require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require("helmet")
const bot = require('./bot')

const httpCodes = {
  ok: 200,
  badReq: 400,
  noAuth:  403,
  serverErr: 500,
}

const origins = {
  dev: 'http://localhost:5500',
  prod: 'https://manamelacedric.github.io'
}

const app = express()

app.use(express.json())
app.use(cors())
app.use(helmet())
app.disable("x-powered-by")

app.get('/', (_, res) => res.send('Server working.'))
app.options('/', (_, res) => {
  const headers = {
    'Access-Control-Allow-Origin': origins[process.env.NODE_ENV],
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Credentials, x',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET'
  }
  return res.set(headers).json({ success: true })
})

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
  console.log(JSON.stringify(req.body))

  if (!name) {
    return res.status(httpCodes.badReq).json({
      success: false, error: { message: 'please specify you name'}
    })
  }

  if (!cellphone) {
    return res.status(httpCodes.badReq).json({
      success: false, error: { message: 'please specify your cellphone number'}
    })
  }

  if (!email) {
    return res.status(httpCodes.badReq).json({
      success: false, error: { message: 'please specify your email address'}
    })
  }

  if (!message) {
    return res.status(httpCodes.badReq).json({
      success: false, error: { message: 'please specify your message'}
    })
  }

  const newMessage = '<u><b>New Form Submission</b></u>'.concat([
    `\n<b>Name</b> <code>${name}</code>`,
    `\n<b>Cellphone</b> <code>${cellphone}</code>`,
    `\n<b>Email</b> <code>${cellphone}</code>`,
    `\n<b>Message</b> <code>${message}</code>`,
  ])
  
  bot.telegram.sendMessage(chatId, newMessage, { parse_mode: 'HTML'})
    .then(() => res.json({ success: true, data: { message: 'Message sent successfully.' } }))
    .catch((err) => {
      console.log('SendMessage Error: ', err)
      res.status(httpCodes.serverErr).json({
        success: false,
        error: { message: 'An unexpected error occured while sending your message, please try again later.' }
      })
    })
})

// 404 handler
app.use((req, res, next) => {
  res.status(404).send("Sorry, The resource you are looking for cannot be found!")
})

// start server
app.listen(parseInt(process.env.PORT, 10), (err) => {
  if(err) console.log('Failed to start the server')
  console.log('Server listening on port ' + process.env.PORT)
  bot.launch()
})