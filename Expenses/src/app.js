const express = require('express');
const session = require('express-session');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const { connectMongoDB } = require('./mongo');
// const User = require('./models/User');
const { User, Income, Expense } = require('./models/User');

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
app.get('/transactions',async (req,res)=>{
 
  try{  
    let user=req.session.user;  
  const existingIncome = await Income.find({ user: user._id });//all the dat for that particular id is there in exixiting income 
  
  const totalIncome = existingIncome.reduce((sum, income) => sum + income.amount, 0);//total income is actually the sum of all amounts in that particular id 
  
  
  const existingExpense = await Expense.find({ user: user._id });
  //console.log(existingIncome)
  const totalExpense = existingExpense.reduce((sum, expense) => sum + expense.amount, 0);//expense: The current element in the array being processed.
  const totalBalance=totalIncome-totalExpense

  const currentDate = new Date();//this will give us the current date 
  const sevenDaysAgo = new Date(currentDate);//this is taking the current date means initially sevendaysago and currentdate is same 
  sevenDaysAgo.setDate(currentDate.getDate() - 6);//in this setdate method is used to setdate of sevendays ago currentdate.getdate will give us the date which is present in currentdate variable
  console.log("User ID:", user._id);
console.log("Date Range:", sevenDaysAgo, "to", currentDate);
  const incomeRecords=await Income.find({user:user._id,date:{$gte:sevenDaysAgo,$lte:currentDate}});//in this we will get all the income which is satisfying the condition of date greater than sevendys and less than the current date
  const incomeData=incomeRecords.map(record=>record.amount)//we are applying map for each record in that income collection and we are taking the amount menas at each index we are getting the income as an array 

  //similarly for expenses as well 
  const expenseRecords=await Expense.find({user:user._id,date:{$gte:sevenDaysAgo,$lte:currentDate}});//in this we will get all the income which is satisfying the condition of date greater than sevendys and less than the current date
  //console.log(expenseRecords)
  const expenseData=expenseRecords.map(record=>record.amount)
  //console.log(expenseData)
  //console.log(incomeData)
  

  res.render('transactions.hbs', {
    user,
    incomeData:JSON.stringify(incomeData),
    totalIncome,
    totalExpense,
    totalBalance,
    expenseData:JSON.stringify(expenseData)
  });

  }
  catch(error){
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
  

  

})
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    // res.redirect('/login');
    res.render("login.hbs")
  });
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
