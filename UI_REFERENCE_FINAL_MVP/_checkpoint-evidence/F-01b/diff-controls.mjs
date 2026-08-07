import { readFileSync, writeFileSync } from "node:fs";

const dir = process.argv[2];
const before = JSON.parse(readFileSync(`${dir}/before.json`, "utf8"));
const after = JSON.parse(readFileSync(`${dir}/after.json`, "utf8"));

const key = (surface, control, index) =>
  `${surface}::${index}::${control.tag}::${control.type ?? "-"}::${control.label}`;

const index = (report) => {
  const map = new Map();
  for (const surface of report.surfaces) {
    surface.controls.forEach((control, i) => map.set(key(surface.surface, control, i), { surface: surface.surface, control }));
  }
  return map;
};

const b = index(before);
const a = index(after);

const changed = [];
const unchanged = [];
const onlyBefore = [];
const onlyAfter = [];

for (const [k, v] of b) {
  if (!a.has(k)) {
    onlyBefore.push(k);
    continue;
  }
  const x = v.control;
  const y = a.get(k).control;
  const delta = {};
  for (const field of ["color", "background", "fontWeight", "fontSizePx", "ratio", "passes", "disabled"]) {
    if (x[field] !== y[field]) delta[field] = { before: x[field], after: y[field] };
  }
  if (Object.keys(delta).length === 0) unchanged.push(k);
  else changed.push({ surface: v.surface, tag: x.tag, type: x.type, label: x.label, disabled: y.disabled, textBearing: y.textBearing, classes: y.classes, delta });
}
for (const k of a.keys()) if (!b.has(k)) onlyAfter.push(k);

const regressions = changed.filter((c) => c.delta.passes && c.delta.passes.before === true && c.delta.passes.after === false);
const repairs = changed.filter((c) => c.delta.passes && c.delta.passes.before === false && c.delta.passes.after === true);

const report = {
  totals: {
    controlsBefore: b.size,
    controlsAfter: a.size,
    unchanged: unchanged.length,
    changed: changed.length,
    onlyBefore: onlyBefore.length,
    onlyAfter: onlyAfter.length,
    enabledTextFailuresBefore: before.failures.length,
    enabledTextFailuresAfter: after.failures.length,
  },
  namedBefore: before.named,
  namedAfter: after.named,
  contrastRepairs: repairs,
  contrastRegressions: regressions,
  allChanged: changed,
  remainingFailuresAfter: after.failures,
  consoleErrors: { before: before.consoleErrors, after: after.consoleErrors },
};

writeFileSync(`${dir}/contrast-before-after.json`, JSON.stringify(report, null, 2));

console.log(JSON.stringify(report.totals, null, 2));
console.log("\n=== CONTRAST REPAIRS (fail -> pass) ===");
for (const c of repairs) console.log(` ${c.surface} | ${c.tag} "${c.label}" | ${c.delta.color.before} -> ${c.delta.color.after} on ${c.delta.background?.after ?? "(unchanged bg)"} | ${c.delta.ratio.before}:1 -> ${c.delta.ratio.after}:1`);
console.log("\n=== CONTRAST REGRESSIONS (pass -> fail) ===");
if (regressions.length === 0) console.log(" none");
for (const c of regressions) console.log(` ${c.surface} | ${c.tag} "${c.label}" | ${c.delta.color.before} -> ${c.delta.color.after} | ${c.delta.ratio.before}:1 -> ${c.delta.ratio.after}:1 | disabled=${c.disabled} | ${c.classes.slice(0, 130)}`);
console.log("\n=== EVERY CHANGED CONTROL ===");
for (const c of changed) {
  const bits = Object.entries(c.delta).map(([f, d]) => `${f}: ${d.before} -> ${d.after}`).join("; ");
  console.log(` ${c.surface} | ${c.tag}${c.type ? "[" + c.type + "]" : ""} "${c.label}" | disabled=${c.disabled} | ${bits}`);
}
