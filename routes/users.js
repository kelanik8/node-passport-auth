const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/User');
// Login Page
router.get('/login', (req, res) => {
    res.render("Login");
});

// Register Page
router.get('/register', (req, res) => {
    res.render("register");
});

router.post('/register', (req, res) => {
    console.log(req.body);
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if(!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields'});
    }

    if(password !== password2){
        errors.push({ msg: 'Passwords do not match'});
    }

    if(password.length < 6){
        errors.push({ msg: 'Password shouls be at least 6 characters'});
    }

    if(errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        User.findOne({ email: email })
            .then(user => {
                if(user) {
                    errors.push({ msg: 'Email is already registered.'})
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name: name,
                        email: email,
                        password: password
                    });
                    
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(newUser.password, salt, function(err, hash){
                            if(err) throw err;
                            newUser.password = hash;

                            newUser.save()
                                    .then(user => {
                                        req.flash('success_msg', 'You are now registered and you can now log in');
                                        res.redirect('/users/login');
                                    })
                                    .catch(err => console.log(err));
                            console.log(newUser);
                        });
                    });
                }
            });
    }

});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;