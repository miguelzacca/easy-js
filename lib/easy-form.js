const url = document.currentScript.getAttribute('data-url')

const createEl = (tag) => document.createElement(tag)
const setProps = (el, props) => Object.assign(el, props)

function styleDocument() {
  const link = createEl('link')
  setProps(link, {
    rel: 'stylesheet',
    href: 'https://easy-js.netlify.app/assets/lib/easy-form.css',
  })
  document.head.prepend(link)
}

function throwResultDialog(dataEl) {
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

function throwHtmlTable(data) {
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
  throwResultDialog(table)
}

function isObjectMsg(obj) {
  const objectKeys = Object.keys(obj)
  const firstProp = obj[objectKeys[0]]
  if (typeof firstProp === 'string' && objectKeys.length === 1) {
    return firstProp
  }
}

function handleJsonResponse(data) {
  const isObject = typeof data === 'object'
  const objMsg = isObject && isObjectMsg(data)

  if (objMsg) {
    throwTextResult(objMsg)
    return
  }

  if (isObject) {
    throwHtmlTable(Array.isArray(data) ? data : [data])
    return
  }

  throwTextResult(data)
}

function throwTextResult(msg) {
  if (!msg) {
    return
  }

  const res = createEl('p')
  setProps(res, {
    id: 'result-text',
    textContent: msg,
  })

  throwResultDialog(res)
}

function filterValidProps(formObj) {
  for (const key in formObj) {
    if (key[0] === '_' || !formObj[key]) {
      delete formObj[key]
    }
  }
  return formObj
}

function getParams(formEntries) {
  const params = formEntries.filter(
    ([key, val]) => key.includes('_param') && val,
  )
  let urlParams = ''

  for (const [_, val] of params) {
    urlParams += `/${val}`
  }

  return urlParams
}

function getQueries(formEntries) {
  const queries = formEntries.filter(
    ([key, val]) => key.includes('_query') && val,
  )
  let urlQueries = queries.length > 0 ? '?' : ''

  for (const [key, val] of queries) {
    const queryName = key.split('_')[2]
    const and = urlQueries.length > 1 ? '&' : ''
    urlQueries += `${and}${queryName}=${val}`
  }

  return urlQueries
}

async function throwErrorResponse(res) {
  const { status, statusText } = res
  const data = await res.json().catch(console.error)

  const isObject = typeof data === 'object'
  const isString = typeof data === 'string'
  const msg = isString ? data : isObject && isObjectMsg(data)

  const error = createEl('div')
  error.id = 'error-result'

  const title = createEl('h2')
  title.textContent = status

  const text = createEl('p')
  text.textContent = msg || statusText

  error.appendChild(title)
  error.appendChild(text)
  throwResultDialog(error)

  throw res
}

function fetchHandler({ params, queries, formObj, stdMethod }) {
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
    .then((res) => (res.ok ? res.json() : throwErrorResponse(res)))
    .then(handleJsonResponse)
    .catch((err) => throwTextResult(err.message))
}

function bootstrap() {
  if (!url) {
    const msg = 'Atributo data-url faltando na tag script'
    throwTextResult(msg)
    throw new Error(msg)
  }

  for (const form of document.querySelectorAll('form')) {
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const formEntries = [...new FormData(form).entries()]
      const params = getParams(formEntries)
      const queries = getQueries(formEntries)
      fetchHandler({
        params,
        queries,
        formObj: Object.fromEntries(formEntries),
        stdMethod: form.method,
      })
    })
  }
}

styleDocument()
addEventListener('DOMContentLoaded', bootstrap)
