require('dotenv').config()
const moment = require('moment')
const express = require('express')
const bodyParser = require('body-parser')
const postDatabase = require('./models/notion.js')
/* const dbCMS = require('../cm/db-id') */
const slackCommand = require('./controllers/slackCommands.js')

const { Client } = require('@notionhq/client')

const app = express()
const PORT = process.env.PORT || 8080
const notion = new Client({ auth: process.env.NOTION_KEY })

app.use(express.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/pages', async function (request, response) {
  try {
    const { dbID, pageName, link } = request.body
    if (!dbID || !pageName || !link) {
      return response.status(400).json({ message: 'Missing required parameters' })
    }

    const newPage = await notion.pages.create({
      parent: {
        type: 'database_id',
        database_id: dbID
      },
      properties: {
        empresa: {
          title: [
            {
              text: {
                content: pageName
              }
            }
          ]
        },
        post: {
          url: link
        }
      }
    })

    response.json({ message: 'success!', data: newPage })
  } catch (error) {
    console.error(error) // Log the error for debugging
    response.status(500).json({ message: 'Error creating page', error: error.message })
  }
})

// slack post command
app.post('/slack-command-pages', slackCommand.post)

app.post('/slack-command-pages/database', slackCommand.getInform)

app.get('/slack-command-pages', async function (req, res) {
  res.json('todo bien')
})

const listener = app.listen(PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})
