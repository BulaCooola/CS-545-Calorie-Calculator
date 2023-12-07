// const username = document.getElementById('username')
// const email = document.getElementById('email')
// const password = document.getElementById('password')
// const confirmPassword = document.getElementById('confirm-password')
// const form = document.getElementById('form')
// const errorElement = document.getElementById('error')
// const EmailValidator = require('email-validator');
import * as EmailValidator from 'email-validator';


// form.addEventListener('submit', (e) => {
//     console.log("Form submitted"); 
//     let messages = []

 function includesUpper(str) {
    if (/[A-Z]+/g.test(str)) {
        return true;
    }
 }

 function checkString(str) {
    if (!str || typeof str !== `string` || str.trim().length === 0) {
      throw `Error: ${str} is not a valid string`;
    }
    return str.trim();
}
 function includesNum(str) {
    if (/\d+/g.test(str)) {
        return true;
    }
    return false;
}
 function includesSpecial(str) {
    if (/[^a-zA-Z0-9]/g.test(str)) {
        return true;
    }

    if (!/\d/.test(password.value)) {
        messages.push('Password must contain at least one number')
    }

    if (password.value !== confirmPassword.value) {
        messages.push('Passwords do not match');
    }

    if (messages.length > 0) {
        e.preventDefault()
        errorElement.innerText = messages.join(', ')
    }
}
// }})

export const checkEmail = (str) => {
     const email = checkString(str).toLowerCase();
     if (!EmailValidator.validate(email)) {
         throw `Error: ${email} is an invalid email`;
     }
     return email;
}

export const checkPassword = (str) =>{
    const password = checkString(str);

    if (password.length < 5 || password.length > 20) {
        throw 'Error: Password must be between 5 and 20 characters';
    }
    if (password.includes(' ') || !includesNum(password) || !includesUpper(password) || !includesSpecial(password)) {
        throw `Error: Password must contain at least one number, one uppercase character, and one special character`;
    }
    return password;
}

export const checkUsername = (str) => {
    let name = checkString(str);
    if (name.length < 3 || name.length > 15) {
        throw `Error: ${name} must be between 3 to 15 characters`;
    }
    for (let i = 0; i < name.length; i++) {
        if (!checkLetter(name[i])) {
            throw `Error: ${name} must only contain valid letters`;
        }
    }
    return name;
}

