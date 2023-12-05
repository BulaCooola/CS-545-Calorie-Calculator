import {users} from '../config/mongoCollections.js';
import * as validation from '../helper.js'
export const registerUser = async (
    username,
    emailAddress,
    password,
    confirmPassword
)=>{
    username = validation.checkUsername(username);
    emailAddress = validation.checkEmail(emailAddress);
    password = validation.checkPassword(password);
    confirmPassword = validation.checkPassword(confirmPassword);

    username = username.trim();
    emailAddress = emailAddress.trim();
    password = password.trim();
    confirmPassword = confirmPassword.trim();
    if(password !== confirmPassword){
        throw 'passwords must be the same';
    }
    const userCollection = await users();
    let newUser = { 
        username:username,
        emailAddress:emailAddress,
        password:password,
        confirmPassword:confirmPassword
    }
    
    let insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw 'Could not add user';
    }
    return {insertedUser:true};

}

export const getDataByName = async (username)=>{
    username = validation.checkUsername(username);
    const user = await userCollection.findOne({_username:username});
    if (!user) throw 'Error: User not found';
    return user;

}
