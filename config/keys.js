if (process.env.NODE_ENV === 'production') {
  console.log('In production')
  module.exports = require('./keys_prod')
} else {
  console.log('In development')
  module.exports = require('./keys_dev')
}
