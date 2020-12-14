const express = require("express");
const ejs = require("ejs");
const mongoose = require('mongoose');
//const md5 = require("md5");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();

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

const userSchema = new mongoose.Schema({
    email:String,
    password:String
})

const User = mongoose.model("User", userSchema);


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));//Express looks up the files in the order in which you set the static directories with the express
app.set('view engine', 'ejs');

app.get("/",(req,res)=>{
    res.render("home"); //rendering the home.ejs file
})

app.get("/login",(req,res)=>{
    res.render("login");//rendering the login.ejs file
})

app.get("/register",(req,res)=>{
    res.render("register"); //rendering the register.ejs file
})


app.post("/register", (req,res)=>{

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

        const newUser = new User({
            email:req.body.username,
            password:hash
        })
        newUser.save((err)=>{
            if(err){
                console.log(err);
            }
            else{
                //res.render("secrets");
                res.redirect("/login");
            }
        });
        
    });
})

app.post("/login", (req,res)=>{
    //console.log(req.body);

    let username = req.body.username;
    let password = req.body.password;
    

    User.findOne({
        email : username
    }).then((foundUser) => {
        if (!foundUser) {
            //console.log("not found")
            res.send("email not found");
        } 
        
        else{
            //console.log(foundUser);
            bcrypt.compare(password, foundUser.password, function(err, result) {
                
                if(result === true){
                    res.render("secrets");
                }
                else{
                    res.send("incorrect password");
                }

            });
        }
    });
})

app.listen(5000, ()=>{
    console.log("server has started at port 3000 ...");
})
