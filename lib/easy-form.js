const url = document.currentScript.getAttribute('data-url')

function startStyling() {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://easy-js.netlify.app/assets/lib/easy-form.css'
  document.head.prepend(link)
}

function handleHtmlTable(data) {
  const table = document.createElement('table')
  const thead = document.createElement('thead')
  const tbody = document.createElement('tbody')

  const headers = Object.keys(data[0])

  thead.innerHTML = `
    <tr>
      ${headers.map((val) => `<th>${val}</th>`).join('')}
    </tr>
  `

  for (const el of data) {
    const values = Object.values(el)
    tbody.innerHTML += `
      <tr>
        ${values.map((val) => `<td>${val}</td>`).join('')}
      </tr>
    `
  }

  document.body.innerHTML += `
    <dialog id="result-dialog" open>
      <div></div>
      <button onclick="document.getElementById('result-dialog').open = false">
        Close
      </button>
    </dialog>
  `

  table.appendChild(thead)
  table.appendChild(tbody)
  document.querySelector('#result-dialog div').appendChild(table)
}

function handleResponse(data) {
  if (typeof data === 'object') {
    handleHtmlTable(data)
    return
  }
  alert(data)
}

function filterPrivateProps(formObj) {
  for (const key in formObj) {
    if (key[0] === '_') {
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

function handleQuerys(formEntries) {
  const querys = formEntries.filter(
    ([key, val]) => key.includes('_query') && val,
  )
  let urlQuerys = querys.length > 0 ? '?' : ''

  for (const [key, val] of querys) {
    const queryName = key.split('_')[2]
    const and = urlQuerys.includes('=') ? '&' : ''
    urlQuerys += `${and}${queryName}=${val}`
  }

  return urlQuerys
}

async function handleFetch({ params, querys, formObj, stdMethod }) {
  const { _endpoint, _method } = formObj

  const fetchMethod = _method || stdMethod
  const fetchEndpoint = _endpoint || ''

  const body = filterPrivateProps(formObj)

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

  await fetch(`${url}${fetchEndpoint}${params}${querys}`, fetchOptions)
    .then((res) => res.json())
    .then(handleResponse)
    .catch(console.error)
}

function bootstrap() {
  if (!url) {
    throw new Error('data-url attribute missing in html script tag')
  }

  for (const form of document.querySelectorAll('form')) {
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const formEntries = [...new FormData(form).entries()]
      const params = handleParams(formEntries)
      const querys = handleQuerys(formEntries)
      handleFetch({
        params,
        querys,
        formObj: Object.fromEntries(formEntries),
        stdMethod: form.method,
      })
    })
  }
}
addEventListener('DOMContentLoaded', bootstrap)
startStyling()
