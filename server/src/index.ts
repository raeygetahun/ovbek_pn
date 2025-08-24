import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import routes from "./routes";

const app = express();
const corsOrigins = (process.env.CORS_ORIGINS || "")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

app.use(
	cors({
		origin: corsOrigins.length ? corsOrigins : true,
		credentials: process.env.CORS_CREDENTIALS === "true",
	})
);
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use("/api", routes);

app.listen(PORT, () => {});
