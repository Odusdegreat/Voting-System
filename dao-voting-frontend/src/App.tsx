import { RouterProvider } from "react-router";

import { app_router } from "@/routes";

export default function App() {
  return <RouterProvider router={app_router} />;
}
