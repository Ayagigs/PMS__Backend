import crypto from "crypto";

const hatchedToken = (Token) => {
  const hatchedToken = crypto.createHash("sha256").update(Token).digest("hex");

  return hatchedToken;
};

export default hatchedToken;
