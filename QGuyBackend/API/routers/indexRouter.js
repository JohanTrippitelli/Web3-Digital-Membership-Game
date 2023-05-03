const express = require("express");
const { Router } = express;
const router = new Router();

//REQUEST EXAMPLE NO ROUTE CHAIN
// router.get("/", (req,res) =>{
//     const user = req.query.user;
//     res.send(user + "!")
//   })

//NOTE MUST CHANGE TO ENSURE NO TWO USERNAMES ARE THE SAME

//NOTE MUST CHANGE TO ENCRYPT THE PASSWORD IN POST FUNCTION
const users = [];

//CHAIN ROUTING TO DO MULTIPLE COMMANDS FOR ONE /USER
router.route("/user").get((req, res) => {
    res.json(users);
}).post((req, res) => {
    const { user } = req.body;
    users.push({username: user.username, password: user.password});
  
    console.log(users);
  
    res.json({loggedIn: true, status: "Successful"});
}).delete((req, res) => {
    const {username, password} = req.body;
  
    //find the user associated to the provided username and password within our users list
    const existingUser = users.find(
      u => u.username === username && u.password === password
    )
    console.log(existingUser);
  
    //Error message if the user is not in the list as defined by the API call body Status Code 401 is format not found
    if(!existingUser){
      res.status(401).json({
        errorStatus: "Username and Password Non Existant"
      })
    }
  
    //If the user exists delete using splice() and update the list by subtracting size by 1
    users.splice(users.indexOf(existingUser), 1);
    res.json(users);
})
module.exports = router;