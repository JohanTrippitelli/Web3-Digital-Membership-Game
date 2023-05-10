const express = require("express");
const app = express();
//import router
const indexRouter = require("./routers/indexRouter");

//DEFINE MIDDLEWARE (BETWEEN REQ AND RES)
//SPECIFICALLY THIS ONE ALLOWS FOR JSON DATA TO BE ACCEPTED
app.use(express.json());

//results in /api before the /command
app.use("/api", indexRouter);

//listen event for any requests on port 1500
app.listen(2500, () => {
  console.log("server started on port 2500 ");
});
