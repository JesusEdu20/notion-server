require('dotenv').config()
/* const moment = require('moment') */
const postDatabase = require('../models/notion.js')

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
}

module.exports = slackCommand
