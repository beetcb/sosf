const h = gridjs.h

function copyText(data) {
  navigator.clipboard.writeText(data)
}

function initDocument() {
  document.body.innerHTML = `
  <script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"></script>
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
  const { id, key, type, path } = Object.fromEntries(
    new URL(location.href).searchParams,
  )
  const isNoParams = !(id || key || type || path)
  const grid = new gridjs.Grid({
    columns: [
      'Resource',
      {
        name: 'Link',
        hidden: true,
      },
      {
        name: 'Actions',
        formatter: (_, row) => {
          const linkData = row.cells[1].data
          const isFolder = row.cells[0].data.endsWith('/')
          return isFolder
            ? linkData === ''
              ? h(
                'div',
                {
                  onClick: () => history.back(),
                  className: 'cursor-pointer',
                },
                h('i', {
                  className: 'text-indigo-500',
                  'data-feather': 'folder',
                }),
              )
              : h(
                'a',
                {
                  className: 'cursor-pointer',
                  href: linkData,
                },
                h('i', {
                  className: 'text-indigo-500',
                  'data-feather': 'folder',
                }),
              )
            : h(
              'div',
              {
                className: 'cursor-pointer',
                onClick: () => copyText(linkData),
              },
              h('i', {
                'data-feather': 'copy',
              }),
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
      then: (data) => {
        const fromData = data.map(({ name, params }) => {
          const item = {
            resource: name,
            link: `${location.origin}/${params}`,
          }
          return item
        })

        if (!isNoParams) {
          fromData.unshift({
            resource: '../',
            link: '',
          })
        }
        return fromData
      },
    },
  })
    .render(document.getElementById('wrapper'))
    .on('ready', () => {
      if (!feather.isInitialized) {
        feather.replace()
        feather.isInitialized = true
      }
    })

  // center the search box
  const searchHead = document.getElementsByClassName('gridjs-head')[0]
  searchHead.classList.add('flex', 'justify-center', 'm-4')
}

initDocument()
