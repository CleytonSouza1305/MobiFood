const API_URL = {
  dev: 'http://localhost:3000',
  prod: 'https://api.mobifood.com'
}

let BASE_URL = ''
if (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
) {
  BASE_URL = API_URL.dev
} else {
  BASE_URL = API_URL.prod
}

export { BASE_URL }