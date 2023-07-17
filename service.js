require("dotenv").config();
// const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const bodyParser = require("body-parser");
const connectDB = require("./config/Db");
const User=require("./model/User")
app.use(bodyParser.json());

const authenticationToken=require('./middleware/auth')




// // ?connection mongodb
// const uri = process.env.MONGODB_URI;
// mongoose.connect(uri, { useNewUrlParser: true });

// mongoose.connection.on("connected", function () {
//   console.log("mongoose connection open");
// });

// // ? if connection error
// mongoose.connection.on("error", function (err) {
//   console.log("mongoose connection error");
// });

connectDB()
// ? use schema

// const userSchema = new mongoose.Schema(
//   {
//     firstName: String,
//     lastName: String,
//     email: String,
//     age: Number,
//     password: String,
//   },
//   {
//     timestamps: true,
//   }
// );

// // ? use model
// const User = mongoose.model("User", userSchema);

// ?Routes
app.use('/api/users', require('./routes/api/user')) 
app.use('/api/task', require('./routes/api/task'))  

// ? check postman connection

app.get("/", (req, res) => {
  res.json({ massage: "this is a new app" });
});

// ?Register a new user

// app.post("/users", async (req, res) => {
//   try {
//     const salt = await bcrypt.genSalt(10);
//     const hash = await bcrypt.hash(req.body.password, salt);
//     const password = hash;
//     const userObj = {
//       firstName: req.body.firstName,
//       lastName: req.body.lastName,
//       email: req.body.email,
//       age: req.body.age,
//       password: password,
//     };
//     const user = new User(userObj);
//     await user.save();
//     res.status(201).json(user);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ massage: "  users not found" });
//   } 
// });

// ? login user
// app.post("/users/login", async (req, res) => {
//   try {
//     const { email, password, type, refreshToken } = req.body;
//     if (!type) {
//       res.status(401).json({ massage: "  type not found" });
//     } else {
//       if (type == "email") {
//         const user = await User.findOne({ email: email });
//         if (!user) {
//           res.json({ massage: "user not found" });
//         } else {
//           const isValidPassword = await bcrypt.compare(password, user.password);
//           if (!isValidPassword) {
//             res.status(401).json({ massage: "wrong password" });
//           } else {
//             getUserTokens(user, res);
//           }
//         }
//       } else {  // ? Refresh tokens
//         if (!refreshToken) {
//           res.status(401).json({ massage: "  refresh is not found" });
//         } else {
//           jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, payload) => {
//             if (err) { 
//               res.status(401).json({ massage: "  Unauthorize" });
//             } else {
//               const id = payload.id;
//               const user = await User.findById(id);
//               if (!user) {
//                 res.status(401).json({ massage: " Unauthorize" });
//               } else {
//                 getUserTokens(user, res);
//               }
//             }
//           });
//         }
//       }
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ massage: "   not found" });
//   }
// });

// ? middleware to authentication to access to token

// const authenticationToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   const token = authHeader && authHeader.split(" ")[1];
//   if (!token) {
//     res.status(401).json({ massage: "  Unauthorize" });
//   } else {
//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//       if (err) {
//         res.status(401).json({ massage: "  Unauthorize" });
//       } else {
//         req.user = user;
//         next();
//       }
//     });
//   }
// };

// ? get a user profile

// app.get("/profile", authenticationToken, async (req, res) => {
//   try {
//     const id = req.user.id;
//     const user = await User.findById(id);
//     if (user) {
//       res.json(user);
//     } else {
//       res.status(404).json({ massage: " user not found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ massage: " something is wrong" });
//   }
// });
// // ? Read all user
// app.get("/users", async (req, res) => {
//   try {
//     const users = await User.find({});
//     res.json(users);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ massage: "  users not found" });
//   }
// });

// // ? Read find one  ID from postman
// app.get("/users/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     const user = await User.findById(id);
//     if (user) {
//       res.json(user);
//     } else {
//       res.status(404).json({ massage: " user not found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ massage: " something is wrong" });
//   }
// });

// // ? update User

// app.put("/users/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     const body = req.body;
//     const user = await User.findByIdAndUpdate(id, body, { new: true });
//     if (user) {
//       res.json(user);
//     } else {
//       res.status(404).json({ massage: " user not found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ massage: " something is wrong" });
//   }
// });

// // ? delete user
// app.delete("/users/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     const user = await User.findByIdAndDelete(id);
//     if (user) {
//       res.json(user);
//     } else {
//       res.status(404).json({ massage: " user not found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ massage: " something is wrong" });
//   }
// });

const port = process.env.port;
app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
// function getUserTokens(user, res) {
//   const accessToken = jwt.sign({ email: user.email, id: user.id }, process.env.JWT_SECRET, { expiresIn: "2m" });
//   const refreshToken = jwt.sign({id: user.id }, process.env.JWT_SECRET, { expiresIn: "10m" });

//   const userObj = user.toJSON();
//   userObj["accessToken"] = accessToken;
//   userObj["refreshToken"] = refreshToken;

//   res.status(200).json(userObj);
// }
