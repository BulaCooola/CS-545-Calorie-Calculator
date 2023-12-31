import express from 'express';
const app = express();
import session from 'express-session';
import configRoutes from './routes/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import exphbs from 'express-handlebars';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const staticDir = express.static(__dirname + '/public');
app.use('/public', staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
// app.use(express.static('public'));

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(cookieParser());
app.use(
  session({
    name: 'AuthState',
    secret: "some secret string!",
    resave: false,
    saveUninitialized: false
  })
);

app.use('/', (req, res, next) => {
  //console.log(`${new Date().toUTCString()} ${req.method} ${req.originalUrl} ${(req.session.user) ? "Authenticated User" : "Non-Authenticated User"}`)
  //console.log(req.session)
  next();
});

app.use('/register', (req, res, next) => {
  if (req.session.user && req.session) {
    return res.redirect('/profile');
  }
  next();
});

app.use('/profile', (req, res, next) => {
  next();
});

app.use('/login', (req, res, next) => {
    if (req.session.user && req.session) {
        return res.redirect('/profile');
    }
    else{
        next();
    }
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
