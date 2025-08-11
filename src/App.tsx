import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { router } from "./routes/Routes";
// import SplashCursor from "./components/animations/SplashCursor/SplashCursor";

function App() {
  return (
    <>
      {/* <SplashCursor /> */}
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
