import { ChartUnitWidth } from "./chart_unit_width";

export abstract class Note {
  constructor(private width_offset: ChartUnitWidth) {}

  get_width_offset(): ChartUnitWidth {
    return this.width_offset;
  }

  static get_color(): string {
    throw new Error("call of pure virtual function");
  }

  static get_width(): number {
    throw new Error("call of pure virtual function");
  }

  static get_height(): number {
    throw new Error("call of pure virtual function");
  }
}

export class TapNote extends Note {
  constructor(width_offset: ChartUnitWidth) {
    super(width_offset);
  }

  static get_color() {
    return "#6CB6EF";
  }

  static get_width() {
    return 80;
  }

  static get_height() {
    return 0.05;
  }
}

export class FlickNote extends Note {
  constructor(width_offset: ChartUnitWidth) {
    super(width_offset);
  }

  static get_color() {
    return "#F6D046";
  }

  static get_width() {
    return 80;
  }

  static get_height() {
    return 0.05;
  }
}

export class TouchNote extends Note {
  constructor(width_offset: ChartUnitWidth) {
    super(width_offset);
  }

  static get_color() {
    return "#EB423E";
  }

  static get_width() {
    return 80;
  }

  static get_height() {
    return 0.05;
  }
}
