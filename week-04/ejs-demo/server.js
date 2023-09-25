const path = require("path");
const express = require("express");
const expressLayouts = require('express-ejs-layouts');

const app = express();

// Set up EJS
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.use(expressLayouts);

// Set up "assets" folder so it is public.
app.use(express.static(path.join(__dirname, "/assets")));

// Setup a home page route.
app.get("/", (req, res) => {
    var employees = [
        {
            name: "John",
            age: 23,
            occupation: "Developer",
            company: "Scotiabank",
            visible: true
        },
        {
            name: "Frank",
            age: 40,
            occupation: "Project Manager",
            company: "RBC",
            visible: false
        },
        {
            name: "Jane",
            age: 33,
            occupation: "Manager",
            company: "RBC",
            visible: true
        }
    ];

    res.render("home", {
        employees,
        title: "Home Page"
    });
});

app.get("/about", (req, res) => {
    res.render("about", {
        title: "About Us"
    });
});

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

// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
app.listen(HTTP_PORT, onHttpStart);