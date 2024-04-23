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

const goalSchema = new Schema({
  name: {
      type: String,
      required: true
  },
  amount: {
      type: Number,
      required: true
  },
  description: {
      type: String
  },
  startDate: {
      type: Date,
      required: true
  },
  endDate: {
      type: Date,
      required: true
  },
  currentAmount: {
      type: Number,
      default: 0
  },
  deposits: [{
      amount: {
          type: Number,
          required: true
      },
      date: {
          type: Date,
          default: Date.now
      }
  }]
});

//module.exports = mongoose.model('Goal', goalSchema);
const Income = mongoose.model('incomes', IncomeSchema);
const Expense = mongoose.model('expenses', ExpenseSchema);


const Goal = mongoose.model('goals', goalSchema); // New model for goals

module.exports = { User, Income, Expense, Goal };


