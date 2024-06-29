const properties = [
  {
    property: 'CheckboxProperty',
    checkbox: {
      equals: true,
      does_not_equal: false
    }
  },
  {
    property: 'TitleProperty',
    title: {

    }
  },
  {
    property: 'TextProperty',
    text: {

    }
  },
  {
    property: 'NumberProperty',
    number: {
      equals: 123,
      does_not_equal: 123,
      greater_than: 123,
      less_than: 123,
      greater_than_or_equal_to: 123,
      less_than_or_equal_to: 123,
      is_empty: true,
      is_not_empty: true
    }
  },
  {
    property: 'SelectProperty',
    select: {
      equals: 'Option',
      does_not_equal: 'Option',
      is_empty: true,
      is_not_empty: true
    }
  },
  {
    property: 'MultiSelectProperty',
    multi_select: {

    }
  },
  {
    property: 'DateProperty',
    date: {
      equals: '2024-01-01',
      before: '2024-01-01',
      after: '2024-01-01',
      on_or_before: '2024-01-01',
      on_or_after: '2024-01-01',
      is_empty: true,
      is_not_empty: true
    }
  },
  {
    property: 'PeopleProperty',
    people: {
      contains: 'user_id',
      does_not_contain: 'user_id',
      is_empty: true,
      is_not_empty: true
    }
  },
  {
    property: 'FilesProperty',
    files: {
      is_empty: true,
      is_not_empty: true
    }
  },
  {
    property: 'UrlProperty',
    url: {
      equals: 'https://example.com',
      does_not_equal: 'https://example.com',
      contains: 'example',
      does_not_contain: 'example',
      starts_with: 'https://',
      ends_with: '.com',
      is_empty: true,
      is_not_empty: true
    }
  },
  {
    property: 'EmailProperty',
    email: {
      equals: 'example@example.com',
      does_not_equal: 'example@example.com',
      contains: 'example',
      does_not_contain: 'example',
      starts_with: 'example',
      ends_with: '@example.com',
      is_empty: true,
      is_not_empty: true
    }
  },
  {
    property: 'PhoneProperty',
    phone: {
      equals: '1234567890',
      does_not_equal: '1234567890',
      contains: '123',
      does_not_contain: '123',
      starts_with: '123',
      ends_with: '7890',
      is_empty: true,
      is_not_empty: true
    }
  },

  {
    property: 'FormulaProperty',
    formula: {
      text: {
        equals: 'example',
        does_not_equal: 'example',
        contains: 'example',
        does_not_contain: 'example',
        starts_with: 'example',
        ends_with: 'example',
        is_empty: true,
        is_not_empty: true
      },
      checkbox: {
        equals: true,
        does_not_equal: false
      },
      number: {
        equals: 123,
        does_not_equal: 123,
        greater_than: 123,
        less_than: 123,
        greater_than_or_equal_to: 123,
        less_than_or_equal_to: 123,
        is_empty: true,
        is_not_empty: true
      },
      date: {
        equals: '2024-01-01',
        before: '2024-01-01',
        after: '2024-01-01',
        on_or_before: '2024-01-01',
        on_or_after: '2024-01-01',
        is_empty: true,
        is_not_empty: true
      }
    }
  },

  {
    property: 'RelationProperty',
    relation: {
      contains: 'related_page_id',
      does_not_contain: 'related_page_id',
      is_empty: true,
      is_not_empty: true
    }
  }

]

module.exports = properties

/* const properties = [
    {
      property: 'CheckboxProperty',
      checkbox: {
        equals: true,
        does_not_equal: false
      }
    },
    {
    property: 'TitleProperty',
    title: {
      equals: 'example', // Igual a 'example'
      does_not_equal: 'example', // No igual a 'example'
      contains: 'example', // Contiene 'example'
      does_not_contain: 'example', // No contiene 'example'
      starts_with: 'example', // Comienza con 'example'
      ends_with: 'example', // Termina con 'example'
      is_empty: true, // Está vacío
      is_not_empty: true // No está vacío
    }
  },
    {
      property: 'TextProperty',
      text: {
        equals: 'example',
        does_not_equal: 'example',
        contains: 'example',
        does_not_contain: 'example',
        starts_with: 'example',
        ends_with: 'example',
        is_empty: true,
        is_not_empty: true
      }
    },
    {
      property: 'NumberProperty',
      number: {
        equals: 123,
        does_not_equal: 123,
        greater_than: 123,
        less_than: 123,
        greater_than_or_equal_to: 123,
        less_than_or_equal_to: 123,
        is_empty: true,
        is_not_empty: true
      }
    },
    {
      property: 'SelectProperty',
      select: {
        equals: 'Option',
        does_not_equal: 'Option',
        is_empty: true,
        is_not_empty: true
      }
    },
    {
      property: 'MultiSelectProperty',
      multi_select: {
        contains: 'Option',
        does_not_contain: 'Option',
        is_empty: true,
        is_not_empty: true
      }
    },
    {
      property: 'DateProperty',
      date: {
        equals: '2024-01-01',
        before: '2024-01-01',
        after: '2024-01-01',
        on_or_before: '2024-01-01',
        on_or_after: '2024-01-01',
        is_empty: true,
        is_not_empty: true
      }
    },
    {
      property: 'PeopleProperty',
      people: {
        contains: 'user_id',
        does_not_contain: 'user_id',
        is_empty: true,
        is_not_empty: true
      }
    },
    {
      property: 'FilesProperty',
      files: {
        is_empty: true,
        is_not_empty: true
      }
    },
    {
      property: 'UrlProperty',
      url: {
        equals: 'https://example.com',
        does_not_equal: 'https://example.com',
        contains: 'example',
        does_not_contain: 'example',
        starts_with: 'https://',
        ends_with: '.com',
        is_empty: true,
        is_not_empty: true
      }
    },
    {
      property: 'EmailProperty',
      email: {
        equals: 'example@example.com',
        does_not_equal: 'example@example.com',
        contains: 'example',
        does_not_contain: 'example',
        starts_with: 'example',
        ends_with: '@example.com',
        is_empty: true,
        is_not_empty: true
      }
    },
    {
      property: 'PhoneProperty',
      phone: {
        equals: '1234567890',
        does_not_equal: '1234567890',
        contains: '123',
        does_not_contain: '123',
        starts_with: '123',
        ends_with: '7890',
        is_empty: true,
        is_not_empty: true
      }
    },

    {
      property: 'FormulaProperty',
      formula: {
        text: {
          equals: 'example',
          does_not_equal: 'example',
          contains: 'example',
          does_not_contain: 'example',
          starts_with: 'example',
          ends_with: 'example',
          is_empty: true,
          is_not_empty: true
        },
        checkbox: {
          equals: true,
          does_not_equal: false
        },
        number: {
          equals: 123,
          does_not_equal: 123,
          greater_than: 123,
          less_than: 123,
          greater_than_or_equal_to: 123,
          less_than_or_equal_to: 123,
          is_empty: true,
          is_not_empty: true
        },
        date: {
          equals: '2024-01-01',
          before: '2024-01-01',
          after: '2024-01-01',
          on_or_before: '2024-01-01',
          on_or_after: '2024-01-01',
          is_empty: true,
          is_not_empty: true
        }
      }
    },

    {
      property: 'RelationProperty',
      relation: {
        contains: 'related_page_id',
        does_not_contain: 'related_page_id',
        is_empty: true,
        is_not_empty: true
      }
    }

  ] */
