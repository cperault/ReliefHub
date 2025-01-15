import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./store.ts";
import { App } from "./App.tsx";
import { AuthProvider } from "./Auth/AuthProvider.tsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={5000} />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </Provider>,
);
