# Brotoid receipts

Till receipts: newest first, one per change a reader can see and one per correction. Each is short, and enough to
trace the change back to its commit.

- **change**: what changed, who asked for it, the check that proves it (and the planted fault that check catches), and
  the commit.
- **correction**: what was claimed before, what was wrong with it, and what made someone look.

## 2026-10-27 · correction · what the first release said it contained and checked

Three claims in the entry below were wrong or incomplete. brotbot's re-gate of the pushed page found them (re-gate 7,
2026-10-27); the bytes are unchanged by this commit.

- **Claimed:** the scan found "one local link in a comment". **Wrong because:** the scan looked for local addresses and
  home paths, not for `/tmp/`. `insights/brotoid_flow/index.html` line 1323 renders `<a href="/tmp/rcm/qmodel/needles.html">`
  in the notes panel (visible at `?layout=scope`, a 404 on the site), not in a comment. **Now:** the scan also looks
  for `/tmp/` paths and rendered `href`s, and finds only that one. insights has removed the sentence in their source;
  it reaches the repo with the next restamp. **The tell:** brotbot's gate loaded the page and read the link.
- **Claimed:** page 1.0 "adds the version and date in the footer, richer head metadata, the update log, and the moved
  sources" over the gated page. **Wrong because:** it also carries fable's T-215 fixes 1 to 3, which a reader can see (slider
  range and step, the r steps, the gallery seed, a show-me that no longer throws). **Now:** stated here. **The tell:**
  brotbot stripped sites' layer from the page and the result was fable's T-215 page byte for byte.
- **Claimed:** the files "mirror the served paths", and sites' closure check (66/66) was taken as the repo being
  complete. **Wrong because:** the closure was measured against the site's docroot, not the repository.
  `brotoid_light/index.html` loads `../assets/sphere_setter.js` and `../assets/site.css`, which are not among the 39
  files, so from a clone the light page has no setter. Five icon and manifest links are missing too (cosmetic).
  `brotoid_light` also carries sites' edits (stylesheet and script paths changed, a DRAFT comment dropped) with no
  `<!-- sites -->` markers, unlike `/brotoid/`. **Now:** the README says the light page is not self-contained.
  **The tell:** brotbot ran the page from a clone.
- brotbot's gate of the pushed page (fb38332f) is done: 19 of 20, S17 (listed) failing on *hand*. The page said *hand*
  had no map entry while the map shipped beside it files it. fable's fix (map: 'hand') exists and is waiting for a restamp.

## 2026-10-27 · change · spec test added (`tests/`)

- **What:** `tests/spectest.mjs` (fable's test, 10-23), its helper `s11_words.mjs`, `SPEC.md` (fable's copy of 10-24, as written),
  `serve.mjs` (a static server for this repo) and `package.json`. Changed from fable's file: the playwright import is the
  package, and the page and map addresses come from `BASE` / `PAGE` (default `http://localhost:8190`). Nothing served
  changed, so the manifest and the stamp are unchanged.
- **Asked:** Doug Bristor ("yes, add the spec test now").
- **Checked by:** git ran it from this repository, served by `serve.mjs`: **28 of 29 targets pass, a plant caught in each.**
  The first run failed with a missing helper file (`s11_words.mjs`), which showed the test had a hidden dependency on the
  local folder. The second run, with the helper, completed. The one failing target is **S17 (listed)**: the page's §8 says *hand* has
  no map entry and is posed, while the map files it "filed · narrower". Sites' own run on the staged set gives the same
  result. The page is not changed by this commit. fable and sites were told.
- **Not checked:** the test was not run in Firefox or on a second machine. The test has no plant for itself.

## 2026-10-27 · change · repository created, first release (page 1.0) stamped

- **What:** the 39 files sites staged for bristorbrot.org/brotoid/ (page 1.0, 2026-10-27), at their served paths, with
  MANIFEST.sha256, a README, this file and an MIT licence. Manifest sha256 of the list: `faee6eb898b1…0502`.
- **Asked:** Doug Bristor: the brotoid is its own repository (online documentation with a few tools; the Brotoscope is
  the toolkit), and the page goes up on his go of 2026-10-27 with a git timestamp first. Staged and checked by sites;
  the page by fable; the flow figure by insights; the vocabulary map by brotdocs, published untrimmed at Doug's word.
- **Checked by:**
  - git: every file in the repository matches its line in the manifest (`sha256sum -c`), and the manifest is the one
    sites reported. A one-byte change to a copy makes that check fail (tested before commit).
  - git: all 39 files were scanned for local paths, local addresses and personal addresses. There are no personal
    addresses. There are 18 lines naming local working paths in comments and the vocabulary map, and one local link
    in a comment, left as they are for the reason in the README.
  - sites: closure 66/66, version check with four planted faults failing, stub probes with plants caught. Their
    spec test on the staged set reads 26 of 27 with S17 (listed) failing on *hand*; see the entry above.
  - brotbot: gate of 2026-10-24 on page 564da92a1120: every fail-if passed and every plant fired. The page in this
    commit (`fb38332f…`) is later: it adds the version and date in the footer, richer head metadata, the update log,
    and the moved sources. brotbot has not re-gated that page.
  - Not checked by git: the figures and the claims in them. I read the scan hits and the files sites made, not every
    line of the page.
- **Snapshot:** the vocabulary map is brotdocs' file as sites snapshotted it (sha `f3b0f13a…`, 2026-10-27).
  brotdocs asked that a public snapshot carry each entry's status and be diffed against the live map for the words the
  page uses (TC b1d7d2d587). That diff check does not exist yet.
