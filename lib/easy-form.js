const url = document.currentScript.getAttribute('data-url')

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
  const querys = formEntries.filter(([key]) => key.includes('_query'))
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
          Headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      : undefined

  fetch(`${url}${fetchEndpoint}${params}${querys}`, fetchOptions)
    .then((res) => res.json())
    .then(alert)
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
