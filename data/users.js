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
    let getUser = await userCollection.findOne(username);

    getUser.update(
        {username: getUser.username},
        {email: getUser.email},
        {password: getUser.password},
        {$set: {
            currentGoal: currentGoal,
            activity_level:activity_level,
            BMR:BMR,
            caloric_needs:caloric_needs
        }}
    )
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