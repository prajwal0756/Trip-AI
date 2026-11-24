import axios from 'axios'

const TOKEN_KEY = 'tripai_access_token'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// --------------------------------------------------
// Automatically attach JWT to authenticated requests
// --------------------------------------------------

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

export default api