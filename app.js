const express = require("express");
const ejs = require("ejs");
const app = express();
const port = 3000;
const mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');
require('dotenv').config()

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://darshnagdeve35:pmta1WlrkBSYk3pO@cluster0.yvb14bv.mongodb.net/userDB")

const userSchema = new mongoose.Schema(
  {
    email:String,
    password:String,
  })

  var secret = "someverylongnoteasytoguessstring"

userSchema.plugin(encrypt, { secret: process.env.SECRET_KEY ,encryptedFields:["password"]});

  const user = mongoose.model("user",userSchema)

app.get('/', (req, res) => {
  res.render('home');
});
 
app.get('/login', (req, res) => {
  res.render('login');
});
 
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register',function(req,res)
{
    async function saveUser(){
      
    try {
      const newUser = new user(
        {
          email:req.body.username,
          password:req.body.password,
        })

      newUser.save();

    } catch (error) {
      console.error(error)
    } }

    saveUser();
})

app.listen(port, () => console.log(`Server started at port: ${port}`)
);

app.post('/login', (req, res) => {

  async function tally_user()
  {
    const email = req.body.username
    const password = req.body.password
    
  try {
    const findUser = await user.findOne({email:email,password:password})
   if(findUser)
   {
    if (findUser.password==password) {
      res.render("secrets")
    } else {
      console.log("user not found")
    }
   }

  } catch (error) {
    console.error(error)
  }
  }

  tally_user()
});

