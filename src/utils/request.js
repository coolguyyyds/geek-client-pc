import axios from 'axios'
import auth from '@/utils/auth'
import router from '@/router'
const request = axios.create({
  baseURL: 'http://geek.itheima.net/',
  timeout: 5000
})
// 添加请求拦截器
request.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  const token = auth.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})
// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  return response
}, function (error) {
  // 对响应错误做点什么
  if (error.response && error.response.status === 401) {
    auth.removeToken()
    router.push('/login')
  }
  return Promise.reject(error)
})
export default request
