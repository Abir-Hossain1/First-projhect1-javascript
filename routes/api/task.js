const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const authenticationToken = require("../../middleware/auth");
const User = require("../../model/User");
const Task = require("../../model/Task");

// ?Register a new user

router.post(
  "/",
  [authenticationToken, [body("title", "Title is required").notEmpty()]],

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors });
      }

      const id = req.user.id;
      const taskObj = {
        title: req.body.title,
        decs: req.body.decs ?? "",
        userId: id,
        // status: "to-do",
      };
      const task = new Task(taskObj);
      await task.save();
      res.status(201).json(task);
    } catch (error) {
      console.error(error);
      res.status(500).json({ massage: "  Task is not found" });
    }
  }
);

// ? get all task user by user
router.get("/", authenticationToken, async (req, res) => {
  try {  
    const id = req.user.id;
    const task = await Task.find({ userId: id });
    res.json(task);
  } catch (error) {
    console.error(error);   
    res.status(500).json({ massage: "  users not found" }); 
  }
});


// // ? status change

// router.put("/status/:id", async (req, res) => {   
//     try {
//       const id = req.params.id;  
//       const userId = req.user.id;
  
//      const status= req.body.status;
  
//       const task = await Task.findByIdAndUpdate({_id: id, userId: userId}, {status:status}, { new: true });    
//       if (task) {
//         res.json(task);  
//       } else {
//         res.status(404).json({ massage: " task not found" });
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ massage: " something is wrong" });
//     }
//   });

// ? update User

router.put("/:id",authenticationToken, async (req, res) => {   
  try {
    const id = req.params.id;  
    const userId = req.user.id;

   const body= req.body;

    const task = await Task.findOneAndUpdate({_id: id, userId: userId}, body, { new: true });     
    if (task) {
      res.json(task);  
    } else {
      res.status(404).json({ massage: " task not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ massage: " something is wrong" });
  }
});


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
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "2d" });

  const userObj = user.toJSON();
  userObj["accessToken"] = accessToken;
  userObj["refreshToken"] = refreshToken;

  res.status(200).json(userObj);
}
