const mongoose = require("mongoose");

//  enum status:{
//   ToDo='to-do',
//   InProgress='in-progress',
//   Done="done"

//  }

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    status: {
      type: String,
      enum: ['to-do', 'in-progress','done'],
      default:'to-do'
    },
    decs: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User"
    },
  
  },
  {
    timestamps: true,
  }
);

module.exports = Task = mongoose.model("Task", TaskSchema);
