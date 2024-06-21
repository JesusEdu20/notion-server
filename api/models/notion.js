const { Client } = require('@notionhq/client')
require('dotenv').config()
/* const moment = require('moment') */

const notion = new Client({ auth: process.env.NOTION_KEY })

class postDatabase {
  static getCmPermission = async () => {
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

  static getCmsDashboard = async () => {
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

  static createPost = async (user_id, pageName, link) => {
    const dbCMS = await this.getCmPermission()
    console.log(user_id)
    const databaseId = dbCMS.find(cm => cm.idUser === user_id).dbId
    const page = await notion.pages.create({
      parent: {
        type: 'database_id',
        database_id: databaseId
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

    return page
  }

  static getPages = async (databaseId, date) => {
    const pages = await notion.databases.query({
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
    return pages
  }
}

module.exports = postDatabase
