const path = require("path");
const express = require("express");
const session = require("express-session");

const app = express();

// Set up EJS
// Notice this is slightly different than other code examples. We are not using a main
// layout file and do not need express-ejs-layouts.
app.set('view engine', 'ejs');

// Set up express-session
// Remember to use dotenv to secure the secret.
app.use(session({
    secret: "this_is_a_secret",
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    // res.locals.user is a global EJS variable.
    // This means that every single EJS file can access this variable.
    res.locals.user = req.session.user;
    next();
});

// Set up a faux song database.
const songs = [
    {
        id: 1,
        name: "Life Goes On",
        artist: "BTS",
        price: 0.99
    },
    {
        id: 2,
        name: "Mood",
        artist: "24kGoldn Featuring Ian Dior",
        price: 0.50
    },
    {
        id: 3,
        name: "Positions",
        artist: "Ariana Grande",
        price: 0.99
    }
];

// Find a song from the faux database.
const findSong = function (id) {
    return songs.find(song => {
        return song.id == id;
    });
};

// Define a function to prepare the view model.
const VIEW_NAME = "musicstore";

const prepareViewModel = function (req, message) {

    if (req.session && req.session.user) {
        // The user is signed in and has a session established.

        // Get the shopping cart from the session.
        let cart = req.session.cart || [];

        // Check if the cart has any songs.
        const hasSongs = cart.length > 0;

        // Used to store how much is owed.
        let cartTotal = 0;

        // If there are songs in the cart, then calculate the order total.
        if (hasSongs) {
            cart.forEach(cartSong => {
                cartTotal += cartSong.song.price * cartSong.qty;
            });
        }

        return {
            message,
            hasSongs,
            songs: cart,
            cartTotal
        };
    }
    else {
        // The user is not signed in (or there is no session established).

        return {
            message,
            hasSongs: false,
            songs: [],
            cartTotal: 0
        };
    }
}

// Default home page route.
app.get("/", (req, res) => {
    res.render(VIEW_NAME, prepareViewModel(req));
});

// Route to add a new song to the cart.
// The ID of the song will be specified as part of the URL.
app.get("/add-song/:id", (req, res) => {

    let message;
    const songId = parseInt(req.params.id);

    // Check if the user is signed in.
    if (req.session.user) {
        // The user is signed in.

        // A shopping cart object will look like this:
        //    id: The ID of the song (number)
        //    qty: The number of licenses to purchase (number)
        //    song: The details about the song (for displaying in the cart)

        let cart = req.session.cart = req.session.cart || [];
        let song = findSong(songId);

        if (song) {
            // Song found in the database.

            // Search the shopping cart to see if the song is already added.
            let found = false;

            cart.forEach(cartSong => {
                if (cartSong.id == songId) {
                    // Song is already in the shopping cart.
                    found = true;
                    cartSong.qty++;
                }
            });

            if (found) {
                // Song was found in the cart, +1 quantity.
                message = `The song "${song.name}" was added to the cart, incremented quantity by one.`;
            }
            else {
                // Song was not found in the shopping cart.

                // Create a new object and add it to the cart.
                cart.push({
                    id: songId,
                    qty: 1,
                    song
                });

                // Add logic to sort the cart (by artist name).
                cart.sort((a, b) => a.song.artist.localeCompare(b.song.artist));

                message = `The song "${song.name}" was added to the cart.`;
            }
        }
        else {
            // Song was not in the database.
            message = "The song was not found in the database.";
        }
    }
    else {
        // The user is not signed in.
        message = "You must be logged in.";
    }

    res.render(VIEW_NAME, prepareViewModel(req, message));
});

// Route to remove a song from the cart.
// The ID of the song will be specified as part of the URL.
app.get("/remove-song/:id", (req, res) => {

    let message;
    const songId = parseInt(req.params.id);

    // Check if the user is signed in.
    if (req.session.user) {
        // The user is signed in.

        let cart = req.session.cart || [];

        // Find the index of the song in the shopping cart.
        const index = cart.findIndex(cartSong => cartSong.id == songId);

        if (index >= 0) {
            // Song was found in the cart.
            message = `Removed "${cart[index].song.name}" from the cart.`;

            cart.splice(index, 1);
        }
        else {
            // Song was not found in the cart.
            message = "Song was not found in the cart.";
        }
    }
    else {
        // The user is not signed in.
        message = "You must be logged in.";
    }

    res.render(VIEW_NAME, prepareViewModel(req, message));
});

// Route to checkout the user.
app.get("/check-out", (req, res) => {

    let message;

    // Check if the user is signed in.
    if (req.session.user) {
        // The user is signed in.

        let cart = req.session.cart || [];

        if (cart.length > 0) {
            // There are items in the cart, perform the checkout.

            // TODO: Send an email with the cart information.

            // Clear out the shopping cart BUT do not destroy it.
            // If you destroy it, then the user is logged out.

            req.session.cart = [];

            message = "You have been checked out. You are still logged in, buy something else.";
        }
        else {
            // There are no items in the cart.
            message = "You cannot checkout, there are no items in the cart.";
        }
    }
    else {
        // The user is not signed in.
        message = "You must be logged in.";
    }

    res.render(VIEW_NAME, prepareViewModel(req, message));
});

// Route to login the user.
app.get("/login", (req, res) => {

    let message;

    // Check if the user is signed in.
    if (req.session.user) {
        // The user is already signed in.
        message = `${req.session.user.name} is already logged in.`;
    }
    else {
        // Create a new user object and start the session.
        // This is normally pulled from the database and not hard-coded.
        req.session.user = {
            name: "Nick",
            vip: true
        };

        // Update the "user" global variable before rendering the view.
        // We we used res.redirect, this logic is not needed.
        res.locals.user = req.session.user;

        message = `${req.session.user.name} is now logged in.`;
    }

    res.render(VIEW_NAME, prepareViewModel(req, message));
});

// Route to log out the user.
app.get("/logout", (req, res) => {
    let message;

    // Check if the user is signed in.
    if (req.session.user) {
        // The user is signed in.

        req.session.destroy();

        // Update the "user" global variable before rendering the view.
        // We we used res.redirect, this logic is not needed.
        res.locals.user = null;

        message = "You have been logged out.";
    }
    else {
        // The user is not signed in.
        message = "You must be logged in";
    }

    res.render(VIEW_NAME, prepareViewModel(req, message));
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