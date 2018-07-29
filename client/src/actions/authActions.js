import axios from 'axios'
import setAuthToken from '../utils/setAuthToken'
import jwt_decode from 'jwt-decode'

import {
  GET_ERRORS,
  SET_CURRENT_USER
} from './types'

// Register user
export const registerUser = (userData, history) => dispatch => {
  axios
    .post('/api/users/register', userData)
    .then(res => history.push('/login'))
    .catch((err) =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    )
}
// Login - Get User token
export const loginUser = userData => dispatch => {
  axios.post('/api/users/login', userData)
    .then(res => {
      // Save to localStorage
      const {
        token
      } = res.data
      // Set token to localstorage
      localStorage.setItem('jwtToken', token)
      // Set token to auth header
      setAuthToken(token)
      // Decode token to get user data
      const decoded = jwt_decode(token)
      // set current user
      dispatch(setCurrentUser(decoded))
      console.log(decoded)
    })
    .catch((err) =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    )
}

// Set login user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  }
}

// export { registerUser, loginUser, setCurrentUser }
// export default setCurrentUser

// Log user out
export const logoutUser = () => dispatch => {
  // Remove the token fron localStorage
  localStorage.removeItem('jwtToken')
  // Remove auth header for future request
  setAuthToken(false)
  // Set the current user to {} which will also set the isAuthenticated to false
  dispatch(setCurrentUser({}))
}
