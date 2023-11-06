const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    profilePic: String,
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});

userSchema.pre("save", function(next) {

    let user = this;

    // Generate a unique SALT.
    bcryptjs.genSalt()
        .then(salt => {
            // Has the password using the generated SALT.
            bcryptjs.hash(user.password, salt)
                .then(hashedPwd => {
                    // The password was hashed successfully.
                    user.password = hashedPwd;
                    next();
                })
                .catch(err => {
                    console.log(`Error occurred when hashing ... ${err}`);
                });
        })
        .catch (err => {
            console.log(`Error occurred when salting ... ${err}`);
        });

});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;