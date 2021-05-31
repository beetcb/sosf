function initDocument() {
  document.body.innerHTML = `
    <div class="max-w-lg mx-auto justify-center font-serif">
    <h1 class="m-4 text-purple-600 text-center text-2xl">
      SOSF Index
    </h1>
    <p class="m-1 text-center text-gray-400">
      Usage: Type a keyword below to search for your files
    </p>
    <div id="wrapper"></div>
      <footer>
      <div class="text-gray-400 text-center m-8">
        Made by
        <a href="https://github.com/beetcb" class="text-purple-600"
          >@beetcb</a
        >
        </div>
        </footer>
      </div>
  `

  // render table
  const { id, key, type } = Object.fromEntries(
    new URL(location.href).searchParams,
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
            'Link',
          )
        },
      },
    ],
    search: true,
    server: {
      url: encodeURI(
        `${location.href}${
          isNoParams ? `?type=json${key ? `&key=${key}` : ''}` : '&type=json'
        }`,
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

  // center the search box
  const searchHead = document.getElementsByClassName('gridjs-head')[0]
  searchHead.classList.add('flex', 'justify-center', 'm-4')
}

initDocument()
