import "./main.css";
import { createSignal, Match, Switch } from "solid-js";
import { render } from "solid-js/web";
import { PageKind } from "./utils/pagekind";
import Home from "./components/home";
import Chart from "./components/chart";

const app = document.getElementById("app") as HTMLDivElement;

function App() {
  const [getPageKind, setPageKind] = createSignal<PageKind>(PageKind.Home);
  // TODO should I pass getter to Home?
  return (
    <Switch>
      <Match when={getPageKind() === PageKind.Home}>
        <Home setPageKind={setPageKind} getPageKind={getPageKind} />
      </Match>
      <Match when={getPageKind() === PageKind.Chart}>
        <Chart />
      </Match>
    </Switch>
  );
}

render(App, app);
