import { type ChartUnitWidth } from "./chart-unit-width";

export abstract class Note {
  constructor(private widthOffset: ChartUnitWidth) {}

  getWidthOffset(): ChartUnitWidth {
    return this.widthOffset;
  }

  static getColor(): string {
    throw new Error("call of pure virtual function");
  }

  static getWidth(): number {
    throw new Error("call of pure virtual function");
  }

  static getHeight(): number {
    throw new Error("call of pure virtual function");
  }
}

export class TapNote extends Note {
  static getColor() {
    return "#6CB6EF";
  }

  static getWidth() {
    return 80;
  }

  static getHeight() {
    return 0.05;
  }
}

export class FlickNote extends Note {
  static getColor() {
    return "#F6D046";
  }

  static getWidth() {
    return 80;
  }

  static getHeight() {
    return 0.05;
  }
}

export class TouchNote extends Note {
  static getColor() {
    return "#EB423E";
  }

  static getWidth() {
    return 80;
  }

  static getHeight() {
    return 0.05;
  }
}
