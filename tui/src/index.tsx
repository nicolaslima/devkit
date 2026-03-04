import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./app/App";

const renderer = await createCliRenderer({
  useMouse: false,
});

createRoot(renderer).render(<App />);
