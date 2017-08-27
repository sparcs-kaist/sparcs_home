const localConfig = require('../localconfig')
const sparcsRequired = require('./sparcsrequired')

const axios = require('axios').create({
  baseURL: localConfig.nuguEndpoint,
})

const authAxios = require('axios').create({
  baseURL: localConfig.nuguEndpoint,
  auth: {
    username: localConfig.nuguId,
    password: localConfig.nuguPassword,
  },
})

const getPublicUsers = (req, res) => {
  axios.get(`/public_users`)
    .then(result => {
      res.status(200).send(result.data)
    })
    .catch(err => {
      res.status(500).send(err)
    })
}

const getUsers = sparcsRequired((req, res) => {
  authAxios.get(`/users`)
    .then(result => {
      res.status(200).send(result.data)
    })
    .catch(err => {
      res.status(500).send(err)
    })
})

const getUserDetail = sparcsRequired((req, res) => {
  const { user_id } = req.params
  authAxios.get(`/users/${user_id}`)
    .then(result => {
      res.status(200).send(result.data)
    })
    .catch(err => {
      res.status(500).send(err)
    })
})

module.exports = app => {
  app.get('/api/nugu/public_users', getPublicUsers)
  app.get('/api/nugu/users', getUsers)
  app.get('/api/nugu/users/:user_id', getUserDetail)
}
