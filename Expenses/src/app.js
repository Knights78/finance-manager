const express = require('express');
const session = require('express-session');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const { connectMongoDB } = require('./mongo');
// const User = require('./models/User');
const { User, Income, Expense,Goal } = require('./models/User');
var request = require('request')
var multer = require('multer');
var upload = multer();
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
app.use(bodyParser.json());
app.use(express.json())
app.set('view engine','hbs')//our view engine is hbs
app.set("views",templatepath)
app.use(express.urlencoded({extended:false}))
app.use(upload.array());




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


  const existingIncome = await Income.find({ user: user._id });//i will contain all things such as title amount date 
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
const Chart = require('chart');
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
    const expenseTitles = existingExpense.map(expense => expense.title);
     console.log(expenseTitles)
        // Count occurrences of each title
        const titleCounts = {};
        expenseTitles.forEach(title => {
            titleCounts[title] = (titleCounts[title] || 0) + 1;
        });

        // Prepare data for pie chart
        const labels = Object.keys(titleCounts);
        const data = Object.values(titleCounts);
        console.log(labels,data)
     
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
      expenseData: JSON.stringify(expenseData),
      pieChartLabels: JSON.stringify(labels),
      pieChartData: JSON.stringify(data)
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

hbs.registerHelper('json', function(context) {
  return JSON.stringify(context);
});
let mData = ""
let coinName = "bitcoin"
let mChart = ""

   
async function resData(coinName){
  var marketData = await new Promise((resolve,reject)=>{
      request('https://api.coingecko.com/api/v3/coins/' + coinName, function (error, response, body) {
          if (error) {
              console.error('Error:', error);
              reject(error);
          }
          //console.log('Market Data:', body);
          mData = JSON.parse(body);//whatever data is coming parse that it into jason format  
          resolve(mData);
      });
  });//the above code to fecth the market data 

  if(marketData){
      var marketChart = await new Promise((resolve,reject)=>{
          request('https://api.coingecko.com/api/v3/coins/' + coinName + '/market_chart?vs_currency=inr&days=30', function (error, response, body) {
              if (error) {
                  console.error('Error:', error);
                  reject(error);
              }
              //console.log('Market Chart Data:', body);
              mChart = JSON.parse(body);
              resolve(mChart);
          });
      });
  }//the above code to fetch the market chart 
}



app.get('/crypto', async(req, res) => {
    await resData(coinName)
    res.render('crypto', { mData,mChart,coinName })
})

app.post('/crypto', async (req, res) => {
    coinName = req.body.selectCoin;
    await resData(coinName)
    res.render('crypto', { mData,mChart,coinName })
})
//set goals section
app.get('/setgoals',async(req,res)=>{
  res.render('setgoals.hbs')
})
app.post('/setgoals',async(req,res)=>{
  const user=req.session.user
  let{goalName,goalAmount,startDate,endDate,description}=req.body
  try {
    const newGoal = new Goal({
      name: goalName,
      amount: goalAmount,
      description: description,
      startDate: startDate,
      endDate: endDate
  });
  const savedGoal = await newGoal.save();
  //res.status(201).json({ message: 'Goal added successfully', goal: savedGoal });
  res.render('setgoals.hbs')


  } catch (error) {
    console.log(error,"error saving the goal")
  }
})
app.get('/api/goals', async (req, res) => {
  try {
      // Retrieve all goals from the database
      const goals = await Goal.find();

      // Send the goals data as a response
      res.status(200).json(goals);
  } catch (error) {
      // Handle errors
      console.error('Error fetching goals:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/goals/:id', async (req, res) => {
  const goalId = req.params.id;
  //console.log(goalId)
  try {
      // Retrieve the goal from the database based on the ID
      const goal = await Goal.findById(goalId);

      if (!goal) {
          // If the goal is not found, return a 404 error
          return res.status(404).json({ error: 'Goal not found' });
      }

      // If the goal is found, return it as a JSON response
      res.status(200).json(goal);
  } catch (error) {
      // If an error occurs, return a 500 error
      console.error('Error fetching goal:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/goals/deposit', async (req, res) => {
  try {
    const { goalId, depositAmount } = req.body;
    //console.log(goalId)

    // Find the goal by ID
    const goal = await Goal.findById(goalId);
    //console.log(goal)

    if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
    }

    // Update the current amount of the goal by adding the deposit amount
    goal.currentAmount += parseFloat(depositAmount);
    
    // Save the updated goal to the database
    await goal.save();

    // Respond with a success message
    res.status(200).json({ message: 'Deposit saved successfully', goal: goal });
} catch (error) {
    console.error('Error saving deposit:', error);
    res.status(500).json({ error: 'Internal server error' });
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
