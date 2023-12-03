import validation from '..helper/js'
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


}