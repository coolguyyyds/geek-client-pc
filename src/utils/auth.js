const KEY = 'geek-client-pc-store'

export default {
  setToken (token) {
    localStorage.setItem(KEY, token)
  },
  getToken () {
    return localStorage.getItem(KEY)
  },
  removeToken () {
    localStorage.removeItem(KEY)
  }
}
