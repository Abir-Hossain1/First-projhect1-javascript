const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const authenticationToken = require("../../middleware/auth");
const User = require("../../model/User");
const Task = require("../../model/Task");

// ?crate  a new task by user Id

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

// ? status change

router.put(
  "/status/:id",
  [
    authenticationToken,
    [body("status", "status is required").notEmpty(), body("status", "status is invalid ").isIn(["to-do", "in-progress", "done"])],
  ],

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors });
      }
      const id = req.params.id;
      const userId = req.user.id;

      const status = req.body.status;

      const task = await Task.findByIdAndUpdate({ _id: id, userId: userId }, { status: status }, { new: true });
      if (task) {
        res.json(task);
      } else {
        res.status(404).json({ massage: " task not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ massage: " something is wrong" });
    }
  }
);

// ? update User Done

router.put("/:id", authenticationToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const body = req.body;

    const task = await Task.findOneAndUpdate({ _id: id, userId: userId }, body, { new: true });
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

// ? user can see of his created task/get one user by id
router.get("/:id", authenticationToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const task = await Task.findOne({ _id: id, userId: userId });
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ massage: " Task not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ massage: " something is wrong" });
  }
});

// ? user can  delete one of his created task
router.delete("/:id",authenticationToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId=req.user.id;
    const task = await Task.findByIdAndDelete({_id:id,userId:userId});
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ massage: " Task not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ massage: " something is wrong" });
  }
});



module.exports = router;

