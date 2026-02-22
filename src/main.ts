import "./style.css";
import { homePage } from "./components/home";

const app = document.getElementById("app") as HTMLDivElement;
app.innerHTML = homePage();
