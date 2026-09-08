import { type Note } from "./notes";

export class Chart {
  constructor(private groups: Note[][]) {}

  getGroups(): readonly (readonly Note[])[] {
    return this.groups;
  }
}
