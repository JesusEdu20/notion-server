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

    const date = range === 'semana' ? getWeekRange() : getMonthRange()
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
          inform += `\n\n *Publicados: ${response.results.length}/${cmData[0].postsPerWeek} Empresas activas: ${cmData[0].assignedCompanies}*\n 
          ${postsByCompanyString}`
        }
      })

      res.json({ response_type: 'in_channel', text: `${inform}` })
    } catch (error) {
      console.error(error)
      res.status(500).send('An error occurred while querying the database pages')
    }
  }
}

module.exports = slackCommand
