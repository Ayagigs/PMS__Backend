import jwt from "jsonwebtoken";

const generateToken = id =>{
    return jwt.sign({id}, process.env.JWT_KEY,{expiresIn:process.env.TOKEN_EXPIRES})
}

export default generateToken;