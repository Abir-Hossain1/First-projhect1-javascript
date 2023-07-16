const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../../model/User");
const authenticationToken = require("../../middleware/auth");

router.post(
  "/",
  [
    body("firstName", "FirstName is required").notEmpty(),
    body("lastName", "lastName is required").notEmpty(),
    body("email", "email is required").notEmpty().isEmail(),
    body("age", "Age is optional").optional().isNumeric(),
    body("password", "Please Enter a password 6 character and more").isLength({min:6})

],

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors });
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      const password = hash;
      const userObj = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        age: req.body.age,
        password: password,
      }; 
      const user = new User(userObj);
      await user.save();
      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ massage: "  users not found" });
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    const { email, password, type, refreshToken } = req.body;
    if (!type) {
      res.status(401).json({ massage: "  type not found" });
    } else {
      if (type == "email") {
        const user = await User.findOne({ email: email });
        if (!user) {
          res.json({ massage: "user not found" });
        } else {
          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            res.status(401).json({ massage: "wrong password" });
          } else {
            getUserTokens(user, res);
          }
        }
      } else {
        // ? Refresh tokens
        if (!refreshToken) {
          res.status(401).json({ massage: "  refresh is not found" });
        } else {
          jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, payload) => {
            if (err) {
              res.status(401).json({ massage: "  Unauthorize" });
            } else {
              const id = payload.id;
              const user = await User.findById(id);
              if (!user) {
                res.status(401).json({ massage: " Unauthorize" });
              } else {
                getUserTokens(user, res);
              }
            }
          });
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ massage: "   not found" });
  }
});

router.get("/profile", authenticationToken, async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ massage: " user not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ massage: " something is wrong" });
  }
});

// ? Read all user
router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ massage: "  users not found" });
  }
});

// ? Read find one  ID from postman
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ massage: " user not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ massage: " something is wrong" });
  }
});

// ? update User

router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const user = await User.findByIdAndUpdate(id, body, { new: true });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ massage: " user not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ massage: " something is wrong" });
  }
});

// ? delete user
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ massage: " user not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ massage: " something is wrong" });
  }
});

module.exports = router;

function getUserTokens(user, res) {
  const accessToken = jwt.sign({ email: user.email, id: user.id }, process.env.JWT_SECRET, { expiresIn: "20m" });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" }); 

  const userObj = user.toJSON();
  userObj["accessToken"] = accessToken;
  userObj["refreshToken"] = refreshToken;

  res.status(200).json(userObj);
}
