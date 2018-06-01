const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check');

//include Article Module
let Article = require('../models/articles')
let User = require('../models/users')

//Add route
router.get('/add', ensureAuthenticated ,(req, res) => {
    res.render('add_article', {
        title: 'Add article'
    })
})

//Add submit post route
router.post('/add',[
    check('title').isLength({min:1}).trim().withMessage('Title required'),
    // check('author').isLength({min:1}).trim().withMessage('Author required'),
    check('body').isLength({min:1}).trim().withMessage('Body required')
    ], (req, res) => {
    let article = new Article();
    article.title = req.body.title
    article.author = req.user._id
    article.body = req.body.body

    //get errors
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log(errors);
        res.render('add_article',
        {
        title: 'Add article',            
        article:article,
        errors: errors.mapped()
        });
    } else {
        article.save((err) => {
            if (err) {
                console.log(err)
                return            
            } else {
                req.flash('success', 'Article Added')
                res.redirect('/')    
            }
        });
    }
})

//edit single article
router.get('/edit/:id', ensureAuthenticated ,(req,res)=>{
    Article.findById(req.params.id, (err, article)=>{
        if (article.author != req.user._id) {
            req.flash('danger', 'Not Authorized')
            res.redirect('/')
        }
        res.render('edit_article', {
            title: 'Edit Article',
            article:article
        })
    })
})

//edit submit post route
router.post('/edit/:id',[
    check('title').isLength({min:1}).trim().withMessage('Title required'),
    // check('author').isLength({min:1}).trim().withMessage('Author required'),
    check('body').isLength({min:1}).trim().withMessage('Body required')
    ], (req, res) => {
    let article = {};
    article.title = req.body.title
    article.author = req.user._id
    article.body = req.body.body
    
    let query = {_id:req.params.id}

    //get errors
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log(errors);
        res.render('edit_article', {
            title: 'Edit Article',
            article:article,
            errors: errors.mapped()    
        })
    } else {
        Article.update(query, article, (err)=>{
            if (err) {
                console.log(err)
                return            
            } else {
                req.flash('success', 'Article Updated')  
                return res.redirect('/')    
            }
        });
    }
})

//Add submit post route
router.delete('/:id', (req, res) => {
    let query = {_id:req.params.id}
    
    Article.remove(query, (err)=>{
        if (err) {
            console.log(err)
        }else{
            res.redirect('/')
        }
    })
})

//get single article
router.get('/:id', (req,res)=>{
    Article.findById(req.params.id, (err, article)=>{
        User.findById(article.author, (err, user)=>{
            res.render('article', {
                article:article,
                author: user.name
            })
        })
    })
})

//Access control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    } else {
        req.flash('danger', 'Please Log In')
        res.redirect('/users/login')
    }
}

module.exports = router