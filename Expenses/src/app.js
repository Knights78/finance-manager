const express = require('express');
const session = require('express-session');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const { connectMongoDB } = require('./mongo');
// const User = require('./models/User');
const { User, Income, Expense,Goal } = require('./models/User');

const path=require("path")
const templatepath=path.join(__dirname,'../templates')
const app = express();
const port = 3001;


// Connect to MongoDB
connectMongoDB();

// Set up session
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// Set up view engine and static files

app.use(express.static('public'));
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json())
app.set('view engine','hbs')//our view engine is hbs
app.set("views",templatepath)
app.use(express.urlencoded({extended:false}))




// Homepage
app.get('/', (req, res) => {
  res.render('register.hbs');
});

// Registration Form
app.get('/register', (req, res) => {
  res.render('register.hbs');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = new User({ username, password });//new User: It creates a new instance of the User model, which represents a document in the MongoDB collection associated with this model.
    await user.save();
    res.redirect('/login');
  } catch (error) {
    res.render('register.hbs', { error: 'Error during registration' });
  }
});

// Login Form
app.get('/login', (req, res) => {
  res.render('login.hbs');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });// i have taken that name User when i was exporting 

    if (user) {
      req.session.user = user;
      res.redirect('/dashboard');
    } else {
      res.render('login.hbs', { error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.render('login.hbs', { error: 'Error during login' });
  }
});

// Dashboard (Protected Route)
app.get('/dashboard', (req, res) => {
  const user = req.session.user;

  // if (!user) {
  //   // User not logged in, redirect to login page
  //   res.redirect('/login');
  // } else {
  //   // Render dashboard with user-specific data
  //   res.render('dashboard.hbs', { user });
  // }
  res.render('dashboard.hbs',{user})
});




app.get('/income', async (req, res) => {
  // Assuming the user is already stored in the session
  let user = req.session.user;

  // Make sure income is always present and defaults to 0
  if (!user || user.income === undefined) {
    user = { income: 0, ...user };
  }


  const existingIncome = await Income.find({ user: user._id });
  //console.log(existingIncome)
  const totalIncome = existingIncome.reduce((sum, income) => sum + income.amount, 0);//this reduce is a method which is used in an iterable object here from the income sum is the variable initially it is zero and for new user the sum will be zero untile and unless it adds the income
  //console.log(totalIncome)
  // Render the template with existing income data
  res.render('income.hbs', { user,existingIncome,totalIncome });
});

app.post('/income', async (req, res) => {
  const user = req.session.user; // Assuming the user is already in the session

  // Extract data from the form submission
  let { title, date, amount } = req.body;
  //console.log(title,date,amount)
  

  try {
      // Save the income data to the database
      const newIncome = new Income({
          user: user._id, //  user has a unique identifier (_id)
          title,
          date,
          amount,
      });
      

      const savedIncome = await newIncome.save();

      //console.log('Income saved successfully:', savedIncome);
      const AllIncome=await Income.find({ user: user._id });
      const totalIncome = AllIncome.reduce((sum, income) => sum + income.amount, 0);//it is taking the income from 



      res.render('income.hbs',{AllIncome,totalIncome})
      
  } catch (error) {
      // Handle errors appropriately
      console.error(error);
      res.render('income.hbs', { user, error: 'Error saving income' });
  }
});

app.delete('/income/:id', async (req, res) => {
  const user = req.session.user;
  const incomeId = req.params.id;

  try {
      await Income.deleteOne({ _id: incomeId, user: user._id });
      const existingIncome = await Income.find({ user: user._id });
      const totalIncome = existingIncome.reduce((sum, income) => sum + income.amount, 0);

      // Send a JSON response with the updated totalIncome
      res.status(204).json({});
  } catch (error) {
      console.error('Error deleting income entry:', error);
      res.status(500).json({ error: 'Error deleting income entry' });
  }
});


//expesnes section
app.get('/expenses', async (req, res) => {
  // Assuming the user is already stored in the session
  let user = req.session.user;

  // Make sure income is always present and defaults to 0
  if (!user || user.expense === undefined) {
    user = { expense: 0, ...user };
  }


  const existingExpense = await Expense.find({ user: user._id });
  //console.log(existingIncome)
  const totalExpense = existingExpense.reduce((sum, expense) => sum + expense.amount, 0);//this reduce is a method which is used in an iterable object here from the income sum is the variable initially it is zero and for new user the sum will be zero untile and unless it adds the income
  //console.log(totalIncome)
  // Render the template with existing income data
  res.render('expenses.hbs', { user,existingExpense,totalExpense });
});

app.post('/expenses',async (req,res)=>{
  let user=req.session.user
  let{title,date,amount}=req.body
  const newExpense=new Expense({user: user._id,title,date,amount})
  try{
  const savedExpense=await newExpense.save()
  
  console.log('expesne saved successfully:', savedExpense);
  const AllExpense=await Expense.find({ user: user._id });
  const totalExpense = AllExpense.reduce((sum, expense) => sum + expense.amount, 0);
  res.render('expenses.hbs',{AllExpense,totalExpense})
  }
  catch(error){
    console.error(error);
      res.render('expenses.hbs', { user, error: 'Error saving income' });
  }
 
})

app.delete('/expense/:id',async(req,res)=>{
  const user = req.session.user;
  const expenseId = req.params.id;

  try {
      await Expense.deleteOne({ _id: expenseId, user: user._id });
      const existingExpense = await Expense.find({ user: user._id });
      const totalExpense = existingExpense.reduce((sum, expense) => sum + expense.amount, 0);

      // Send a JSON response with the updated totalIncome
      res.status(204).json({});
  } catch (error) {
      console.error('Error deleting expense entry:', error);
      res.status(500).json({ error: 'Error deleting expense entry' });
  }
})
//transactions section....///./...././
app.get('/transactions', async (req, res) => {
  try {
    let user = req.session.user;

    const existingIncome = await Income.find({ user: user._id });
    const totalIncome = existingIncome.reduce((sum, income) => sum + income.amount, 0);

    const existingExpense = await Expense.find({ user: user._id });
    const totalExpense = existingExpense.reduce((sum, expense) => sum + expense.amount, 0);
    const totalBalance = totalIncome - totalExpense;

    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 6);

    //console.log("User ID:", user._id);
    //console.log("Date Range:", sevenDaysAgo, "to", currentDate);

    const incomeRecords = await Income.find({ user: user._id, date: { $gte: sevenDaysAgo, $lte: currentDate } });
    const incomeData = incomeRecords.map(record => record.amount);

    const expenseRecords = await Expense.find({ user: user._id, date: { $gte: sevenDaysAgo, $lte: currentDate } });
    const expenseData = expenseRecords.map(record => record.amount);

    let mostRecentIncome = await Income.findOne({ user: user._id }).sort({ date: -1 }).select('title amount');
    let mostRecentExpense = await Expense.findOne({ user: user._id }).sort({ date: -1 }).select('title amount');

    let recentIncomeTitle = "N/A";
    let recentIncomeAmount = 0;
    let recentExpenseTitle = "N/A";
    let recentExpenseAmount = 0;

    if (mostRecentIncome) {
      recentIncomeTitle = mostRecentIncome.title;
      recentIncomeAmount = mostRecentIncome.amount;
    }

    if (mostRecentExpense) {
      recentExpenseTitle = mostRecentExpense.title;
      recentExpenseAmount = mostRecentExpense.amount;
    }

    res.render('transactions.hbs', {
      user,
      incomeData: JSON.stringify(incomeData),
      totalIncome,
      totalExpense,
      totalBalance,
      recentIncomeTitle,
      recentIncomeAmount,
      recentExpenseTitle,
      recentExpenseAmount,
      expenseData: JSON.stringify(expenseData)
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//calculator
app.get('/calculator',async (req,res)=>{
  res.render('calculator.hbs')
})
app.get('/emicalculator',async (req,res)=>{
  res.render('emicalculator.hbs')
})
//set goals section
app.get('/setgoals', (req, res) => {
  res.render('setgoals.hbs');
});

// Calculate Required Saving Amount
async function calculateRequiredSavingAmount(userId, goalId) {
  try {
    const goal = await Goal.findOne({ user: userId, _id: goalId });
    if (!goal) {
      throw new Error('Goal not found');
    }

    // Fetch income and expense records for the past 7 days
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 6);

    const recentIncome = await Income.find({ user: userId, date: { $gte: sevenDaysAgo, $lte: currentDate } });
    const recentExpense = await Expense.find({ user: userId, date: { $gte: sevenDaysAgo, $lte: currentDate } });

    // Calculate total income and total expense for the past 7 days
    const totalIncome = recentIncome.reduce((sum, income) => sum + income.amount, 0);
    const totalExpense = recentExpense.reduce((sum, expense) => sum + expense.amount, 0);
    console.log(totalIncome,totalExpense)

    // Calculate initial saved amount based on total income and total expense
    const initialSavedAmount = totalIncome - totalExpense;
    console.log(initialSavedAmount)
    // Calculate total amount needed to reach the goal
    const totalAmountNeeded = goal.targetAmount - goal.savedAmount;

    // Calculate time remaining until the target date
    const remainingTime = Math.ceil((goal.targetDate - currentDate) / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

    // Calculate the suggested saving amount per week or month
    const suggestedSavingAmountPerWeek = totalAmountNeeded / (remainingTime / 7);
    const suggestedSavingAmountPerMonth = totalAmountNeeded / (remainingTime / 30);

    return {
      totalAmountNeeded,
      suggestedSavingAmountPerWeek: isNaN(suggestedSavingAmountPerWeek) ? 0 : suggestedSavingAmountPerWeek,
      suggestedSavingAmountPerMonth: isNaN(suggestedSavingAmountPerMonth) ? 0 : suggestedSavingAmountPerMonth,
      initialSavedAmount
    };
  } catch (error) {
    console.error('Error calculating required saving amount:', error);
    throw error;
  }
}

// Provide Feedback
function provideFeedback(savedAmount, totalAmountNeeded, suggestedSavingAmountPerWeek, suggestedSavingAmountPerMonth) {
  if (savedAmount >= totalAmountNeeded) {
    return 'Congratulations! You have reached your goal.';
  } else if (savedAmount >= suggestedSavingAmountPerMonth) {
    return 'You are making good progress. Keep it up!';
  } else if (savedAmount >= suggestedSavingAmountPerWeek) {
    return 'You are on track, but consider saving more to reach your goal on time.';
  } else {
    return 'You are falling behind. Try to increase your savings to stay on track.';
  }
}

// Import the necessary functions for calculating required saving amount and providing feedback

app.post('/setgoals', async (req, res) => {
  const user = req.session.user; // Assuming the user is already in the session

  // Extract data from the form submission
  const { title, targetAmount, targetDate, description } = req.body;

  try {
    // Fetch the user's total income and total expenses from the database
    const userData = await User.findOne({ _id: user._id });
    const totalIncome = userData.totalIncome;
    const totalExpense = userData.totalExpense;

    // Calculate the initial saved amount based on the user's total income and total expenses
    const initialSavedAmount = totalIncome - totalExpense;
     console.log(initialSavedAmount)
    // Save the goal data to the database with the initial saved amount
    const newGoal = new Goal({
      user: user._id,
      title,
      targetAmount,
      targetDate,
      description,
      savedAmount: initialSavedAmount
    });

    const savedGoal = await newGoal.save();

    console.log('Goal saved successfully:', savedGoal);

    // Calculate required saving amount
    const { totalAmountNeeded, suggestedSavingAmountPerWeek, suggestedSavingAmountPerMonth } = await calculateRequiredSavingAmount(user._id, savedGoal._id);

    // Provide feedback based on user's initial saved amount and the calculated required saving amount
    const feedbackMessage = provideFeedback(initialSavedAmount, totalAmountNeeded, suggestedSavingAmountPerWeek, suggestedSavingAmountPerMonth);

    // Render the set goals page again with the calculated required saving amount and feedback
    res.render('setgoals.hbs', { 
      success: 'Goal saved successfully',
      requiredSavingAmount: totalAmountNeeded,
      suggestedSavingAmountPerWeek,
      suggestedSavingAmountPerMonth,
      availableBalance: initialSavedAmount, // Pass the initial saved amount as available balance
      feedback: feedbackMessage
    });
  } catch (error) {
    // Handle errors appropriately
    console.error(error);
    res.render('setgoals.hbs', { error: 'Error saving goal' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    // res.redirect('/login');
    res.render("login.hbs")
  });
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
