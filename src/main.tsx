import "./main.css";
import { render } from "solid-js/web";
import Home from "./components/home";

const app = document.getElementById("app") as HTMLDivElement;

function App() {
  return <Home />;
}

render(App, app);
