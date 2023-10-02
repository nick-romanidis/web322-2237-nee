const express = require("express");
const router = express.Router();

const employeeList = require("../models/employeeList");

// Setup a home page route.
router.get("/", (req, res) => {
    const allEmployees = employeeList.getAllEmployees();

    res.render("general/home", {
        employees: allEmployees,
        title: "Home Page"
    });
});

// Setup our about page.
router.get("/about", (req, res) => {
    res.render("general/about", {
        title: "About Us"
    });
});

module.exports = router;