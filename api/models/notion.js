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
}

module.exports = postDatabase
