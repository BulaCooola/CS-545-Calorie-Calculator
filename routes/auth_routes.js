//import express, express router as shown in lecture code
import { Router } from 'express';
const router = Router();
import { registerUser } from "../data/users.js";


router.route('/').get(async (req, res) => {
  //code here for GET THIS ROUTE SHOULD NEVER FIRE BECAUSE OF MIDDLEWARE #1 IN SPECS.
  return res.json({ error: 'YOU SHOULD NOT BE HERE!' });
});

router
  .route('/register')
  .get(async (req, res) => {
    if (!req.session.login) {
      return res.render("register", { title: "Register" })
    }
    return res.redirect("/protected");
  })
  .post(async (req, res) => {
    let registrationUser = req.body;
    try {
      let userCheck = await registerUser(registrationUser.username, registrationUser.password, registrationUser.email, registrationUser.confirm-password);
      if (userCheck.insertedUser) {
        return res.redirect('/profile');
      }
      else {
        return res.status(500).render('error: Could not register user');
      }
    }
    catch (e) {
      if (e.code) {
        return res.status(e.code).render('register', { errors: true, error: e.error })
      }
      return res.status(400).render('error: bad');
    }
  });

export default router;
