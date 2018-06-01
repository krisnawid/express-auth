const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const config = require('./config/database')
// const { check, validationResult } = require('express-validator/check');

//include Router
const articlesRouter = require('./routes/articles')
const usersRouter = require('./routes/users')

mongoose.connect(config.database)
let db = mongoose.connection

//check connection
db.once('open', () => {
    console.log('DB connected')
})

//check for DB errors
db.on('error', (err) => {
    console.log(err)
})

//init app
const app = express()

//bring in models
let Article = require('./models/articles')

//load view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

//use bodyparser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//use method-override
app.use(methodOverride('_method'))

//set static folder
app.use(express.static(path.join(__dirname,'public')))
app.use('/bootstrap',express.static(path.join(__dirname,'node_modules/bootstrap/dist')))
app.use('/popper',express.static(path.join(__dirname,'node_modules/popper.js/dist')))
app.use('/jquery',express.static(path.join(__dirname,'node_modules/jquery/dist')))

//Express-session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}))

//Express-messaging
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Passport config
require('./config/passport')(passport)
//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next)=>{
    res.locals.user = req.user || null
    next()
})

//Home route
app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if (err) {
            console.log(err)
        } else {
            res.render('index', {
                title: 'Articles',
                articles: articles
            })    
        }
    })
})

//Routing
app.use('/articles', articlesRouter)
app.use('/users', usersRouter)

//start server
app.listen(3000, () => {
    console.log('Server started at http://localhost:3000')
})