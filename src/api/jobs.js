import axios from 'axios'

export default {
  async create({ output }) {
    return axios.post('/api/jobs', { output }).then(r => r.data)
  },
  async get(id) {
    return axios.get(`/api/jobs/${id}`).then(r => r.data)
  }
}
