const express = require( "express" );
const app = express();

//DEFINE MIDDLEWARE (BETWEEN REQ AND RES)
//SPECIFICALLY THIS ONE ALLOWS FOR JSON DATA TO BE ACCEPTED 
app.use(express.json());

//REQUEST
app.get("/", (req,res) =>{
  const user = req.query.user;
  res.send(user + "!")
})

app.get("/users", (req, res) =>{
  res.json(users);
})

//POST NOTE MUST CHANGE THIS TO ENCRYPT THE PASSWORD
const users = [];
app.post("/create_user", (req, res) => {
  const { user } = req.body;
  users.push({username: user.username, password: user.password});

  console.log(users);

  res.json({loggedIn: true, status: "Successful"});
});

//listen event for any requests on port 1500
app.listen(2500, () => {
  console.log("server started on port 2500 ");
});
