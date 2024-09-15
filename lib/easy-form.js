const url = document.currentScript.getAttribute('data-url')

const createEl = (tag) => document.createElement(tag)
const setProps = (el, props) => Object.assign(el, props)

function startStyling() {
  const link = createEl('link')
  setProps(link, {
    rel: 'stylesheet',
    href: 'https://easy-js.netlify.app/assets/lib/easy-form.css',
  })
  document.head.prepend(link)
}

function createResultDialog(dataEl) {
  const dialog = createEl('dialog')
  dialog.id = 'result-dialog'

  const closeBtn = createEl('button')
  setProps(closeBtn, {
    textContent: 'Close',
    onclick: () => {
      dialog.remove()
    },
  })

  const div = createEl('div')
  div.appendChild(dataEl)

  dialog.appendChild(div)
  dialog.appendChild(closeBtn)
  document.body.appendChild(dialog)

  dialog.showModal()
}

function handleHtmlTable(data) {
  const table = createEl('table')
  const thead = createEl('thead')
  const tbody = createEl('tbody')

  const headers = Object.keys(data[0])

  const headRow = createEl('tr')
  for (const val of headers) {
    const th = createEl('th')
    th.textContent = val
    headRow.appendChild(th)
  }
  thead.appendChild(headRow)

  for (const el of data) {
    const values = Object.values(el)
    const row = createEl('tr')
    for (const val of values) {
      const td = createEl('td')
      td.textContent = val
      row.appendChild(td)
    }
    tbody.appendChild(row)
  }

  table.appendChild(thead)
  table.appendChild(tbody)
  createResultDialog(table)
}

function handleResponse(data) {
  const isObject = typeof data === 'object'
  const objectKeys = isObject && Object.keys(data)
  const firstProp = isObject && data[objectKeys[0]]

  if (typeof firstProp === 'string' && objectKeys.length === 1) {
    createResultText(firstProp)
    return
  }

  if (isObject) {
    handleHtmlTable(Array.isArray(data) ? data : [data])
    return
  }

  createResultText(data)
}

function createResultText(msg) {
  if (!msg) {
    return
  }

  const res = createEl('p')
  setProps(res, {
    id: 'result-text',
    textContent: msg,
  })

  createResultDialog(res)
}

function filterValidProps(formObj) {
  for (const key in formObj) {
    if (key[0] === '_' || !formObj[key]) {
      delete formObj[key]
    }
  }
  return formObj
}

function handleParams(formEntries) {
  const params = formEntries.filter(([key]) => key.includes('_param'))
  let urlParams = ''

  for (const [_, val] of params) {
    urlParams += `/${val}`
  }

  return urlParams
}

function handleQueries(formEntries) {
  const queries = formEntries.filter(
    ([key, val]) => key.includes('_query') && val,
  )
  let urlQueries = queries.length > 0 ? '?' : ''

  for (const [key, val] of queries) {
    const queryName = key.split('_')[2]
    const and = urlQueries.includes('=') ? '&' : ''
    urlQueries += `${and}${queryName}=${val}`
  }

  return urlQueries
}

function handleError(res) {
  const error = createEl('div')
  error.id = 'error-result'

  const title = createEl('h2')
  title.textContent = res.status

  const text = createEl('p')
  text.textContent = res.statusText

  error.appendChild(title)
  error.appendChild(text)
  createResultDialog(error)

  throw res
}

function handleFetch({ params, queries, formObj, stdMethod }) {
  const { _endpoint, _method } = formObj

  const fetchMethod = _method || stdMethod
  const fetchEndpoint = _endpoint || ''

  const body = filterValidProps(formObj)

  const fetchOptions =
    fetchMethod.toLowerCase() !== 'get'
      ? {
          method: fetchMethod,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      : undefined

  fetch(`${url}${fetchEndpoint}${params}${queries}`, fetchOptions)
    .then((res) => (res.ok ? res.json() : handleError(res)))
    .then(handleResponse)
    .catch((err) => createResultText(err.message))
}

function bootstrap() {
  if (!url) {
    const msg = 'Atributo data-url faltando na tag script'
    createResultText(msg)
    throw new Error(msg)
  }

  for (const form of document.querySelectorAll('form')) {
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const formEntries = [...new FormData(form).entries()]
      const params = handleParams(formEntries)
      const queries = handleQueries(formEntries)
      handleFetch({
        params,
        queries,
        formObj: Object.fromEntries(formEntries),
        stdMethod: form.method,
      })
    })
  }
}

startStyling()
addEventListener('DOMContentLoaded', bootstrap)
