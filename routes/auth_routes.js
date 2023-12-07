//import express, express router as shown in lecture code
import { Router } from 'express';
const router = Router();
import { registerUser, loginUser, calcBMR_LBS, goalCalories, updateUser, saveData, activityFactor } from "../data/users.js";
import * as path from 'path';


router.route('/')
  .get(async (req, res) => {
    res.redirect('/index')
  });

router.route('/index')
  .get(async (req, res) => {
    res.render('index', { title: 'Calorie Counting Website' });
    console.log(req.session)
    if (req.session.user) {
      console.log('hello')
    }
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
    let weightGoal = userData.weightGoal;
    const goalLBS = parseInt(userData.goalLBS);

    if (!age || !weight || !sex || !height || resting < 0 || veryLightActivity < 0 || lightActivity < 0 || moderateActivity < 0 || heavyActivity < 0) {
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
      const inputParams = {
        age: age,
        sex: sex,
        weight: weight,
        height: height,
        resting: resting,
        veryLightActivity: veryLightActivity,
        lightActivity: lightActivity,
        moderateActivity: moderateActivity,
        heavyActivity: heavyActivity
      }

      try {
        const BMR = await calcBMR_LBS(age, weight, height, sex);
        const activity_Factor = await activityFactor(resting, veryLightActivity, lightActivity, moderateActivity, heavyActivity)
        const caloricNeeds = await goalCalories(weightGoal, goalLBS, BMR, activity_Factor);

        if (weightGoal === 'weightLoss') { weightGoal = 'Lose Weight'; }
        if (weightGoal === 'weightMaintain') { weightGoal = 'Maintain Weight'; }
        if (weightGoal === 'weightGain') { weightGoal = 'Gain Weight'; }

        if (req.session.user) {
          const saved = await saveData(req.session.user.username, inputParams, weightGoal, activity_Factor, BMR, caloricNeeds)
          const cookieData = {
            username: req.session.user.username,
            email: saved.email,
            inputParams: saved.inputParams,
            currentGoal: saved.currentGoal,
            activity_level: saved.activity_level,
            BMR: saved.BMR,
            caloric_needs: saved.caloric_needs
          }
          req.session.user = cookieData;
          res.redirect('/profile');
        } else {
          res.status(400).render('error', { error: 'No account registered' })
        }
      } catch (e) {
        res.render('error', { error: e });
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
    const inputs = req.body;
    try {
      if (!inputs.emailAddressInput || !inputs.passwordInput) {
        return res.status(400).render('login', { error: "Username or password is incorrect" });
      }
    } catch (e) {
      return res.status(400).render('login', { error: e });
    }

    try {
      let checkLog = await loginUser(inputs.emailAddressInput, inputs.passwordInput);
      req.session.user = checkLog;
      res.redirect('/profile');
    } catch (e) {
      return res.status(400).render('login', { error: e });
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
        return res.redirect('/login');
      }
      else {
        return res.status(500).send('error: Could not register user');
      }
    }
    catch (e) {
      return res.status(400).render('error', { error: `Internal Server Error: ${e}` });
    }

  });
router.route('/profile')
  .get(async (req, res) => {
    // res.sendFile(path.resolve('front/profile.html'));
    if (!req.session.user) {
      res.redirect('/register');
    }
    else {
      res.render('profile', { user: req.session.user });
    }
  });

router.route('/calculator.html').get(async (req, res) => {
  // res.sendFile(path.resolve('front/calculator.html'));
  res.render('index')
});
router.route('/logout').get(async (req, res) => {
  req.session.destroy();
  return res.redirect('/index');
});

export default router;
