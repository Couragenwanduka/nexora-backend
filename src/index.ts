import express from "express";
import cors from "cors";
import verifyConnection from "./db/neo4j";
import router from "./router/index.routes";

const app = express();

const PORT = Number(process.env.PORT) || 8000;

const allowedOrigins = [
  "http://localhost:5173",
 'https://nexora-frontend-di74.vercel.app/',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin
      // e.g. Postman, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS"),
        false
      );
    },
    credentials: true,
  })
);

app.use(express.json());

app.use("/api", router);

verifyConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App is running at port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });