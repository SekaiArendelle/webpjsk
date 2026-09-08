import { Navigate, Route, Router } from "@solidjs/router";
import { lazy, type ParentProps } from "solid-js";
import { PlayProgressProvider } from "./stores/play-progress";
import { PlaySessionProvider } from "./stores/play-session";

const SelectRoute = lazy(() => import("./routes/select"));
const PlayRoute = lazy(() => import("./routes/play"));

function AppRoot(props: ParentProps) {
  return (
    <PlayProgressProvider>
      <PlaySessionProvider>{props.children}</PlaySessionProvider>
    </PlayProgressProvider>
  );
}

function RedirectToSelect() {
  return <Navigate href="/select" />;
}

export default function App() {
  return (
    <Router root={AppRoot}>
      <Route path="/" component={RedirectToSelect} />
      <Route path="/select" component={SelectRoute} />
      <Route path="/play/:songId" component={PlayRoute} />
      <Route path="*404" component={RedirectToSelect} />
    </Router>
  );
}
