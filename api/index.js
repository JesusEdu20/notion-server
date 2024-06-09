require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')

const { Client } = require('@notionhq/client')

const app = express()
const PORT = process.env.PORT || 8080
const notion = new Client({ auth: process.env.NOTION_KEY })

app.use(express.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get('/', (req, res) => res.send('Express on Vercel'))

app.get('/test', function (req, res) {
  res.send('hello world')
})

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

app.post('/slack-command-pages', async function (request, response) {
  try {
    const { text } = request.body
    if (!text) {
      return response.status(400).json({ message: 'Missing text parameter' })
    }

    const data = text.trim().split('-')
    if (data.length !== 3) {
      return response.status(400).json({ message: 'Invalid text format. Expected format: dbID-pageName-link' })
    }

    const [dbID, pageName, link] = data
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

    response.json({ response_type: 'in_channel', text: 'Page created successfully!', data: newPage })
  } catch (error) {
    console.error(error) // Log the error for debugging
    response.status(500).json({ response_type: 'ephemeral', text: 'Error creating page', error: error.message })
  }
})

app.get('/slack-command-pages', async function (req, res) {
  res.json('todo bien')
})

const listener = app.listen(PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})
