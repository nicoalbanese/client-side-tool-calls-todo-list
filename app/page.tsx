"use client";

import { TodoTool } from "@/ai/tools";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { generateId } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";

type Todo = {
  id: string;
  content: string;
  done: boolean;
};

export default function Chat() {
  const [todos, setTodos] = useState<Todo[]>([
    { content: "Learn how to use the AI SDK", done: false, id: generateId() },
    { content: "Buy Milk", done: false, id: generateId() },
  ]);

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();
  const [weather, setWeather] = useState();

  const { messages, input, handleInputChange, handleSubmit, error } = useChat({
    onFinish(message) {
      message.toolInvocations?.forEach((m) => {
        if (m.toolName === "weather" && m.state === "result") {
          setWeather(m.result);
        }
      });
    },
    body: { todos },
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === "todo") {
        const { type, content, id } = toolCall.args as TodoTool;

        if (type === "add") {
          const newTodo = { id: generateId(), content, done: false };
          setTodos((prevTodos) => [...prevTodos, newTodo]);
          return newTodo;
        }

        if (type === "mark-done" || type === "update") {
          let updatedTodo = todos.find((todo) => todo.id === id);
          if (!updatedTodo) return "No todo found with that id";
          updatedTodo =
            type === "mark-done"
              ? { ...updatedTodo, done: true }
              : {
                  ...updatedTodo,
                  content,
                };
          setTodos((prevTodos) =>
            prevTodos.map((todo) => (todo.id === id ? updatedTodo : todo)),
          );
          return updatedTodo;
        }
      }
    },
    maxSteps: 3,
  });
  if (error) return <pre>Error: {JSON.stringify(error, null, 2)}</pre>;

  return (
    <div className="flex w-full h-screen">
      <div
        id="left"
        className="w-1/2 relative border-l border-zinc-200 shadow-sm"
      >
        <div
          className="space-y-4 px-8 lg:px-16 py-8 overflow-y-scroll h-full"
          ref={messagesContainerRef}
        >
          {messages.map((m) => {
            if (m.toolInvocations) {
              const { state: toolState, toolName } = m.toolInvocations[0];
              if (toolState === "result") return null;
              else
                return (
                  <div key={m.id} className="text-zinc-400">
                    calling {toolName}
                  </div>
                );
            }

            return (
              <div key={m.id} className="whitespace-pre-wrap animate-fadeIn">
                <div>
                  <div className="font-bold">{m.role}</div>
                  <p>{m.content}</p>
                </div>
              </div>
            );
          })}
          <div
            ref={messagesEndRef}
            className="shrink-0 w-full min-h-24 md:min-h-[24px]"
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="absolute bottom-0 left-1/2 bg-white dark:bg-background pt-4 -translate-x-1/2 w-full px-8 lg:px-16"
        >
          <input
            className="text-base w-full p-2 mb-8 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-200 focus:dark:ring-zinc-700 focus:outline-none dark:bg-zinc-900 rounded shadow-sm mx-auto block"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div>
      <div id="right" className="w-1/2 bg-zinc-100 dark:bg-zinc-900 px-12 py-8">
        <h2 className="text-xl font-semibold pb-2 animate-fadeIn">
          Weather
        </h2>
        <pre>{JSON.stringify(weather, null, 2)}</pre>
      </div>
    </div>
  );
}

const Todo = ({ todo }: { todo: Todo }) => {
  return (
    <div className="flex items-center space-x-2 p-2 border-b border-zinc-200 dark:border-zinc-700 animate-fadeIn">
      <input
        type="checkbox"
        checked={todo.done}
        disabled
        className="form-checkbox h-4 w-4 text-blue-600"
      />
      <span
        className={`flex-grow ${todo.done ? "line-through text-zinc-500" : ""}`}
      >
        {todo.content}
      </span>
    </div>
  );
};
