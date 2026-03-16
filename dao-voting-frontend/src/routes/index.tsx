import { createBrowserRouter } from "react-router";

import RootLayout from "@/layouts/root-layout";
import HomePage from "@/pages/home/home-page";

export const app_router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
]);
