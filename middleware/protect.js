import expressAsyncHandler from "express-async-handler";
import { obtainTokenFromHeader } from "../utils/obtaintokenfromheader.js";
import { verifytoken } from "../utils/verifytoken.js";

export const protect = expressAsyncHandler(async (req, res, next) => {
  // get token from header
  const token = obtainTokenFromHeader(req);

  const userDecoded = verifytoken(token);

  req.userAuth = await userDecoded.id;

  if (!userDecoded) {
    return res.json({
      status: "failed",
      message: "Kindly login, it seem the token is either expired or invalid",
    });
  } else {
    next();
  }
});
