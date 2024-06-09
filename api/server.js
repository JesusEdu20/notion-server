require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.PORT ? process.env.PORT : 8080
const { Client } = require('@notionhq/client')
const notion = new Client({ auth: process.env.NOTION_KEY })

app.use(express.json()) // for parsing application/json

app.get('/test', function (req, res) {
  res.send(`${process.env.NOTION_KEY}`)
})
// Create new page. The database ID is provided in the web form.
app.post('/pages', async function (request, response) {
  const { dbID, pageName, link } = request.body
  console.log(dbID)
  try {
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
    response.json({ message: 'error', error })
  }
})

// listen for requests :)
const listener = app.listen(PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})

/* 'Due Date': {
    date: {
      start: '2024-06-05'
    }
  } */
