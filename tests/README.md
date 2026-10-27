# Spec test

`spectest.mjs` opens the brotoid page in a browser and checks it against [SPEC.md](SPEC.md). Each target (S1, S2, …) is a
check over what the page shows. Each target also runs over a planted observation, with one thing broken on purpose, and
must fail there. A target passes only if its check passes **and** its plant is caught.

## Run it

```
cd tests
npm install                      # playwright 1.58.2
npx playwright install chromium
node serve.mjs &                 # this repo at http://localhost:8190/, static files, 404 for a missing path
node spectest.mjs                # prints PASS or FAIL per target, then "N/M targets pass"
```

- `BASE` sets the origin (default `http://localhost:8190`). `PAGE` sets the full page address.
- `SKIP=S14,S15,S16` skips whole targets, for example where headless WebGL crashes. A skipped target is reported,
  never counted as passed.
- It needs a real GPU context for the figures. It took a few minutes on the machine that made it.

## What it showed on 2026-10-27

Run against this repository's first commit, from a fresh server: **28 of 29 targets pass, with a plant caught in each**.
One fails, and it should:

- **S17 (listed):** the page shows the word *hand* to a reader, the vocabulary map files it as *posed*, and §8 of the
  page does not declare it. This is the check that stops a posed word being read as settled. It fired.

SPEC.md is fable's copy of 2026-10-24. Its status line and a few comments still name the local working folders and say
"live at /fable/brotoid/". They are left as written.
