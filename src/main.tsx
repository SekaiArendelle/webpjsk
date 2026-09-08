import { render } from "solid-js/web";
import App from "./app";
import "./main.css";

const app = document.getElementById("app");
if (!app) throw new Error("找不到 #app 根节点");

render(() => <App />, app);
