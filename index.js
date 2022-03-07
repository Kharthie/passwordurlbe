const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoClient = mongodb.MongoClient;
const URL = "mongodb+srv://user1:12345@cluster0.c6r2o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const secret = "ZQy788RYIh";

app.use(express.json());
app.use(cors({
    origin: "*",
}))


let authenticate = function (req, res, next) {
    if (req.headers.authorization) {
        try {
            let result = jwt.verify(req.headers.authorization, secret);
            next();
        } catch (error) {
            res.status(401).json({ message: "Token Invalid" })
        }
    } else {
        res.status(401).json({ message: "Not Authorized" })
    }
}



//user register
app.post("/register", async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("database1");
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;
        await db.collection("collection1").insertOne(req.body)
        connection.close();
        res.json({ message: "user created!!" })
    } catch (error) {
        console.log(error)
    }
})

//user login
app.post("/login", async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("database1");
        let user = await db.collection("collection1").findOne({ email: req.body.email }) 
        if (user) {
            let passwordResult = await bcrypt.compare(req.body.password, user.password)
            if (passwordResult) {
                let token = jwt.sign({ userid: user._id }, secret, { expiresIn: "1h" });
                res.json({ token })
            } else {
                res.status(401).json({ message: "Email Id or Password did not match" })
            }
        } else {
            res.status(401).json({ message: "Email Id or Password did not match" })
        }
    } catch (error) {
        console.log(error)
    }
})


//create urls
app.post("/createUrl", async (req, res) => {
  try {
       let connection = await mongoClient.connect(URL)
       let db = connection.db("database1")
       await db.collection("collection2").insertOne({
           url: req.body.url,
           shortUrl: generateUrl()
       })
       await connection.close();
       res.json({ message: "url added" })
   } catch (error) {
       console.log(error)
   }
})

//Generate Url
function generateUrl() {
  var randomUrl = [];
  var characters = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var charactersLength = characters.length;

  for (i = 0; i <= 5; i++) {
      randomUrl += characters.charAt(Math.floor(Math.random() * charactersLength))
  };
  return randomUrl
}



//get all urls
app.get("/getUrls", async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL)
        let db = connection.db("database1")
        let urls = await db.collection("collection2").find({}).toArray()
        await connection.close();
        res.json(urls)
    } catch (error) {
        console.log(error)
    }

})

//dashboard
app.get("/dashboard", authenticate, function (req, res) {
    res.json({ totalusers: 50 })
})




//delete
app.delete("/url/:id" ,async (req,res) =>{
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("database1");
        let objId = mongodb.ObjectId(req.params.id)
        await db.collection("collection2").deleteOne({ _id: objId })
        await connection.close();
        res.json({ message: "User Deleted" })
    } catch (error) {
        
    }
})



app.listen(process.env.PORT || 3000)