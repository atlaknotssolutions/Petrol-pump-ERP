import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./apps/auth-services/config/src/utils/database.js";
import cookieParser from "cookie-parser";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
connectDB();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(helmet());
app.use(cookieParser());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
