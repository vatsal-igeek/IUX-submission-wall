import { RouterProvider } from "react-router-dom";

import { router } from "./routes/Routes";
import SplashCursor from "./components/animations/SplashCursor/SplashCursor";

function App() {
  return (
    <>
      <SplashCursor />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
