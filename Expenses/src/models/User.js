const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username:{
    type:String,
    required:true
     },
    password:{
          type:String,
          required:true
      }

  // Add more fields as needed (e.g., name, expenses, income)
});

const User = mongoose.model('users', userSchema);
const IncomeSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
  // Other transaction-specific fields
});


const ExpenseSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
  // Other transaction-specific fields
});

const GoalSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  targetAmount: {
    type: Number,
    required: true,
  },
  targetDate: {
    type: Date,
    required: true,
  },
  description: String
  // Other goal-specific fields
});
const Income = mongoose.model('incomes', IncomeSchema);
const Expense = mongoose.model('expenses', ExpenseSchema);


const Goal = mongoose.model('goals', GoalSchema); // New model for goals

module.exports = { User, Income, Expense, Goal };


