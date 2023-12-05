//import express, express router as shown in lecture code
import { Router } from 'express';
const router = Router();
import { getDataByName, registerUser } from "../data/users.js";
import * as path from 'path';


router.route('/').get(async (req, res) => {
  res.sendFile(path.resolve('front/index.html'));
});
router.route('/index.html').get(async (req, res) => {
  res.sendFile(path.resolve('front/index.html'));
});

router
  .route('/register.html')
  .get(async (req, res) => {
      return res.sendFile(path.resolve('front/register.html'));
  })
  .post(async (req, res) => {
    let registrationUser = req.body;
    try {

      let userCheck = await registerUser(registrationUser.username, registrationUser.email, registrationUser.password, registrationUser.confirm_password);
      if (userCheck.insertedUser) {
        return res.sendFile(path.resolve('front/profile.html'));
      }
      else {
        return res.status(500).send('error: Could not register user');
      }
    }
    catch (e) {
      return res.status(400).send('oof');
    }
    
  });
  router.route('/profile.html').get(async (req, res) => {
    let user = req.body;
    let getData = await getDataByName(user.username);
    res.sendFile(path.resolve('front/profile.html'));
  });
  router.route('/calculator.html').get(async (req, res) => {
    res.sendFile(path.resolve('front/calculator.html'));
  });
  router.route('/logout').get(async (req, res) => {
    req.session.destroy();
    return res.sendFile(path.resolve('front/logout.html'));
  });

export default router;
