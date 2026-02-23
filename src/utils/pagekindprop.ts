import { PageKind } from "./pagekind";
import { type Setter } from "solid-js";

export interface PageKindProp {
  getPageKind: () => PageKind;
  setPageKind: Setter<PageKind>;
}
