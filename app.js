require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require('express-session')
const passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));//Express looks up the files in the order in which you set the static directories with the express
app.set('view engine', 'ejs');


app.use(session({ //NOTE this line should be below the app.use lines as this is written
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());//NOTE this line should be below the app.use(session..) line as this is written
app.use(passport.session());//NOTE this line should be below the app.use(passport.initialize()) line as this is written
//the above line app.use(passport.session()) is used to create a seesion

mongoose.connect('mongodb://localhost:27017/secretsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
    } else {
        console.log('Error in DB connection: ' + err)
    }
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email:String,
    password:String
})

userSchema.plugin(passportLocalMongoose);//Note this line should be in between schema and mongoose.model line as this is written

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); //these 3 lines should be below the mongoose.model line as this is written

app.get("/",(req,res)=>{
    res.render("home"); //rendering the home.ejs file
})

app.get("/login",(req,res)=>{
    res.render("login");//rendering the login.ejs file
})

app.get("/register",(req,res)=>{
    res.render("register"); //rendering the register.ejs file
})

app.get("/secrets", (req,res)=>{
    if(req.isAuthenticated()){

        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
})

app.get("/logout", (req,res)=>{
    req.logout();
    res.redirect("/");
})


app.post("/register", (req,res)=>{
    console.log(req.body);

    User.register({username:req.body.username}, req.body.password, function (err,user) {

        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res, function () {

                res.redirect("/secrets");
            })
        }
    })
})

app.post("/login", (req,res)=>{

    const user = new User({
        username: req.body.username,
        password:req.body.password
    })

    req.login(user, function(err) {
        if (err) {
            console.log(err );
            return next(err); 
        }
        passport.authenticate("local")(req,res, function () {

            res.redirect("/secrets");
        })
    });
})

app.listen(5000, ()=>{
    console.log("server has started at port 3000 ...");
})
