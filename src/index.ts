import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute.js";
import { v2 as cloudinary } from "cloudinary";
import myRestaurantRoute from "./routes/MyRestaurantRoute.js";
import restaurantRoute from "./routes/RestaurantRoute.js";
import orderRoute from "./routes/OrderRoute.js";

mongoose
  .connect(process.env.MONGODB_CONNECTING_STRING as string)
  .then(() => console.log("Connected to database!"));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

const app = express();

app.use(cors());

app.use("/api/order/checkout/webhook", express.raw({ type: "*/*" }));

app.use(express.json());

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "health OK!" });
});

app.use("/api/my/user", myUserRoute);
app.use("/api/my/restaurant", myRestaurantRoute);
app.use("/api/restaurant", restaurantRoute);
app.use("/api/order", orderRoute);

app.listen(7000, () => {
  console.log("server started on localhost:7000");
});
