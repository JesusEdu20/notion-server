require('dotenv').config()

const moment = require('moment')
const postDatabase = require('../models/notion.js')

function getWeekRange (typeOfObject = 'object') {
  const startOfWeek = moment().startOf('isoWeek').toISOString()
  const endOfWeek = moment().endOf('isoWeek').toISOString()
  if (typeOfObject === 'array') {
    return [startOfWeek, endOfWeek]
  }
  return { start: startOfWeek, end: endOfWeek }
}

function getPreviousWeekRange (typeOfObject = 'object') {
  const startOfPreviousWeek = moment().subtract(1, 'weeks').startOf('isoWeek').toISOString()
  const endOfPreviousWeek = moment().subtract(1, 'weeks').endOf('isoWeek').toISOString()

  if (typeOfObject === 'array') {
    return [startOfPreviousWeek, endOfPreviousWeek]
  }

  const start = moment(startOfPreviousWeek).startOf('day').toISOString()

  // Set end time to just before midnight (23:59:59.999)
  const end = moment(endOfPreviousWeek).endOf('day').toISOString()
  return { start, end }
}

function getMonthRange (typeOfObject = 'object') {
  const startOfMonth = moment().startOf('month').toISOString()
  const endOfMonth = moment().endOf('month').toISOString()
  if (typeOfObject === 'array') {
    return [startOfMonth, endOfMonth]
  }
  return { start: startOfMonth, end: endOfMonth }
}

class slackCommand {
  static post = async function (request, response) {
    try {
      const { text, user_id } = request.body
      if (!text) {
        return response.status(400).json({ response_type: 'in_channel', message: 'Parámetros faltante' })
      }

      const index = text.indexOf('-')
      const data = index !== -1 ? [text.substring(0, index), text.substring(index + 1)] : [text]

      if (data.length !== 2) {
        return response.status(400).json({ response_type: 'in_channel', message: 'Formato de texto no válido. Formato esperado: enlace-empresa' })
      }

      const [pageName, link] = data
      if (!pageName || !link) {
        return response.status(400).json({ response_type: 'in_channel', message: 'Faltan parámetros requeridos' })
      }

      const newPage = await postDatabase.createPost(user_id, pageName, link)

      response.json({ response_type: 'in_channel', text: 'La publicación ha sido registrada!', data: newPage })
    } catch (error) {
      console.error(error) // Log the error for debugging
      response.status(500).json({ response_type: 'in_channel', text: 'Ha ocurrido un error inesperado', error: error.message })
    }
  }

  static getInform = async (req, res) => {
    const { user_id, text } = req.body
    const data = text.split('-')
    const doc = data[0]
    const cm = data[1].toLowerCase()
    const range = data[2]
    const dbCMS = await postDatabase.getCmPermission()

    const databaseId = dbCMS.find(item => item.cmName === cm).dbId

    let date
    if (range === 'semana') {
      date = getWeekRange()
    } else if (range === 'mes') {
      date = getMonthRange()
    } else if (range === 'anterior') {
      date = getPreviousWeekRange()
    }
    console.log(date)
    let inform = ''
    try {
      const response = await postDatabase.getPages(databaseId, date)
      const cmDashboard = await postDatabase.getCmsDashboard()
      const amountOfPostByCompany = {}

      response.results.forEach((page, index) => {
        const titleProp = page.properties.empresa.title[0].text.content.split('-')
        const empresa = titleProp[0]
        if (Object.hasOwn(amountOfPostByCompany, empresa)) {
          // Si existe, incrementar su valor en 1
          amountOfPostByCompany[empresa] += 1
        } else {
          // Si no existe, crear la propiedad y asignarle el valor de 1
          amountOfPostByCompany[empresa] = 1
        }

        inform += `${index + 1}. *${empresa.padEnd(16)}* ${new Date(page.properties.fecha.date.start).toLocaleString()} ${page.properties.post.url} \n`
        if (index + 1 === response.results.length) {
          const cmData = cmDashboard.filter(item => item.cm === cm)
          const postsByCompanyEntries = Object.entries(amountOfPostByCompany)
          const postsByCompanyString = postsByCompanyEntries.map(([key, value]) => `${key}: ${value}`).join(', ')

          inform += `\n\n *Publicados: ${response.results.length}/${cmData[0].postsPerWeek} Empresas activas: ${cmData[0].activeCompanies}* \n${postsByCompanyString}`
        }
      })

      res.json({ response_type: 'in_channel', text: `${inform}` })
    } catch (error) {
      console.error(error)
      res.status(500).send('An error occurred while querying the database pages')
    }
  }

  static getCompaniesReport = async (req, res) => {
    const { user_id, text } = req.body
    const data = text.split('-')
    const range = data[0]
    const userData = await postDatabase.getCmPermission()
    const userRole = userData.find(user => user.idUser === user_id).role
    let inform = '*Empresas que abandonaron el servicio este mes*\n\n'
    if (userRole === 'sup' || userRole === 'admin') {
      try {
        const date = range === 'semana' ? getWeekRange() : getMonthRange()
        const numberOfcompaniesActives = (await postDatabase.getPages(process.env.COMPANY_DATABASE_ID)).results.length
        const inactiveCompanies = await postDatabase.getPages(process.env.COMPANY_DATABASE_ID, date)

        inactiveCompanies.results.forEach((company, index) => {
          const titleProp = company.properties.Name.title[0].text.content.split('-')
          const companyName = titleProp[0]
          const reason = company.properties.Nota.rich_text[0].text.content === 'undefined' ? 'sin motivo registrado' : company.properties.Nota.rich_text[0].text.content
          inform += `${index + 1}. *${companyName.padEnd(16)}* ${new Date(company.properties.fecha.date.start).toLocaleString()} ${reason}\n`

          if (index + 1 === inactiveCompanies.results.length) {
            inform += `\n\n *Total: ${inactiveCompanies.results.length}*\n *Empresas Activas: ${numberOfcompaniesActives}*`
          }
        })
        res.json({ response_type: 'in_channel', text: inform })
      } catch (error) {
        console.log(error)
        res.status(500).send('An error occurred while querying the database pages')
      }
    } else {
      res.status(500).send('access denied')
    }
  }
}

module.exports = slackCommand
