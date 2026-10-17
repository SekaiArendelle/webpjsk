import assert from "node:assert/strict";
import test from "node:test";
import { Chart } from "../src/domain/chart";
import { ChartUnitWidth } from "../src/domain/chart-unit-width";
import { JudgmentEngine } from "../src/domain/judgment";
import {
  FlickNote,
  GuideNote,
  HoldNote,
  SlideNote,
  TapNote,
  TraceFlickNote,
  TraceNote,
} from "../src/domain/notes";

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
  assert.equal(early.input("space", 5, 1000, "press")[0].part, "head");
  assert.equal(early.release("space", 1200)[0].grade, "MISS");
  const complete = new JudgmentEngine(chart.getEvents());
  complete.input("space", 5, 1000, "press");
  assert.equal(complete.update(1500).length, 0);
  assert.equal(complete.release("space", 1500)[0].grade, "PERFECT");
  assert.equal(complete.getState().judgedCount, 2);
});

test("trace checks held contact at the note time", () => {
  const chart = new Chart([
    { id: "trace", timeMs: 1000, note: new TraceNote(new ChartUnitWidth(4)) },
  ]);
  const engine = new JudgmentEngine(chart.getEvents());
  assert.equal(engine.press("finger", 4, 700).length, 0);
  assert.equal(engine.update(1000)[0].grade, "PERFECT");
  assert.equal(engine.getState().judgedCount, 1);
});

test("directional flick and trace flick require movement in the right direction", () => {
  const chart = new Chart([
    {
      id: "flick",
      timeMs: 1000,
      note: new FlickNote(new ChartUnitWidth(2), 1, "up-right"),
    },
    {
      id: "trace-flick",
      timeMs: 1500,
      note: new TraceFlickNote(new ChartUnitWidth(7)),
    },
  ]);
  const engine = new JudgmentEngine(chart.getEvents());
  engine.press("finger", 2, 900);
  assert.equal(engine.flick("finger", 2, 1000, "up-left").length, 0);
  assert.equal(
    engine.flick("finger", 2, 1000, "up-right")[0].event.id,
    "flick",
  );
  engine.move("finger", 7, 1400);
  assert.equal(
    engine.flick("finger", 7, 1500, "up")[0].event.id,
    "trace-flick",
  );
  const withoutTouch = new JudgmentEngine(chart.getEvents());
  assert.equal(
    withoutTouch
      .flick("new-finger", 7, 1500, "up")
      .filter((result) => result.event.id === "trace-flick").length,
    0,
  );
});

test("slide follows its path and judges head, middle tick, and flick tail", () => {
  const slide = new SlideNote(
    [
      { offsetMs: 0, lane: 1, width: 1 },
      { offsetMs: 500, lane: 3, width: 1, judge: true },
      { offsetMs: 1000, lane: 5, width: 1 },
    ],
    { tail: "flick", tailDirection: "up-right" },
  );
  const chart = new Chart([{ id: "slide", timeMs: 1000, note: slide }]);
  const engine = new JudgmentEngine(chart.getEvents());
  assert.equal(engine.press("finger", 1, 1000)[0].part, "head");
  assert.equal(engine.move("finger", 3, 1500)[0].part, "tick");
  engine.move("finger", 5, 2000);
  assert.equal(engine.flick("finger", 5, 2000, "up-right")[0].part, "tail");
  assert.equal(engine.getState().judgedCount, 3);
  assert.equal(engine.getState().score, 3000);
});

test("leaving a slide path or releasing early misses remaining parts", () => {
  const slide = new SlideNote([
    { offsetMs: 0, lane: 1, width: 1 },
    { offsetMs: 500, lane: 3, width: 1, judge: true },
    { offsetMs: 1000, lane: 5, width: 1 },
  ]);
  const chart = new Chart([{ id: "slide", timeMs: 1000, note: slide }]);
  const engine = new JudgmentEngine(chart.getEvents());
  engine.press("finger", 1, 1000);
  engine.move("finger", 9, 1100);
  assert.deepEqual(
    engine.update(1270).map((result) => result.grade),
    ["MISS", "MISS"],
  );
  assert.equal(engine.getState().judgedCount, 3);
});

test("guide has no judgment; critical notes score more", () => {
  const chart = new Chart([
    {
      id: "guide",
      timeMs: 1000,
      note: new GuideNote([
        { offsetMs: 0, lane: 2, width: 1 },
        { offsetMs: 500, lane: 4, width: 1 },
      ]),
    },
    {
      id: "critical",
      timeMs: 1000,
      note: new TapNote(new ChartUnitWidth(5), 1, true),
    },
  ]);
  const engine = new JudgmentEngine(chart.getEvents());
  assert.equal(chart.getJudgmentCount(), 1);
  assert.equal(engine.press("finger", 5, 1000)[0].event.id, "critical");
  assert.equal(engine.getState().score, 1200);
  assert.equal(engine.getState().maxScore, 1200);
});

test("trace headed slide accepts continuous contact and trace tail completes without release", () => {
  const chart = new Chart([
    {
      id: "trace-slide",
      timeMs: 1000,
      note: new SlideNote(
        [
          { offsetMs: 0, lane: 4, width: 1 },
          { offsetMs: 500, lane: 4, width: 1 },
        ],
        { head: "trace", tail: "trace" },
      ),
    },
  ]);
  const engine = new JudgmentEngine(chart.getEvents());
  engine.touch("finger", 4, 800);
  assert.equal(engine.update(1000)[0].part, "head");
  assert.equal(engine.update(1500)[0].part, "tail");
  assert.equal(engine.getState().score, 2000);
});

test("flick headed slide requires the head direction", () => {
  const chart = new Chart([
    {
      id: "flick-slide",
      timeMs: 1000,
      note: new SlideNote(
        [
          { offsetMs: 0, lane: 2, width: 1 },
          { offsetMs: 500, lane: 2, width: 1 },
        ],
        { head: "flick", headDirection: "up-left" },
      ),
    },
  ]);
  const engine = new JudgmentEngine(chart.getEvents());
  engine.touch("finger", 2, 900);
  assert.equal(engine.flick("finger", 2, 1000, "up-right").length, 0);
  assert.equal(engine.flick("finger", 2, 1000, "up-left")[0].part, "head");
  assert.equal(engine.release("finger", 1500)[0].part, "tail");
});

test("slide points are validated", () => {
  assert.throws(
    () =>
      new Chart([
        {
          id: "bad",
          timeMs: 0,
          note: new SlideNote([
            { offsetMs: 0, lane: 2, width: 1 },
            { offsetMs: 500, lane: 10, width: 1 },
          ]),
        },
      ]),
    /轨迹无效/,
  );
});
