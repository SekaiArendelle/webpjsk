import type { Chart } from "./chart";
import { PageKind } from "./pagekind";
import { type Setter } from "solid-js";

export interface PageKindProp {
  getPageKind: () => PageKind;
  setPageKind: Setter<PageKind>;
  setChart: Setter<Chart | null>;
}
