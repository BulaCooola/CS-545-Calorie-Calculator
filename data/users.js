import { get } from 'http';
import {users} from '../config/mongoCollections.js';
import {checkUsername, checkEmail, checkPassword} from '../helper.js'
import bcrypt from 'bcrypt';

export const registerUser = async (
    username,
    email,
    password,
    confirmPassword
)=>{
    username = checkUsername(username);
    email = checkEmail(email);
    password = checkPassword(password);
    confirmPassword = checkPassword(confirmPassword);
    
    username = username.trim();
    email = email.trim();
    password = password.trim();
    confirmPassword = confirmPassword.trim();
    if(password !== confirmPassword){
        throw 'passwords must be the same';
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCollection = await users();
    let newUser = { 
        username:username,
        email:email,
        password: hashedPassword,
        currentGoal: '',
        activity_level: 1,
        BMR: 0,
        caloric_needs: 0,
    }
    let insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw 'Could not add user';
    }
    return {insertedUser:true};

}
export const loginUser = async (email, password) => {
    email = checkEmail(email);
    password = checkPassword(password);
    const userCollection = await users();
    const findEmail = await userCollection.findOne({email: email});
    if(!findEmail){
        throw 'Either the email address or password is invalid';
    }

    let compareEmail = false;
    compareEmail = await bcrypt.compare(password, findEmail.password);
    if(!compareEmail){
        throw 'Either the email address or password is invalid';
    }
    return{
        username:findEmail.username,
        email:findEmail.email,
        currentGoal:findEmail.currentGoal,
        BMR:findEmail.BMR,
        activity_level:findEmail.activity_level,
        caloric_needs:findEmail.caloric_needs
    };
}

export const updateUser = async (username,email,password)=>{
    username = checkUsername(username);
    email = checkEmail(email);
    password = checkPassword(password);
    username = username.trim();
    email = email.trim();
    password = password.trim();
    const hashedPassword = await bcrypt.hash(password, 10);
    let updatedUser = {
        email:email,
        password:hashedPassword
    };
    const userCollection = await users();
    const newUser = await userCollection.findOneAndReplace(
            username,
            updatedUser,
            {returnDocument:'after'}
    );
    if(!newUser){
        throw 'could not update user successfully';
    }
    return newUser;

}

export const saveData = async (
    username,
    currentGoal,
    activity_level,
    BMR,
    caloric_needs) => {
    const userCollection = await users();
    const updatedUser = await userCollection.findOneAndUpdate(
        {username: username},
        {$set: {
            currentGoal: currentGoal,
            activity_level:activity_level,
            BMR:BMR,
            caloric_needs:caloric_needs
        }},
        {returnDocument:'after'}
    )

    return updatedUser;
}


export const calcBMR_LBS = async (age, weight, height, sex) => {
    const weightToKilo = weight / 2.2;
    const heightToCentimeter = height * 2.54

    let base = 10 * weightToKilo + 6.25 * heightToCentimeter - 5 * age;
    if (sex == 'male') {
        base += 5;
    } else if (sex == 'female') {
        base -= 161;
    }

    return base
}
export const goalCalories = (weightGoal, goalLBS, bmr, activity_level) => {
    let calories = bmr * activity_level;
    if (weightGoal === 'weightMaintain') {
        // return `Calories for weight mainanence - ${calories.toFixed(0)} Calories`;
        return calories.toFixed(2);
    }
    if (weightGoal === 'weightLoss') {
        calories = calories - (goalLBS * 500);
        // return `Calories for weight loss - ${calories.toFixed(0)} Calories`;
        return calories.toFixed(0);
    }
    if (weightGoal === 'weightGain') {
        calories = calories + (goalLBS * 500);
        // return `Calories for weight gain - ${calories.toFixed(0)} Calories`;
        return calories.toFixed(0);
    }
}
export const activityFactor = (r, vla, la, ma, ha) => {
    if (r < 0 || vla < 0 || la < 0 || ma < 0 || ha < 0) throw `Error: Activity Factor inputs must be positive.`
    if (r + vla + la + ma + ha !== 24) {
        throw `Error: Total hours must equal 24. Your current input is ${r + vla + la + ma + ha}`;
    }
    const activityFactor = (r * 1 + vla * 1.2 + la * 2.5 + ma * 5 + ha * 7) / 24
    return activityFactor
}