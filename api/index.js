require('dotenv').config()
const moment = require('moment')
const express = require('express')
const bodyParser = require('body-parser')
const dbCMS = require('../cm/db-id')

const { Client } = require('@notionhq/client')

const app = express()
const PORT = process.env.PORT || 8080
const notion = new Client({ auth: process.env.NOTION_KEY })

function getWeekRange (typeOfObject = 'object') {
  const startOfWeek = moment().startOf('isoWeek').toISOString()
  const endOfWeek = moment().endOf('isoWeek').toISOString()
  if (typeOfObject === 'array') {
    return [startOfWeek, endOfWeek]
  }
  return { start: startOfWeek, end: endOfWeek }
}

function getMonthRange (typeOfObject = 'object') {
  const startOfMonth = moment().startOf('month').toISOString()
  const endOfMonth = moment().endOf('month').toISOString()
  if (typeOfObject === 'array') {
    return [startOfMonth, endOfMonth]
  }
  return { start: startOfMonth, end: endOfMonth }
}

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

// post
app.post('/slack-command-pages', async function (request, response) {
  try {
    const { text, user_id } = request.body
    if (!text) {
      return response.status(400).json({ response_type: 'in_channel', message: 'Parámetros faltante' })
    }

    const index = text.indexOf('-')
    const data = index !== -1 ? [text.substring(0, index), text.substring(index + 1)] : [text]
    /* const data = text.trim().split('-') */
    if (data.length !== 2) {
      return response.status(400).json({ response_type: 'in_channel', message: 'Formato de texto no válido. Formato esperado: enlace-empresa' })
    }

    const [pageName, link] = data
    if (!pageName || !link) {
      return response.status(400).json({ response_type: 'in_channel', message: 'Faltan parámetros requeridos' })
    }

    const newPage = await notion.pages.create({
      parent: {
        type: 'database_id',
        database_id: dbCMS[user_id][1]
      },
      properties: {
        empresa: {
          title: [
            {
              text: {
                content: `${pageName}-${user_id}`
              }
            }
          ]
        },
        post: {
          url: link
        },
        fecha: {
          date: {
            start: new Date().toISOString(),
            end: null
          }
        }
      }
    })

    response.json({ response_type: 'in_channel', text: 'La publicación ha sido registrada!', data: newPage })
  } catch (error) {
    console.error(error) // Log the error for debugging
    response.status(500).json({ response_type: 'in_channel', text: 'Ha ocurrido un error inesperado', error: error.message })
  }
})

const getCmsDashboard = async () => {
  const response = await notion.databases.query({
    database_id: process.env.CMSDASHBOARD
  })
  const data = response.results.map((page) => {
    const cm = page.properties.nombre.title[0].text.content.toLowerCase()
    const postsPerWeek = page.properties.nro_publi_semanales.formula.number
    const assignedCompanies = page.properties.nro_emp_asignadas.rollup.number
    return { postsPerWeek, assignedCompanies, cm }
  })

  return data
}

const getCmPermission = async () => {
  const response = await notion.databases.query({
    database_id: process.env.PERMISSION_CM_DATABASE_ID
  })
  const data = response.results.map((page) => {
    const idUser = page.properties.id_user.title[0].text.content
    const cmName = page.properties.cm_name.rich_text[0].text.content
    const dbId = page.properties.db_id.rich_text[0].text.content
    return { idUser, cmName, dbId }
  })

  return data
}

app.post('/slack-command-pages/database', async (req, res) => {
  const { user_id, text } = req.body
  const data = text.split('-')
  const doc = data[0]
  const cm = data[1].toLowerCase()
  const range = data[2]
  const dbCMS = await getCmPermission()

  const databaseId = dbCMS.find(item => item.cmName === cm).dbId

  const date = range === 'semana' ? getWeekRange() : getMonthRange()
  let inform = ''
  try {
    const response = await notion.databases.query({
      database_id: databaseId,

      filter: {
        and: [
          {
            property: 'fecha',
            date: {
              on_or_after: date.start
            }
          },
          {
            property: 'fecha',
            date: {
              on_or_before: date.end
            }
          }
        ]
      }
    })
    const cmDashboard = await getCmsDashboard()

    response.results.forEach((page, index) => {
      const titleProp = page.properties.empresa.title[0].text.content.split('-')

      const empresa = titleProp[0]

      inform += `${index + 1}. *${empresa.padEnd(16)}* ${new Date(page.properties.fecha.date.start).toLocaleString()} ${page.properties.post.url} \n`
      if (index + 1 === response.results.length) {
        const cmData = cmDashboard.filter(item => item.cm === cm)

        inform += `\n\n Publicados: ${response.results.length}/${cmData[0].postsPerWeek} Empresas activas: ${cmData[0].assignedCompanies}`
      }
    })

    res.json({ response_type: 'in_channel', text: `${inform}` })
  } catch (error) {
    console.error(error)
    res.status(500).send('An error occurred while querying the database pages')
  }
})

app.get('/slack-command-pages', async function (req, res) {
  res.json('todo bien')
})

const listener = app.listen(PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})
