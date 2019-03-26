const express = require('express');
const config = require('./config/config');
const expressLayouts = require('express-ejs-layouts');
const flash  = require('connect-flash');
const session = require('express-session');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');


require('./config/passport')(passport);

//DB Config
mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true })
        .then(() => console.log('MongoDB connected...'))
        .catch(err => console.log(`Error: ${err}`));


app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
// Connect flash
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const PORT = config.PORT;

app.listen(PORT, () => {
    console.log(`Server started on PORT ${PORT}`)
});