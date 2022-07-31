const cookieParser = require("cookie-parser"); /* Cookie Parser */
const express = require("express"); /* Express API */
const app = express(); /* Express API Instance */

const { v4 } = require("uuid"); /* UUID Generation for User ID */

const enmap = require("enmap"); /* Used for Server Sided File Storing & DB handling */
const bcrypt = require("bcrypt"); /* Used for hashing raw strings */

const users = new enmap( { name: "Users" } ); /* Used for storing data for each User */

app.use(cookieParser()); /* Use Cookie Parser in Express App Instance */

const port = process.env.PORT || 80; /* Port defined for Server */
let server = app.listen(port, () => { /* Server Instance by App Instance */
    
    console.log(`Server running on port: ${server.address().port}`); /* Log to console Server is up and running! */

});

app.get("/", (req, res) => { /* Home Route */

    const cookies = req.cookies;
    var rtn = res;

    rtn.send("Hello, World!");

});

app.get("/register", async (req, res) => {

    const data = req.query; /* Store Request URL Params to Variable */
    
    const rtn = (response, obj = null) => { /* Method used for returning Response to Client after handling Request */
        
        return res.json({
            "success": obj !== null, /* Returns true if successful */
            "data": (obj !== null ? obj : response) /* If Object is null, return response string */
        });

    };

    const isValidEmail = (email) => { /* Used to validate email */

        return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

    };

    if(data["email"] === undefined || data["pass"] === undefined) /* Validate params were specified during request */
        return rtn("Invalid Parameters were specified!"); /* Return the error */
    
    
    /* Validate Email */
    
    {

        const str = String((data["email"]));
        
        if(str.length <= 0 || str.length > 80) {
            
            return rtn((str.length <= 0 ? "You did not specify an Email!" : "Specified Email exceeds 80 characters!"));
    
        };

        if(!isValidEmail(str))
            return rtn("Specified Email is not a valid Email!");

    };

    /* Validate Password */

    {

        const str = String((data["pass"]));
        
        if(str.length <= 0 || str.length > 20) {
            
            return rtn((str.length <= 0 ? "You did not specify a Password!" : "Specified Password exceeds 20 characters!"));
    
        };

    };

    var found = null; /* Store found account ( matched by email ) */
    users.forEach((userObj, uuid) => {

        if(userObj.email == String(data["email"]).toLowerCase()) { /* Email already in use */

            found = userObj;
            return;

        };

    });

    if(found != null) /* Provided paramaters is already in use */
        return rtn("Email is already in use!");
    
    const hash = await bcrypt.hash(String(data["pass"]), 10); /* Wait for password to hash */
    const uuid = v4(); /* Generate unique ID for each User */

    users.set(uuid, { /* Store in Enmap DB */

        uuid: uuid,
        hash: hash,
        
        email: String(data["email"]).toLowerCase(),

        username: `User: ${users.size}`,
        description: "I'm new here!",
        
        friends: []
        
    });

    return rtn("", users.get(uuid)); /* Get the RAW (unmodified) User Object from DB, do not send this to other Client Users */

});

app.get("/login", (req, res) => {

    //

});