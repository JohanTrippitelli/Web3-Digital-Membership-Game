const app = require("./api/app");

const PORT = 2500;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
