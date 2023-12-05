import {users} from '../config/mongoCollections.js';
import {checkUsername, checkEmail, checkPassword} from '../helper.js'
import bcrypt from 'bcrypt';

export const registerUser = async (
    username,
    emailAddress,
    password,
    confirmPassword
)=>{
    username = checkUsername(username);
    emailAddress = checkEmail(emailAddress);
    password = checkPassword(password);
    confirmPassword = checkPassword(confirmPassword);
    
    username = username.trim();
    emailAddress = emailAddress.trim();
    password = password.trim();
    confirmPassword = confirmPassword.trim();
    if(password !== confirmPassword){
        throw 'passwords must be the same';
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCollection = await users();
    let newUser = { 
        username:username,
        emailAddress:emailAddress,
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

export const updateUser = async (username,emailAddress,password)=>{
    username = checkUsername(username);
    emailAddress = checkEmail(emailAddress);
    password = checkPassword(password);
    username = username.trim();
    emailAddress = emailAddress.trim();
    password = password.trim();
    const hashedPassword = await bcrypt.hash(password, 10);
    let updatedUser = {
        emailAddress:emailAddress,
        password:password
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

export const saveData = async () => {
    return 0;
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