const express = require("express");
const router = express.Router();

const employeeList = require("../models/employeeList");

router.get("/", (req, res) => {
    const allEmployees = employeeList.getAllEmployees();

    res.render("employees/list", {
        employees: allEmployees,
        title: "Employee List"
    });
});

router.get("/visible", (req, res) => {
    const allEmployees = employeeList.getVisibleEmployees();

    res.render("employees/list", {
        employees: allEmployees,
        title: "Employee List"
    });
});

module.exports = router;