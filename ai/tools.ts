import { tool } from "ai";
import { z } from "zod";

const todoToolSchema = z.object({
  type: z
    .enum(["add", "mark-done", "update"])
    .describe(
      "Action to perform on the todo list. Add to add a new todo, mark-done to mark a todo as done, and update to change the text a todo item.",
    ),
  content: z.string().describe("Content of the new todo item"),
  id: z.string().optional().describe("ID of the todo item to mark as done"),
});

export type TodoTool = z.infer<typeof todoToolSchema>;

export const tools = {
  todo: tool({
    description:
      "Interact with todo list. If the user says they've done something or say they need to do something, use this tool to either add a todo or mark a todo as done.",
    parameters: todoToolSchema,
  }),
  weather: tool({
    description: "Get the current weather at a location",
    parameters: z.object({
      latitude: z.number(),
      longitude: z.number(),
      city: z.string(),
    }),
    execute: async ({ latitude, longitude, city }) => {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,relativehumidity_2m&timezone=auto`,
      );

      const weatherData = await response.json();
      return {
        temperature: weatherData.current.temperature_2m,
        weatherCode: weatherData.current.weathercode,
        humidity: weatherData.current.relativehumidity_2m,
        city,
      };
    },
  }),
};
