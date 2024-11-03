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
};
