const express = require("express");
const users = require("./MOCK_DATA.json");
const mongoose = require("mongoose");
const app = express();
const PORT = 8000;
const fs = require("fs");
const { timeStamp } = require("console");
// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ extended: false }));
app.use(express.text({ extended: false }));

//Connection

mongoose
  .connect("mongodb://127.0.0.1:27017/youtube-app-1")
  .then(() => console.log("MongoDb connected"))
  .catch((err) => console.log("MongoDb Error", err));

//SCHEMA
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    jobTitle: {
      type: String,
    },
    gender: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

//Model
const User = mongoose.model("user", userSchema);

app.use((req, res, next) => {
  fs.appendFile(
    "log.txt",
    `\n${Date.now()}: ${req.method}: ${req.path} ${req.body.first_name} ${
      req.headers
    }`,
    (err, data) => {
      next();
    }
  );
});

app.use((req, res, next) => {
  console.log("middleware 1");
  // return res.json({
  //     "error": "Ivalid access"
  // })
  next();
});

//ROUTES

app.get("/users", (req, res) => {
  const html = `
    <ul>
    ${users.map((user) => `<li>${user.first_name}</li>`).join("")}
    </ul>
    `;
  res.send(html);
});

//REST API POINTS
app.get("/api/users", async (req, res) => {
    const allDbUsers = await User.find({})
  return res.json(allDbUsers);
});

app
  .route("/api/users/:id")
  .get((req, res) => {
    const id = Number(req.params.id);
    console.log("id:" + id);
    const user = users.find((user) => user.id === id);
    return res.json(user);
  })
  .patch((req, res) => {
    const id = parseInt(req.params.id); // Convert id to a number if needed
    const updatedUserData = req.body; // New user data to update

    // Find the index of the user with the matching id
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user data with the new data
    users[userIndex] = {
      ...users[userIndex],
      ...updatedUserData,
    };

    // Update the JSON file with the modified data (optional)

    const data = JSON.stringify(users, null, 2);
    fs.writeFileSync("MOCK_DATA.json", data);

    return res.json({
      status: "User updated",
      updatedUser: users[userIndex],
    });
  })
  .delete((req, res) => {
    const id = parseInt(req.params.id);

    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }
    // Remove the user from the array
    users.splice(userIndex, 1);

    // Update the JSON file with the modified data (optional)
    const fs = require("fs");
    const data = JSON.stringify(users, null, 2);
    fs.writeFileSync("MOCK_DATA.json", data);

    return res.json({
      status: "User deleted",
    });
  });

app.post("/api/users/", async (req, res) => {
  const body = req.body;

  if (
    !body ||
    !body.first_name ||
    !body.last_name ||
    !body.email ||
    !body.gender ||
    !body.job_title
  ) {
    return res.status(400).json({
      status: 400,
      message: "Fields missing",
    });
  }

  const result = await User.create({
    firstName: body.first_name,
    lastName: body.last_name,
    email: body.email,
    gender: body.gender,
    jobTitle: body.job_title,
  });

  console.log("result", result);
  return res.status(201).json({
    status: 201,
    message: "Success",
  });

  // for file write
  //   users.push({
  //     body,
  //   });
});

//this will trigger if none of end point found
app.use((req, res, next) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
