const username = document.getElementById('username')
const email = document.getElementById('email')
const password = document.getElementById('password')
const confirmPassword = document.getElementById('confirm-password')
const form = document.getElementById('form')
const errorElement = document.getElementById('error')
// const EmailValidator = require('email-validator');

form.addEventListener('submit', (e) => {
    console.log("Form submitted"); 
    let messages = []

    if (!/^[a-zA-Z0-9]+$/.test(username.value)) {
        messages.push('Username must be alphanumeric')
    }
    
    if (username.value.length < 3 || username.value.length > 15) {
        messages.push('Username must be between 3 and 15 characters')
    }

    // const usernameExists = await checkUsernameExists(username.value);
    // if (usernameExists) {
    //     messages.push('Username already exists');
    // }

    if (password.value.length < 5 || password.value.length > 20) {
        messages.push('Password must be between 5 and 20 characters')
    }

    if (!/[a-zA-Z]/.test(password.value)) {
        messages.push('Password must contain at least one letter')
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
})

// function checkEmail(str) {
//     const email = checkString(str).toLowerCase();
//     if (!EmailValidator.validate(email)) {
//         throw `Error: ${email} is an invalid email`;
//     }
//     return email;
// }
