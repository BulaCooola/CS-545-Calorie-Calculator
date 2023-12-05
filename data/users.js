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

export const getDataByName = async (username)=>{
    username = checkUsername(username);
    const userCollection = await users();
    const user = await userCollection.find({}).toArray();
    console.log(user);
    if (!user) throw 'Error: User not found';
    return user;

}

export const saveData = async () => {
    
}
