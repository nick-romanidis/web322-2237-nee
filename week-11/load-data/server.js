const path = require("path");
const express = require("express");
const mongoose = require("mongoose");

// Set up express.
const app = express();

// Fake database.
const namesToAdd = [
    { nickname: "Nick", fName: "Nicholas", lName: "Romanidis", age: 41 },
    { nickname: "Jane", fName: "Jane", lName: "Doe", age: 30 },
    { nickname: "John", fName: "Johnny", lName: "Smith", age: 35 }
];

// Define a schema and model.
const nameSchema = new mongoose.Schema({
    nickname: {
        type: String,
        unique: true
    },
    fName: String,
    lName: String,
    age: {
        type: Number,
        default: 25
    }
});

const nameModel = mongoose.model("names", nameSchema);


// Add your routes here
app.get("/", (req, res) => {
    res.send("Ready to go ...");
});

app.get("/load-data/names", (req, res) => {

    // Protect this route, so only "Data Clerks" are able to access it.

    // if (req.session && req.session.user && req.session.isClerk) {
    //     // Clerk is signed in.

    //     // We can load the data here.
    // }
    // else {
    //     // Someone else is signed in (or no one is signed in).
    //     res.status(401).send("You are not authorized.");
    // }

    nameModel.countDocuments()
        .then(count => {
            if (count === 0) {
                // There are no documents, proceed with the data load.

                nameModel.insertMany(namesToAdd)
                    .then(() => {
                        res.send("Success, data was loaded!");
                    })
                    .catch(err => {
                        res.send("Couldn't insert the documents: " + err);
                    });
            }
            else {
                // There are already documents, don't duplicate them, abort.
                res.send("There are already documents loaded.");
            }
        })
        .catch(err => {
            res.send("Couldn't count the documents: " + err);
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
// Connect to the MongoDB
mongoose.connect("mongodb+srv://dbUser:Password123@web322-cluster.etw0klh.mongodb.net/web322db?retryWrites=true&w=majority").then(() => {
    app.listen(HTTP_PORT, onHttpStart);
});
