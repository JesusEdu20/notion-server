const { Client } = require('@notionhq/client')
const schemaPropertiesToFilter = require('./schemaPropertyFilters')

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
      const role = page.properties.role.rich_text[0].text.content

      return { idUser, cmName, dbId, role }
    })

    return data
  }

  static getCmName = async (idUser) => {
    const filter = this.createFilter('id_user', 'title', 'equals', idUser)
    const pages = await this.collectPages(process.env.PERMISSION_CM_DATABASE_ID, filter)
    try {
      const name = pages[0].properties.cm_name.rich_text[0].plain_text
      return name
    } catch (error) {
      console.log(error)
    }
  }

  static getRole = async (idUser) => {
    const filter = this.createFilter('id_user', 'title', 'equals', idUser)
    const pages = await this.collectPages(process.env.PERMISSION_CM_DATABASE_ID, filter)
    try {
      const role = pages[0].properties.role.rich_text[0].plain_text
      return role
    } catch (error) {
      console.log(error)
    }
  }

  static getCm = async (idUser) => {
    const filter = this.createFilter('id_user', 'title', 'equals', idUser)
    const pages = await this.collectPages(process.env.PERMISSION_CM_DATABASE_ID, filter)
    try {
      const name = pages[0].properties.cm_name.rich_text[0].plain_text
      const role = pages[0].properties.role.rich_text[0].plain_text
      const dbId = pages[0].properties.db_id.rich_text[0].plain_text
      return { name, role, dbId }
    } catch (error) {
      console.log(error)
    }
  }

  static getCmsDashboard = async () => {
    const response = await notion.databases.query({
      database_id: process.env.CMSDASHBOARD
    })
    const data = response.results.map((page) => {
      const cm = page.properties.nombre.title[0].text.content.toLowerCase()
      const postsPerWeek = page.properties.nro_publi_semanales.formula.number
      const activeCompanies = page.properties.nro_emp_activas.formula.number
      const assignedCompanies = page.properties.nro_emp_asignadas.rollup.number
      return { postsPerWeek, assignedCompanies, cm, activeCompanies }
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
    if (date) {
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
    } else {
      const pages = await notion.databases.query({
        database_id: databaseId,
        filter: {
          property: 'Status',
          status: {
            equals: 'Activo'
          }
        }

      })
      return pages
    }
  }

  static collectPages = async (databaseId, filter, ...filters) => {
    const target = {
      database_id: databaseId
    }

    if (filter) {
      target.filter = filter
    } else if (filters.length > 0) {
      target.filter = filters
    }

    console.log('aqui', target)
    const pages = await notion.databases.query(target)
    /*  console.log(pages.results)
    console.log('collectPages', filter) */
    return pages.results
  }

  static createFilter = (propertyName, typeProperty, operator, value) => {
    const filter = schemaPropertiesToFilter.find((filterSchema) => {
      for (const key in filterSchema) {
        if (key === typeProperty) {
          filterSchema.property = propertyName
          filterSchema[typeProperty][operator] = value
          return true
        }
      }
    })

    return filter
  }
}

postDatabase.getRole('U076NNY5X6Y')

/* console.log('aqui', postDatabase.createFilter('Status', 'checkbox', 'equals', 'true')) */

module.exports = postDatabase

/*
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
} */
/*  filter: {
    property: 'Status',
    status: {
      equals: 'Activo'
    }
  } */

/* filter: {
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
 */
/* const filter = postDatabase.createFilter('id_user', 'title', 'equals', 'U076NNY5X6Y') */
/* async function test () {
  const pages = await notion.databases.query({
    database_id: process.env.PERMISSION_CM_DATABASE_ID,
    filter

  })

  console.log(pages.results[0].properties.cm_name)
} */
/* async function test () {
  const pages = await postDatabase.collectPages(process.env.PERMISSION_CM_DATABASE_ID, filter)

  console.log(pages[0].properties.cm_name.rich_text[0].plain_text)
}

test()
 */
