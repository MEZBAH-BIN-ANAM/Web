require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const db = require("./config/db");

const authRouter = require("./routes/auth-routes");
const homeRoutes = require("./routes/home-routes");
const productRoutes = require("./routes/product-routes");
const adminRoutes = require("./routes/admin-routes");
const cartRoutes = require("./routes/cart-routes");
const orderRoutes = require("./routes/order-routes");
const contactRoutes = require("./routes/contact-routes");

const errorMiddleware= require("./middllewares/error-middleware")

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS setup
const allowedOrigins = [process.env.CLIENT, process.env.ADMIN];
const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like Postman or server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("Blocked by CORS:", origin);
      callback(null, false); // block without crashing
    }
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));



// Serve static files of multer
app.use("/upload", express.static(path.join(__dirname, "upload")));

// Routes

//client auth routes
app.use("/auth", authRouter);

//home routes
app.use("/api/client/home",homeRoutes)

//client Product routes
app.use("/api/client", productRoutes);

//client cart routes
app.use("/api/client/cart", cartRoutes);

//order route
app.use("/api/client/order", orderRoutes);

//client contact routes
app.use("/api/client", contactRoutes)

//admin routes
app.use("/api/admin", adminRoutes);

//error middleware
app.use(errorMiddleware);

// Connect DB & start server
db()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running at http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("Failed to connect to DB", err));
