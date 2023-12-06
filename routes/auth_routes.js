//import express, express router as shown in lecture code
import { Router } from 'express';
const router = Router();
import { registerUser, calcBMR_LBS, goalCalories, updateUser } from "../data/users.js";
import * as path from 'path';


router.route('/')
  .get(async (req, res) => {
    // res.sendFile(path.resolve('front/index.html'));
    // res.render('index');
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

    console.log(req)
    try {
      const BMR = await calcBMR_LBS(age, weight, height, sex);
      const activityFactor = (resting * 1 + veryLightActivity * 1.2 + lightActivity * 2.5 + moderateActivity * 5 + heavyActivity * 7) / 24
      const caloricNeeds = await goalCalories(weightGoal, goalLBS, BMR, activityFactor);
      // console.log(activityFactor);
      res.render('index', { activityLevel: `${activityFactor.toFixed(2)}`, bmr: `${BMR.toFixed(0)} Calories`, goalCalories: `${caloricNeeds} Calories` });
    } catch (e) {
      res.render('error', { error: e });
    }
    // res.json({goalCalories: caloricNeeds})
    // res.render('index', {activityLevel: activityFactor, bmr: BMR, goalCalories: caloricNeeds});
    // res.redirect('/index')
  });

router.route('/faq').get(async (req, res) => {
  // res.sendFile(path.resolve('front/FAQ.html'));
  res.render('faq', { title: 'FAQ page' })
});

router.route('/indexStatic')
  .get(async (req, res) => {
    return res.sendFile(path.resolve('front/index.html'));
  }).post(async (req, res) => {
    console.log(req.body)
    return res.sendFile(path.resolve('front/index.html'));
  });

router
  .route('/register')
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
    res.render('profile', {user:req.session.user});
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
