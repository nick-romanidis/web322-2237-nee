const path = require("path");
const express = require("express");
const expressLayouts = require('express-ejs-layouts');
const sequelizeModule = require("sequelize");

const app = express();

// Set up EJS
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.use(expressLayouts);

// Set up body-parser.
app.use(express.urlencoded({ extended: true }));

// Define the connection to our Postgres instance.
const sequelize = new sequelizeModule("database", "user", "password", {
    host: "hostname/url",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    }
});

// Define a model for the "Names" table.
const nameModel = sequelize.define("Name", {
    fName: sequelizeModule.STRING,
    lName: sequelizeModule.STRING
});

// Home page route
app.get("/", (req, res) => {
    nameModel.findAll({
        order: ["fName"]
    }).then(data => {
        // Pull the data (exclusively)
        // This is to ensure that our "data" object contains the returned data (only) and nothing else.
        const names = data.map(value => value.dataValues);

        res.render("nameTable", {
            names: names
        });
   
    }).catch(() => {
        res.render("nameTable", {
            names: []
        });
        })
});

app.post("/addName", (req, res) => {
    
    // Gather the new name from the form post.
    const { fName, lName } = req.body;

    // Create a record using the "name" model.
    nameModel.create({
        fName,
        lName
    }).then(() => {
        console.log("Successfully create a new name record");
        res.redirect("/");
    }).catch(() => {
        console.log("Failed to create a new name record.");
        res.redirect("/");
    });
});

app.post("/updateName", (req, res) => {

    // Gather the new name from the form post.
    const { id, fName, lName } = req.body;

    if (fName.length === 0 && lName.length === 0) {
        // Delete the record from the database.
        nameModel.destroy({
            where: { id }
        }).then(() => {
            console.log("Successfully deleted name record");
            res.redirect("/");
        }).catch(() => {
            console.log("Failed to delete name record.");
            res.redirect("/");
        });
    }
    else {
        // Update the record in the database.
        nameModel.update({
            fName,
            lName
        }, {
            where: { id }
        }).then(() => {
            console.log("Successfully updated name record");
            res.redirect("/");
        }).catch(() => {
            console.log("Failed to update name record.");
            res.redirect("/");
        });
    }
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
sequelize.sync()
    .then(() => {
        app.listen(HTTP_PORT, onHttpStart);
    });