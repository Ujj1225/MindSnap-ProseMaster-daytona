const express = require("express");
const app = express();
const cors = require("cors");
const query = require("./routes/query");

require("dotenv").config();

// CORS
const corsOptions = {
  origin: "http://localhost:3000", 
  methods: ["GET", "POST", "PUT", "DELETE"], 
  allowedHeaders: ["Content-Type", "Authorization"], 
};

app.use(cors(corsOptions)); 
app.use(express.json());

const port = process.env.PORT || 5000;

app.use("/api/v1", query);

const start = () => {
  app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
  });
};

start();
