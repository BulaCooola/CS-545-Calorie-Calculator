//import express, express router as shown in lecture code
import { Router } from 'express';
const router = Router();
import { registerUser, calcBMR_LBS, goalCalories, updateUser, activityFactor } from "../data/users.js";
import * as path from 'path';


router.route('/')
  .get(async (req, res) => {
    res.redirect('/index')
  });

router.route('/index')
  .get(async (req, res) => {
    res.render('index', { title: 'Calorie Counting Website' });
  })
  .post(async (req, res) => {
    const userData = req.body;
    const age = parseInt(userData.age);
    const sex = userData.sex
    const weight = parseInt(userData.weight);
    const height = parseInt(userData.height);
    const resting = parseInt(userData.Resting);
    const veryLightActivity = parseInt(userData.VeryLightActivity);
    const lightActivity = parseInt(userData.LightActivity);
    const moderateActivity = parseInt(userData.ModerateActivity);
    const heavyActivity = parseInt(userData.HeavyActivity);
    const weightGoal = userData.weightGoal;
    const goalLBS = parseInt(userData.goalLBS);


    if (!age || !weight || !sex || !height || resting < 0 || veryLightActivity < 0 || lightActivity < 0 || moderateActivity < 0 || heavyActivity < 0 ) {
      return res.status(400).render('index', { error: 'All fields are required.' });
    }
    if (age < 0) {
      return res.status(400).render('index', { error: 'Age cannot be below 0' });
    }
    if (age > 150) {
      return res.status(400).render('index', { error: 'Age too high. Please provide valid age' });
    }
    if (weight < 50 || weight > 1000) {
      return res.status(400).render('index', { error: 'Please provide a valid weight' });
    }
    if (height < 0 || height > 107) {
      return res.status(400).render('index', { error: 'Height is below 0 or is too tall (unless you are taller than the tallest person in the world)' });

    }
    if (resting < 0 || veryLightActivity < 0 || lightActivity < 0 || moderateActivity < 0 || heavyActivity < 0) {
      return res.status(400).render('index', { error: 'Activity level inputs cannot be below 0' });
    }
    const activityHours = resting + veryLightActivity + lightActivity + moderateActivity + heavyActivity;
    if (activityHours !== 24) {
      return res.status(400).render('index', { error: `The total hours should be equal to 24. Your current hours inputted is ${activityHours}. Please adjust your input.` });

    }
    if (weightGoal < -4 || weightGoal > 4) {
      return res.status(400).render('index', { error: 'Weight Goal is too unrealistic.' });

    }

    console.log(req.session)
    // Form Buttons
    if (req.body.button === 'Calculate') {
      try {
        const BMR = await calcBMR_LBS(age, weight, height, sex);
        const activity_Factor = await activityFactor(resting, veryLightActivity, lightActivity, moderateActivity, heavyActivity)
        const caloricNeeds = await goalCalories(weightGoal, goalLBS, BMR, activity_Factor);
  
        res.render('index', { activityLevel: `${activity_Factor.toFixed(2)}`, bmr: `${BMR.toFixed(0)} Calories`, goalCalories: `${caloricNeeds} Calories` });
      } catch (e) {
        res.render('error', { error: e });
      }
    } 
    if (req.body.button === 'Save to Profile') {
      try {
        const BMR = await calcBMR_LBS(age, weight, height, sex);
        const activity_Factor = await activityFactor(resting, veryLightActivity, lightActivity, moderateActivity, heavyActivity)
        const caloricNeeds = await goalCalories(weightGoal, goalLBS, BMR, activity_Factor);
        
        if (req.session.user) {
          const saved = await saveData(req.session.user.username, weightGoal, activity_factor,x)
        } else {
          res.status(400).render('error', {error: 'No account registered'})
        }
      } catch(e) {

      }
    }
  });

router.route('/faq').get(async (req, res) => {
  // res.sendFile(path.resolve('front/FAQ.html'));
  res.render('faq', { title: 'FAQ page' })
});

router.route('/login')
  .get(async (req, res) => {
    res.render('login');
  })
  .post(async (req, res) => {
    const { emailAddress, password } = req.body;

    if (!emailAddress || !password) {
      return res.status(400).render('login', { error: 'All fields are required.' })
    }

    if (!(isEmail(emailAddress.toLowerCase()))) {
      return res.status(400).render('login', { error: 'Invalid Email Address or Password' })
    }

    if (typeof password !== 'string' || !(isStrongPassword(password))) {
      return res.status(400).render('login', { error: 'Invalid Email Address or Password' });
    }

    try {
      const user = await methods.loginUser(emailAddress.toLowerCase(), password);

      if (user) {
        req.session.user = {
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: user.emailAddress.toLowerCase(),
          role: user.role
        }
      }

      if (req.session.user.role === 'admin') {
        res.redirect('/admin');
      } else {
        res.redirect('/protected');
      }
    } catch (error) {
      // console.error(error);
      return res.status(400).render('login', { error: 'Invalid Email Address or Password' })
    }
  });

router.route('/register')
  .get(async (req, res) => {
    // return res.sendFile(path.resolve('front/register.html'));
    res.render('register');
  })
  .post(async (req, res) => {
    let registrationUser = req.body;
    try {
      let userCheck = await registerUser(registrationUser.username, registrationUser.email, registrationUser.password, registrationUser.confirm_password);
      if (userCheck.insertedUser) {
        return res.redirect('/profile');
      }
      else {
        return res.status(500).send('error: Could not register user');
      }
    }
    catch (e) {
      return res.status(400).send('oof');
    }

  });
router.route('/profile')
  .get(async (req, res) => {
    // res.sendFile(path.resolve('front/profile.html'));
    res.render('profile', { user: req.session.user });
  });

router.route('/calculator.html').get(async (req, res) => {
  // res.sendFile(path.resolve('front/calculator.html'));
  res.render('index')
});
router.route('/logout').get(async (req, res) => {
  req.session.destroy();
  return res.sendFile(path.resolve('front/logout.html'));
});

export default router;
