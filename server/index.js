const express = require("express");
const { connect } = require("./db");
const app = express();

require("./apollo")(app);

const start = async () => {
    await connect();
    await app.listen(3501, () => console.log("Listening 3501 port"));
}

start();