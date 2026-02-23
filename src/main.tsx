import "./main.css";
import { createSignal, Match, Switch } from "solid-js";
import { render } from "solid-js/web";
import { PageKind } from "./utils/pagekind";
import Home from "./components/home";
import PlayChart from "./components/chart";
import { Chart } from "./utils/chart";

const app = document.getElementById("app") as HTMLDivElement;

function App() {
  const [getPageKind, setPageKind] = createSignal<PageKind>(PageKind.Home);
  const [getChart, setChart] = createSignal<Chart | null>(null);
  // TODO should I pass getter to Home?
  return (
    <Switch>
      <Match when={getPageKind() === PageKind.Home}>
        <Home
          setPageKind={setPageKind}
          getPageKind={getPageKind}
          setChart={setChart}
        />
      </Match>
      <Match when={getPageKind() === PageKind.Chart}>
        <PlayChart chart={getChart()!} />
      </Match>
    </Switch>
  );
}

render(App, app);
