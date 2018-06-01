const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs')
const passport = require('passport')

//include Article Module
let User = require('../models/users')

//Register form
router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register',[
    check('name').isLength({min:1}).trim().withMessage('Name is required'),
    check('email').isLength({min:1}).trim().withMessage('Email is required'),
    check('email').isEmail().withMessage('Email is invalid'),
    check('username').isLength({min:1}).trim().withMessage('Username is required'),
    check('password').isLength({min:1}).trim().withMessage('Password is required'),
    check('password2').custom((value, { req }) => value === req.body.password).withMessage('Password do no match'),
] ,(req, res) => {
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) {
        res.render('register',{
            errors:errors.mapped()
        })
    } else {
        let newUser = new User({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        })
        
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(newUser.password, salt, (err, hash)=>{
                if (err) {
                    console.log(err)
                }
                newUser.password = hash
                newUser.save((err)=>{
                    if (err) {
                        console.log(err)
                        return
                    } else {
                        req.flash('success','You are now registered and can log in')
                        res.redirect('/users/login')
                    }
                })
            })
        })
    }
})

//Login form
router.get('/login', (req, res)=>{
    res.render('login')
})

//Login process
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', { 
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true 
    })(req, res, next)
})

//Logout
router.get('/logout', (req, res)=>{
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
})

module.exports = router