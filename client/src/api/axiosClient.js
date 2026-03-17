import axios from 'axios' 

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
})

//##### Attach JWT token to every request automatically #####
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config 
})

//##### Handle expired tokens globally #####
axiosClient.interceptors.response.use(
    (response) => response, 
    (error) => {
        if (error.response?.status === 404) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error) 
    }
)

export default axiosClient