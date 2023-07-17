const express = require("express");
const ejs = require("ejs");
const app = express();
const port = 3000;
const mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');
require('dotenv').config()
var md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");

mongoose.connect(process.env.uri)

const userSchema = new mongoose.Schema(
  {
    email:String,
    password:String,
  })

  var secret = "someverylongnoteasytoguessstring"


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
    async function Hash_saveUser(){
    try {
      const hash = bcrypt.hash(req.body.password, saltRounds);

      const newUser = new user(
        {
          email:req.body.username,
          password:hash
        })

      newUser.save();

    } catch (error) {
      console.error(error)
    } }

    Hash_saveUser();
})

app.listen(port, () => console.log(`Server started at port: ${port}`)
);

app.post('/login', (req, res) => {

  async function tally_user()
  {
    const email = req.body.username
    const password = req.body.password
    
  try {
 
    const findUser = await user.findOne({email:email})

   if(findUser)
   {
    const compare_password = bcrypt.compare(password, findUser.password);

    if (compare_password) {
      res.render("secrets")
    } else {
      console.log("user not found")
    }
   }
   else
   {
    console.error("err")
   }

  } catch (error) {
    console.error(error)
  }
  }

  tally_user()
});

