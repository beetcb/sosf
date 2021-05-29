const { id, key, type } = Object.fromEntries(
  new URL(location.href).searchParams
)
const isNoParams = !(id || key || type)
new gridjs.Grid({
  columns: [
    'Resource',
    {
      name: 'Link',
      hidden: true,
    },
    {
      name: 'Actions',
      formatter: (cell, row) => {
        return gridjs.h(
          'a',
          {
            className:
              'py-2 mb-4 px-4 border rounded-md text-white bg-blue-600',
            href: row.cells[1].data,
          },
          'Link'
        )
      },
    },
  ],
  search: true,
  server: {
    url: encodeURI(
      `${location.href}${
        isNoParams ? `?type=json${key ? `&key=${key}` : ''}` : '&type=json'
      }`
    ),
    then: (data) =>
      data.map(({ name, params }) => {
        const item = {
          resource: name,
          link: `${location.origin}/${params}`,
        }
        return item
      }),
  },
}).render(document.getElementById('wrapper'))
