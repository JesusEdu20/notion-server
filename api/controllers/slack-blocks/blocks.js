const savePostModal = {
  // Pass a valid trigger_id within 3 seconds of receiving it
  trigger_id: undefined,
  // View payload
  view: {
    type: 'modal',
    // View identifier
    callback_id: 'view_1',
    title: {
      type: 'plain_text',
      text: 'Registro de publicación'
    },
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Déjame el link aquí abajo'
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
            text: 'https://instagram.com'
          }
        }
      },
      {
        type: 'section',
        block_id: 'company_name',
        text: {
          type: 'mrkdwn',
          text: '¿A quién le publicaste?'
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
      text: 'Enviar'
    }
  }
}

module.exports = savePostModal
