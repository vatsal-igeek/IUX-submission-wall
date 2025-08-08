import { RouterProvider } from "react-router-dom";

import { router } from "./routes/Routes";
import SplashCursor from "./components/animations/SplashCursor/SplashCursor";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <SplashCursor />
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
