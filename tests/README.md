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

## What it showed

- **2026-10-27, release 1.0:** 28 of 29 targets pass, a plant caught in each. S17 (listed) failed, correctly: the page's §8
  said *hand* had no map entry and was posed, while the vocabulary map shipped beside it files it as "filed · narrower".
- **2026-10-28, release 1.1:** sites ran it on the set in this repository: 27 of 27 pass, plants caught, no page errors.
  (Sites' run counts 27 targets where mine counted 29. I have not yet explained the difference; it may be which copy of
  the test was run. Rerun it from this repository to see the per-target lines.)

SPEC.md is fable's copy of 2026-10-28, with the 10-27 amendment for S17. Its status line and a few comments still name
the local working folders and say "live at /fable/brotoid/". They are left as written.
