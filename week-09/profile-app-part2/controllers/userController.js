const express = require("express");
const userModel = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const path = require("path");

const router = express.Router();

// Route to the registration page (GET /user/register)
router.get("/register", (req, res) => {
    res.render("user/register");
});

// Route to the registration page (POST)
router.post("/register", (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Validate the information entered is correct.

    const newUser = new userModel({
        firstName,
        lastName,
        email,
        password
    });

    // TODO: On the assignment, first check if the email already exists for a document.
    // WARNING: Do not throw/show any error if a duplicate email is attempted to be added.
    //          Rather, show a friendly error message in the registration form.

    newUser.save()
        .then(userSaved => {
            console.log(`User ${userSaved.firstName} has been added to the database.`);

            // Create a unique name for the picture, so that it can be stored in the file system.
            const profilePicFile = req.files.profilePic;
            let uniqueName = `profile-pic-${userSaved._id}${path.parse(profilePicFile.name).ext}`;

            // Copy the image data to a file on our system.
            profilePicFile.mv(`assets/profile-pics/${uniqueName}`)
                .then(() => {
                    // Update the document so that the profile pic is populated.
                    userModel.updateOne({
                        _id: userSaved._id
                    }, {
                        profilePic: uniqueName
                    })
                        .then(() => {
                            // Successful
                            console.log("Updated the users profile pic");
                            res.redirect("/");
                        })
                        .catch(err => {
                            console.log(`Error updating users profile pic... ${err}`);
                            res.redirect("/");
                        });
                })
                .catch(err => {
                    console.log(`Error adding profile pic... ${err}`);
                    res.redirect("/");
                })
        })
        .catch(err => {
            console.log(`Error adding user to the database ... ${err}`);
            res.render("user/register");
        });
});

// Route to the login page (GET /user/login)
router.get("/login", (req, res) => {
    res.render("user/login");
});

// Route to the login page (POST)
router.post("/login", (req, res) => {

    const { email, password } = req.body;

    // TODO: Validate that both email and password are entered.

    let errors = [];

    userModel.findOne({
        email
    })
        .then(user => {
            // Completed the search (successfully).
            if (user) {
                // Found the user document
                // Compare the password submitted to the password in the document.
                bcryptjs.compare(password, user.password)
                    .then(isMatched => {
                        // Done comparing passwords.

                        if (isMatched) {
                            // Passwords matched.

                            // Create a new session and store the user object.
                            req.session.user = user;

                            // We want to use redirect, not render, or it won't work.
                            //     errors.push("Signed in " + user.firstName);

                            //     res.render("user/login", {
                            //         errors 
                            //    });

                            res.redirect("/");
                        }
                        else {
                            // Passwords are different.
                            errors.push("Password does not match the database.");
                            console.log(errors[0]);

                            res.render("user/login", {
                                errors
                            });
                        }
                    }).catch(err => {
                        errors.push("Password could not be validated ... " + err);
                        console.log(errors[0]);

                        res.render("user/login", {
                            errors
                        });
                    });
            }
            else {
                errors.push("Email was not found in the database");
                console.log(errors[0]);

                res.render("user/login", {
                    errors
                });
            }
        })
        .catch(err => {
            errors.push("Error finding the user in the databasee ... " + err);
            console.log(errors[0]);

            res.render("user/login", {
                errors
            });
        });
});

router.get("/logout", (req, res) => {
    // Clear the session from memory.
    req.session.destroy();

    // Do NOT do this
    //req.session.user = null;

    res.redirect("/user/login");
});

module.exports = router;