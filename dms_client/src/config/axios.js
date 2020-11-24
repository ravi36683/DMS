import axios from 'axios';
import { server } from './keys';

export const userInstance = () => {
  return axios.create({
    baseURL: `${server}/users`,
    headers: {
      Authorization: localStorage.getItem('usertoken')
        ? `${'Bearer' + ' '}${localStorage.getItem('usertoken')}`
        : '',
    },
    withCredentials: true,
  });
};