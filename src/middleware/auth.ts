import { auth } from "express-oauth2-jwt-bearer";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      auth0Id: string;
    }
  }
}

if (!process.env.AUTH0_AUDIENCE) {
  throw new Error("AUTH0_AUDIENCE environment variable not set");
}

if (!process.env.AUTH0_ISSUER_BASE_URL) {
  throw new Error("AUTH0_ISSUER_BASE_URL environment variable not set");
}

export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

export const jwtParse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }

  // Bearer lshdflshdjkhvjkshdjkvh34h5k3h54jkh
  const token = authorization.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      const auth0Id = decoded.sub;

      const user = await User.findOne({ auth0Id });

      if (!user) {
        return res.sendStatus(401);
      }

      req.auth0Id = auth0Id as string;
      req.userId = user._id.toString();
      next();
    } catch (error) {
      return res.sendStatus(401);
    }
  } else {
    return res.sendStatus(401);
  }
};
