import assert from "node:assert/strict";
import test from "node:test";
import { Chart } from "../src/domain/chart";
import { ChartUnitWidth } from "../src/domain/chart-unit-width";
import { JudgmentEngine } from "../src/domain/judgment";
import { FlickNote, HoldNote, TapNote } from "../src/domain/notes";

test("simultaneous notes are judged separately and cannot score twice", () => {
  const chart = new Chart([
    { id: "left", timeMs: 1000, note: new TapNote(new ChartUnitWidth(1)) },
    { id: "right", timeMs: 1000, note: new TapNote(new ChartUnitWidth(8)) },
  ]);
  const engine = new JudgmentEngine(chart.getEvents());
  assert.equal(engine.input("d", 1, 1000, "press")[0].grade, "PERFECT");
  assert.equal(engine.input("d", 1, 1000, "press").length, 0);
  assert.equal(engine.input("k", 8, 1080, "press")[0].grade, "GREAT");
  assert.equal(engine.getState().score, 1700);
  assert.equal(engine.getState().judgedCount, 2);
});

test("nearby simultaneous notes prefer the exact lane", () => {
  const chart = new Chart([
    { id: "lane-1", timeMs: 1000, note: new TapNote(new ChartUnitWidth(1)) },
    { id: "lane-2", timeMs: 1000, note: new TapNote(new ChartUnitWidth(2)) },
  ]);
  const engine = new JudgmentEngine(chart.getEvents());
  assert.equal(engine.input("first", 2, 1000, "press")[0].event.id, "lane-2");
  assert.equal(engine.input("second", 1, 1000, "press")[0].event.id, "lane-1");
});

test("wrong type and lane do not hit; late notes miss", () => {
  const chart = new Chart([
    { id: "flick", timeMs: 500, note: new FlickNote(new ChartUnitWidth(4)) },
  ]);
  const engine = new JudgmentEngine(chart.getEvents());
  assert.equal(engine.input("x", 4, 500, "press").length, 0);
  assert.equal(engine.input("x", 0, 500, "flick").length, 0);
  assert.equal(engine.update(661)[0].grade, "MISS");
  assert.equal(engine.getState().life, 920);
  assert.equal(engine.input("x", 4, 661, "flick").length, 0);
});

test("hold requires staying pressed until its end", () => {
  const chart = new Chart([
    {
      id: "hold",
      timeMs: 1000,
      note: new HoldNote(new ChartUnitWidth(5), 500),
    },
  ]);
  const early = new JudgmentEngine(chart.getEvents());
  assert.equal(early.input("space", 5, 1000, "press").length, 0);
  assert.equal(early.release("space", 1200)[0].grade, "MISS");
  const complete = new JudgmentEngine(chart.getEvents());
  complete.input("space", 5, 1000, "press");
  assert.equal(complete.update(1500)[0].grade, "PERFECT");
  assert.equal(complete.release("space", 1600).length, 0);
});
