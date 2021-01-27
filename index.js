require('dotenv').config()
const express = require('express')
const bot = require('./bot')

const app = express()

app.use(express.json())

app.get('/', (_, res) => res.send('Server working.'))
app.post('/form', (req, res) => {
  const 
  const { name, email, cellphone, messsage } = req.body
  res.json({ success: true })
})

app.listen(parseInt(process.env.PORT, 10), (err) => {
  if(err) console.log('Failed to start the server')
  console.log('Server listening on port ' + process.env.PORT)
  bot.launch()
})