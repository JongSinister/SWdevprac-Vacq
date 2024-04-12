const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

dotenv.config({ path: "./config/config.env" });

connectDB();

//Route files
const hospitals = require("./routes/hospitals");
const auth = require("./routes/auth");
const appointments = require("./routes/appointments");
const cors = require("cors");

const app = express();
//add cooker parser
app.use(cookieParser());
//Body parser
app.use(express.json());
//Security
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
const limiter = rateLimit({
  windowsMs: 10 * 60 * 1000, //10 mins
  max: 100,
});
app.use(limiter);
app.use(hpp());
app.use(cors());

app.use("/api/v1/hospitals", hospitals);
app.use("/api/v1/auth", auth);
app.use("/api/v1/appointments", appointments);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express VacQ API",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
      },
    ],
  },
  apis: ["./routes/*.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//DeviceOrientationEvent.config({path:'./config/config.env'});

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(
    "Server running in ",
    process.env.NODE_ENV,
    " mode on port ",
    PORT
  )
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  //Close server & exit process
  server.close(() => process.exit(1));
});
