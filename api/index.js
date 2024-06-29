require('dotenv').config()

const moment = require('moment')
const express = require('express')
const bodyParser = require('body-parser')
const postDatabase = require('./models/notion.js')
/* const dbCMS = require('../cm/db-id') */
const slackCommand = require('./controllers/slackCommands.js')

const { Client } = require('@notionhq/client')
const slack = require('@slack/bolt').App

/* const app = express() */
const PORT = process.env.PORT || 80
const notion = new Client({ auth: process.env.NOTION_KEY })

const slackApp = new slack({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
  // Socket Mode doesn't listen on a port, but in case you want your app to respond to OAuth,
  // you still need to listen on some port!
  /* port: process.env.PORT || 3000 */
})

/* app.use(express.json()) */ // for parsing application/json
/* app.use(bodyParser.urlencoded({ extended: true })) */ // for parsing application/x-www-form-urlencoded

/* app.post('/pages', async function (request, response) {
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

// slack get inform command
app.post('/slack-command-pages/database', slackCommand.getInform)

// slack status command
app.post('/slack-command-pages/status', slackCommand.getCompaniesReport)
 */
// send form
/* app.post('/slack-command-pages/inform', (req, res) => {
  const trigger_id = req.body.trigger_id
  const form = {
    blocks: [
      {
        type: 'input',
        element: {
          type: 'url_text_input',
          action_id: 'url_text_input-action'
        },
        label: {
          type: 'plain_text',
          text: 'Registra tu publicacion',
          emoji: true
        }
      },
      {
        type: 'section',
        block_id: 'section678',
        text: {
          type: 'mrkdwn',
          text: 'A quien le publicas?'
        },
        accessory: {
          action_id: 'text1234',
          type: 'external_select',
          placeholder: {
            type: 'plain_text',
            text: 'empresa'
          },
          min_query_length: 3
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Click Me',
              emoji: true
            },
            value: 'click_me_123',
            action_id: 'submit_button-action'
          }
        ]
      }
    ]
  }

  res.json(form)
}) */

// send options
/* app.post('/slack-command-pages/cm-companies', async (req, res) => {
  const companies = await postDatabase.getPages(process.env.COMPANY_DATABASE_ID)
  const optionArray = []
  console.log(companies.results[12])
  companies.results.forEach((company, index) => {
    const titleProp = company.properties.Name.title[0].text.content.split('-')
    const companyName = titleProp[0]
    const companyOption = {
      text: {
        type: 'plain_text',
        text: companyName
      },
      value: companyName
    }
    optionArray.push(companyOption)
  })
  const options = {
    options: optionArray
  }

  res.json(options)
})
 */
// receive form
/* app.post('/slack-command-pages/receive-form', (req, res) => {
  res.json({ response_type: 'in_channel', text: 'formulario recibido' })
}) */

// MODAL
slackApp.command('/registrar', async ({ ack, body, client, logger }) => {
  // Acknowledge the command request
  await ack()

  try {
    // Call views.open with the built-in client
    const result = await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // View payload
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Modal title'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'A quien le publicaste?:'
            }
          },
          {
            type: 'input',
            block_id: 'url_input_block',
            label: {
              type: 'plain_text',
              text: 'URL'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'url_input',
              placeholder: {
                type: 'plain_text',
                text: 'https://example.com'
              }
            }
          },
          {
            type: 'section',
            block_id: 'company_name',
            text: {
              type: 'mrkdwn',
              text: 'Selecciona la empresa:'
            },
            accessory: {
              type: 'external_select',
              placeholder: {
                type: 'plain_text',
                text: 'empresa',
                emoji: true
              },
              action_id: 'external_select_action',
              min_query_length: 3
            }
          }

        ],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
      }
    })
    logger.info(result)
  } catch (error) {
    logger.error(error)
  }
})

slackApp.options('external_select_action', async ({ options, ack }) => {
  // Aquí podrías obtener información específica de una base de datos o cualquier otra fuente

  const userId = options.user.id
  const cmName = await postDatabase.getCmName('U076JKVPXQS')
  const filter = postDatabase.createFilter('Publica', 'multi_select', 'contains', cmName)
  const companies = await postDatabase.collectPages(process.env.COMPANY_DATABASE_ID, filter)
  console.log(cmName, filter, companies[0].properties.Name.title[0].plain_text)
  if (companies) {
    const optionsArray = []
    for (const company of companies) {
      optionsArray.push({
        text: {
          type: 'plain_text',
          text: company.properties.Name.title[0].plain_text
        },
        value: company.properties.Name.title[0].plain_text
      })
    }

    await ack({
      options: optionsArray
    })
  } else {
    await ack()
  }
})

slackApp.view('view_1', async ({ ack, body, view, logger }) => {
  // Acknowledge the view_submission event
  await ack()

  // Extract the values from the modal submission
  const user = body.user.id
  const team = body.team.id
  const postLink = view.state.values.url_input_block.url_input.value
  const companyName = view.state.values.company_name.external_select_action.selected_option.value

  postDatabase.createPost(user, companyName, postLink)
  // Log the values
  logger.info(`User ${user} submitted`)

  // Respond with a message in the same channel where the command was issued
  try {
    await slackApp.client.chat.postMessage({
      channel: 'C0795TJAURM',
      text: 'Thank you for submitting '
    })
  } catch (error) {
    logger.error(error)
  }
})

/* slackApp.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  console.log(message)
  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'A quien le publicaste?:'
        }
      },
      {
        type: 'input',
        block_id: 'url_input_block',
        label: {
          type: 'plain_text',
          text: 'URL'
        },
        element: {
          type: 'plain_text_input',
          action_id: 'url_input',
          placeholder: {
            type: 'plain_text',
            text: 'https://example.com'
          }
        }
      },
      {
        type: 'section',
        block_id: 'section123',
        text: {
          type: 'mrkdwn',
          text: 'Selecciona la empresa:'
        },
        accessory: {
          type: 'external_select',
          placeholder: {
            type: 'plain_text',
            text: 'empresa',
            emoji: true
          },
          action_id: 'external_select_action',
          min_query_length: 3
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Click Me',
              emoji: true
            },
            value: 'click_me_123',
            action_id: 'button_post'
          }
        ]
      }
    ],
    text: `Hey there <@${message.user}>!`
  })
}) */

slackApp.action('button_post', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack()
  await say(`<@${body.user.id}> clicked the button`)
});

(async () => {
  // Start your app
  await slackApp.start(PORT)

  console.log('⚡️ Bolt app is running!')
})()

/* const listener = app.listen(PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})
 */
