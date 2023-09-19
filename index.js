const express = require("express");
const users = require("./MOCK_DATA.json");
const app = express();
const PORT = 8000;

// middleware
app.use(express.urlencoded({extended: false}))

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
app.get("/api/users", (req, res) => {
  return res.json(users);
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
    const fs = require("fs");
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

app.post("/api/users/", (req, res) => {
  const body = req.body;
  users.push({
    body
  })
  return res.json({
    user: body,
  });
});




//this will trigger if none of end point found
app.use((req,res,next) =>{
    res.status(404).json({
        "message": "Route not found"
    })
})

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
