import expressAsyncHandler from "express-async-handler";
import {
  obtainRefreshTokenFromHeader,
  obtainTokenFromHeader,
} from "../utils/obtaintokenfromheader.js";
import { verifyRefreshToken, verifytoken } from "../utils/verifytoken.js";

export const protect = expressAsyncHandler(async (req, res, next) => {
  // Get access token from header
  const token = obtainTokenFromHeader(req);

  // // Get refresh token from header
  // const refreshToken = obtainRefreshTokenFromHeader(req);

  // Verify access token
  const userDecoded = verifytoken(token);
  req.userAuth = userDecoded;

  // // Verify refresh token
  // const refreshUserDecoded = verifyRefreshToken(refreshToken);
  // req.refreshToken = refreshUserDecoded;

  if (!userDecoded) {
    return res.status(401).json({
      status: "failed",
      message: "Kindly login, it seems the token is either expired or invalid",
    });
  }
  next();
});
