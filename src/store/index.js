import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userToken: sessionStorage.getItem('token'),
    role: sessionStorage.getItem('role'),
    rightList: JSON.parse(sessionStorage.getItem('rightList') || '[]'),
    username: sessionStorage.getItem('username'),
    photo: sessionStorage.getItem('photo')
  },
  mutations: {
    setToken (state, Token) {
      state.userToken = Token
      sessionStorage.setItem('token', Token)
    },
    setRole (state, data) {
      state.role = data
      sessionStorage.setItem('role', data)
    },
    setRightList (state, data) {
      state.rightList = data
      sessionStorage.setItem('rightList', JSON.stringify(data))
    },
    setUsername (state, data) {
      state.username = data
      sessionStorage.setItem('username', data)
    },
    setPhoto (state, data) {
      state.photo = data
      sessionStorage.setItem('photo', data)
    }
  },
  getters: {
    getToken: state => state.userToken
  },
  actions: {
  },
  modules: {
  }
})
