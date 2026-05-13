// you should must run `npm install cors dotenv express`
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const storage = require("./storage");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// API :
app.get("/", (req, res) => {
  res.send("Welcome to the AI Task Agent API!");
});

app.post("/api/goals", async (req, res) => {
  try {
    const { goalText, duration } = req.body;
    if (!goalText || !duration) {
      return res.status(400).json({
        error: "Please provide both goalText and duration in the request body.",
      });
    }
    const result = await agent(goalText, duration);
    const goal = storage.saveGoal({
      text: goalText,
      duration,
      plan: result,
      status: "active",
    });

    const tasks = storage.saveTasks(goal.id, []); // Initialize empty tasks for the goal
    result.forEach((step, index) => {
      const task = {
        goalId: goal.id,
        day: step.day || index + 1,
        title: step.title || `Task for day ${index + 1}`,
        description: step.description || "",
      };
      tasks.push(task);
    });
    storage.saveTasks(
      goal.id,
      tasks.filter((t) => t.goalId === goal.id),
    );

    res.json({ plan: result });
  } catch (error) {
    console.error("Error in /agent route:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});

//  SERVER START
app.listen(PORT, () => {
  console.log(`🚀 AI Task Agent running on http://localhost:${PORT}`);
});
