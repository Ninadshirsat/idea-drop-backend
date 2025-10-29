import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import ideaRoutes from "./routes/ideaRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
app.set("json spaces", 2);

//connect to mongoDB
connectDB();

//CORS config
const allowedOrigins = [
  "http://localhost:3000",
  "https://idea-drop-ui-ten.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json()); //middleware in order to accept raw json data in req body
app.use(express.urlencoded({ extended: true })); // to get url encoded data
app.use(cookieParser());

//Routes
app.use("/api/ideas", ideaRoutes);
app.use("/api/auth", authRoutes);

//404 Fallback
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`server is running on PORT : ${PORT}`);
});
