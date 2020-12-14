require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");
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

const secret = process.env.SECRET; //encryptionKey
//userSchema.plugin(encrypt,{secret:secret}); 
//above one will encrypt the whole thing we dont want , we just want to encrypt password

userSchema.plugin(encrypt,{secret:secret,encryptedFields: ["password"]});//this line should always be before the mongoose.model line i.e the below one


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
    //console.log(req.body);
    //console.log(req.body.password); so even though we have encrypted password to store in db , here we can
    // know the password what the user has typed 

    const newUser = new User({
        email:req.body.username,
        password:req.body.password
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
})

app.post("/login", (req,res)=>{
    //console.log(req.body);

    let username = req.body.username;
    let password = req.body.password;
    //console.log(password);so even though we have encrypted password to store in db , here we can
    // know the password what the user has typed 

    User.findOne({
        email : username
    }).then((foundUser) => {
        if (!foundUser) {
            //console.log("not found")
            res.send("email found");
        } else{
            //console.log(foundUser);
            if(foundUser.password === password){
                res.render("secrets");
            }
            else{
                res.send("incorrect password");
            }
        }
    });
})

app.listen(3000, ()=>{
    console.log("server has started at port 3000 ...");
})
