export const obtainTokenFromHeader = (req) => {
  const headersDetails = req.headers;
  const token = headersDetails["authorization"].split(" ")[1];

  if (token !== undefined) {
    return token;
  } else {
    return {
      status: "error",
      message: "It seems there is no token attached to the header",
    };
  }
};

export const obtainRefreshTokenFromHeader = (req) => {
  const headersDetails = req.headers;
  const refreshToken = headersDetails["authorization"].split(" ")[1];

  if (refreshToken !== undefined) {
    return refreshToken;
  } else {
    return {
      status: "error",
      message: "It seems there is no token attached to the header",
    };
  }
};
