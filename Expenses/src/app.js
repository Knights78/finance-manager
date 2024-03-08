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


app.get('/transactions', (req, res) => {
  const user = req.session.user;
  res.render('transactions.hbs',{user});

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
  if (!user || user.income === undefined) {
    user = { expense: 0, ...user };
  }


  const existingExpense = await Expense.find({ user: user._id });
  //console.log(existingIncome)
  const totalExpense = existingExpense.reduce((sum, income) => sum + income.amount, 0);//this reduce is a method which is used in an iterable object here from the income sum is the variable initially it is zero and for new user the sum will be zero untile and unless it adds the income
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
  const AllExpense=await Expense.find({ user: user._id });
  const totalExpense = AllExpense.reduce((sum, income) => sum + income.amount, 0);
  }
  catch(error){
    console.error(error);
      res.render('expenses.hbs', { user, error: 'Error saving income' });
  }
})

app.delete('/expense/:id',async(req,res)=>{
  
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
