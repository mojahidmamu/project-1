const OpenAI = require("openai")
require("dotenv").config()

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPEN_ROUTER_KEY,
        
})

async function main() {
  const completion = await openai.chat.completions.create({
    model: "poolside/laguna-m.1:free",
    messages: [
      { role: "user", content: "What is Agentic AI?" }
    ],
  })

  console.log(completion.choices[0].message)
}

export const agent = async (goalText, duration) => {
  const promt = `You are an agent that can perform tasks to achieve a goal. Your goal is: ${goalText}. You have ${duration} days to achieve this goal. What steps will you take to achieve this goal? Please provide a detailed plan with specific actions and timelines.`;
  try {
      const completion = await openai.chat.completions.create({
      model: "poolside/laguna-m.1:free",
      messages: [
        {role: "system", content: "You are a helpful and efficient assistant that helps users achieve their goals by providing detailed plans and actionable steps. Create actionable plans."  },
        { role: "user", content: promt }
      ],
      temperature: 0.7, // Adjust the temperature for more creativity (0.7 is a good starting point)
    })

    // console.log(completion.choices[0].message);
    const content = completion.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonString = jsonMatch[0];
      try {
        const plan = JSON.parse(jsonString);
        return plan;
      }
        catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        return { error: "Failed to parse the plan. Please try again." };
      }
    } else {
      console.error("No JSON found in the response.");
      return { error: "No plan found in the response. Please try again." };
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// main(); 
