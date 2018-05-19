/* eslint-disable no-undef, arrow-body-style, no-param-reassign, no-console, camelcase */
import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

const api = 'https://dapi.votolegal.com.br/api2';

export default new Vuex.Store({
  state: {
    paymentStep: 'selectValue',
    amount: 0,
    token: '',
    donation: {},
    iugu: {},
    messages: [],
    username: {},
    candidate: {},
    donations: [],
  },
  mutations: {
    SET_PAYMENT_STEP(state, { data }) {
      state.paymentStep = data.step;
    },
    SET_PAYMENT_AMOUNT(state, { data }) {
      state.amount = data.amount;
    },
    SET_TOKEN(state, { token }) {
      state.token = token;
    },
    SET_USERNAME(state, { user }) {
      state.username = user;
    },
    SET_DONATION(state, { donation }) {
      state.donation = donation;
    },
    SET_IUGU(state, { iugu }) {
      state.iugu = iugu;
    },
    SET_MESSAGES(state, { messages }) {
      state.messages = messages;
    },
    SET_CANDIDATE(state, { res }) {
      state.candidate = res.candidate;
    },
    SET_DONATIONS(state, { res }) {
      state.donations = res.donations;
    },
  },
  actions: {
    CHANGE_PAYMENT_AMOUNT({ commit }, data) {
      commit('SET_PAYMENT_STEP', { data });
      commit('SET_PAYMENT_AMOUNT', { data });
    },
    CHANGE_PAYMENT_STEP({ commit }, data) {
      commit('SET_PAYMENT_STEP', { data });
    },
    SAVE_USERNAME({ commit }, user) {
      commit('SET_USERNAME', { user });
    },
    GET_TOKEN({ commit }, data) {
      return new Promise((resolve, reject) => {
        axios({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          url: `${api}/device-authentication`,
          data,
        }).then((response) => {
          const { device_authorization_token_id } = response.data;
          commit('SET_TOKEN', { token: device_authorization_token_id });
          resolve(response);
        }).catch((err) => {
          console.log('eroooooo', error.response.data);
          console.error(err.response);
          reject(err.response);
        });
      });
    },
    GET_DONATION({ commit }, data) {
      return new Promise((resolve, reject) => {
        axios({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          url: `${api}/donations`,
          data,
        }).then(
          (response) => {
            const { donation, ui } = response.data;
            commit('SET_DONATION', { donation });
            commit('SET_IUGU', { iugu: ui.messages[1] });
            resolve();
          },
          (err) => {
            console.error(err.response);
            reject(err.response);
          },
        );
      });
    },
    START_DONATION({ commit, state }, payload) {
      return new Promise((resolve, reject) => {
        axios({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          url: `${api}/donations/${state.donation.id}?device_authorization_token_id=${
            state.token}&credit_card_token=${payload.id}&cc_hash=${payload.cc_hash}`,
        }).then(
          (response) => {
            const data = {
              step: 'finalMessage',
            };

            commit('SET_MESSAGES', { messages: response.data.ui.messages });
            commit('SET_PAYMENT_STEP', { data });

            resolve();
          },
          (err) => {
            console.error(err.response);
            reject(err.response);
          },
        );
      });
    },
    GET_CANDIDATE_INFO({ commit }, id) {
      return new Promise((resolve, reject) => {
        axios.get(`https://dapi.votolegal.com.br/api/candidate/${id}`).then(
          (response) => {
            commit('SET_CANDIDATE', { res: response.data });
            resolve();
          },
          (err) => {
            reject(err.response);
            console.error(err);
          },
        );
      });
    },
    GET_DONATIONS({ commit }, id) {
      return new Promise((resolve, reject) => {
        axios.get(`https://dapi.votolegal.com.br/api/candidate/${id}/donate`).then(
          (response) => {
            commit('SET_DONATIONS', { res: response.data });
            resolve();
          },
          (err) => {
            reject(err.response);
            console.error(err);
          },
        );
      });
    },
  },
});
