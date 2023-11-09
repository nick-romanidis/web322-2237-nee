const path = require("path");
const express = require("express");
const expressLayouts = require('express-ejs-layouts');
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Set up dotenv to protect environment variables
dotenv.config({ path: "./config/keys.env" });

// Set up express.
const app = express();

// Set up EJS
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.use(expressLayouts);

// Set up body parser.
app.use(express.urlencoded({ extended: true }));

// Set up controllers
const generalController = require("./controllers/generalController");
const userController = require("./controllers/userController");

app.use("/", generalController);
app.use("/user/", userController);


// *** DO NOT MODIFY THE LINES BELOW ***

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("Something broke!")
});

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// Connect to the MongoDB
mongoose.connect(process.env.MONGODB_CONN_STRING).then(() => {
    console.log("Connected to the MongoDB database.");

    // Listen for web requests.
    app.listen(HTTP_PORT, onHttpStart);
});