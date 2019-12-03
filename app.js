var express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    User = require('./models/user'),
    app = express()

// MONGOOSE CONFIG
mongoose.connect('mongodb://localhost:27017/fwitter', {useNewUrlParser: true, useUnifiedTopology: true})

//PASSPORT CONFIG
passport.serializeUser((user,done)=>{
    done(null,user);
});

passport.deserializeUser((obj,done)=>{
    done(null,obj);
});

app.use(require("express-session")({
    secret: 'i am root',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// General Configuration
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect('/home')
})

app.get('/home', (req, res) => {
    res.render('home', {user: req.user})
})

// Authorization Routes 

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get('/login', (req, res) => {
    if(req.user == null){
        return res.render('login');
    } else {res.redirect('/')}
});

app.post('/login', passport.authenticate('local',{successRedirect: "/", failureRedirect: "/failed"}),
  function(req, res, next){
});

app.get('/signup', (req, res) => {
    if(req.user == null){
        return res.render('signup');
    } else {res.redirect('/')}
});

app.post('/signup', (req, res) => {
    var newUser = new User({username: req.body.username, name: req.body.name});
    User.register(newUser, req.body.password, (err, user) => {
        if(err){
            console.log(err);
            return res.render('signup');
        }
        passport.authenticate('local')(req, res, ()=> {
            res.redirect('/');
        });
    });
});

app.listen(3000, () => {
    console.log('Listening on port 3000')
})