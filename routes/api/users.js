const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const passport = require('passport')

// Load input validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

// Load User Model, that is the database structure.
const User = require('../../models/User')

// @route GET api/users/test
// @tests user routes
// @access public route
router.get('/test', (req, res) => res.json({
  msg: 'Users works'
}))

// @route GET api/users/register
// @tests Register users
// @access public route
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body)

// Check Validation
  if (!isValid) {
    return res.status(400).json(errors)
  }

  // Find user by email, for validation purposes
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        errors.email = 'Email already exists'
        return res.status(400).json(errors)
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: '200', // Size
          r: 'pg',  // Ratings
          d: 'mm'   // Default
        })

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password
        })

        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            console.log(err)
          }
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            // If there is error, error will be returned.
            if (err) {
              console.log(err)
            }
            // If no error found, the hash will replace the password.
            newUser.password = hash
            // Saving the new user returns a promise including success and failure.
            newUser.save()
              .then(user => res.json(user))
              .catch(err => console.log(err))
          })
        })
      }
    })
})

// @route GET api/users/login
// @dec Login user /Returning JWT Token
// @access public route
router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body)

// Check Validation
  if (!isValid) {
    return res.status(400).json(errors)
  }

  const email = req.body.email
  const password = req.body.password

  // Find User by Email
  User.findOne({email}).then(user => {
     // Check for user
    if (!user) {
      errors.email = 'User not found'
      return res.status(404).json(errors)
    }

     // Check Password
    bcrypt.compare(password, user.password)
       .then(IsMatch => {
         if (IsMatch) {
           // User matched

           const payload = { id: user.id, name: user.name, avatar: user.avatar } // Create jwt payload

           // Sign token
           jwt.sign(
             payload,
             keys.secretOrkey,
             { expiresIn: 2520 },
             (err, token) => {
               if (err) {
                 console.log(err)
               }
               //
               res.json({
                 success: true,
                 token: 'Bearer ' + token
               })
             })
         } else {
           errors.password = 'Password incorrect'
           res.status(400).json(errors)
         }
       })
  }).catch(err => console.log(err))
})

// @route GET api/users/current
// @Returns the current user
// @access private
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    })
  }
)

module.exports = router
