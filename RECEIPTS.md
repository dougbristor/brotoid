# Brotoid receipts

Till receipts: newest first, one per change a reader can see and one per correction. Each is short, and enough to
trace the change back to its commit.

- **change**: what changed, who asked for it, the check that proves it (and the planted fault that check catches), and
  the commit.
- **correction**: what was claimed before, what was wrong with it, and what made someone look.

## 2026-10-28 · change · release 1.2 (voice preload, site menu bar)

- **What:** page and light page move to **1.2**; the set grows from 49 to 50 files. Manifest sha256 of the list is in the commit's
  `MANIFEST.sha256`.
  - `lib/pageflow.js`: an opt-in `voice.preload` block (sites' patch). When a page asks for it, the voice engine loads once the page is
    idle so the voice button is ready; skipped on a data-saver or 2g link. Off for any page that does not pass it.
  - `brotoid/index.html`: asks for the preload, loads the menu bar, and offsets its two sticky parts by the bar. `brotoid_light/index.html`:
    loads the menu bar. `assets/topnav.js` (new): the site's one foldable menu bar, with its own CSS.
  - `brotoid/changes.md`: a 1.2 entry. The page's version strings (meta, JSON-LD, footer) read 1.2.
- **Asked:** Doug Bristor ("option 1, restamp 1.2 with the preload"; a top nav bar on all site pages), through sites.
- **Checked by:**
  - git: every file matches the manifest. I built this set myself from sites' staged tree plus the three version strings and the
    log entry, so **`brotoid/index.html` here is not byte-identical to the page sites tested** (`e906ca12`): the only difference is
    the version text 1.1 → 1.2. Sites uploads from this commit.
  - git: spec test run from this repository on this set: **29 of 29 pass, plants caught, no page errors.** The first run crashed:
    the test's neutral "first touch" click at (30,30) landed on the new menu bar's brand link and navigated the page away. The
    test's clicks now land at (5,60), below the bar (a change to fable's test, marked at the top of `tests/spectest.mjs`), and
    the second run passed. The test did not notice the bar covering the page; it only crashed.
  - sites: staged test of the preload (engine up after load with no press; press then ready in 0.6 s). The menu bar and
    `brotoid_light` are already uploaded live by sites. Not run by git: the preload on a real device or a slow link, the menu bar on a phone.
- **Not checked:** the voice engine, model and wasm are not in this repository and not in the manifest (host only, brotvoice for the code).

## 2026-10-28 · change · release 1.1 uploaded and verified live

- **What:** sites uploaded the 41 new or changed files of the stamped commit `e75668a` to bristorbrot.org (the ten
  self-containment files were already live and identical). No repository file changed.
- **Checked by:** sites. FTP read-back of the 41 uploaded files equals the local files (0 differ). The host hashed its
  own copies of all 49 files in one request, and 49 of 49 equal `MANIFEST.sha256` (0 missing, 0 differing).
  `/brotoid/changes.md` answers 200. Reported to git by sites on 2026-10-28; git did not fetch the live site (the shared
  web gate limits requests after a throttle).
- **Not checked:** Doug's retest of the mobile Chrome load bar sticking near 40% is still to come.

## 2026-10-28 · change · release 1.1 (restamp)

- **What:** the page, its update log and the light page move to **1.1 (2026-10-28)**; the set grows from 39 to 49 files.
  Manifest sha256 of the list: `b6ce0e24cc97…ed37`.
  - `brotoid/index.html`: fable's one-line §8 fix (*hand* now takes the map's standing, `map: 'hand'`), and sites' layer
    with the version, date and footer. `brotoid/changes.md`: a 1.1 entry.
  - `insights/brotoid_flow/index.html`: the sentence that linked to a local sketch page is removed.
  - `brotoid_light/index.html`: a marked sites layer in the head, and the setter loaded from `../lib/`.
  - Ten files added so a clone is complete: `assets/site.css`, three fonts, the favicons, the icons and `site.webmanifest`.
    The fonts are SIL OFL; see LICENSES.md. `tests/SPEC.md` is fable's copy with the 10-27 S17 amendment.
- **Asked:** Doug Bristor ("just go with it and do it, and we will update later if needed", via sites, 2026-10-28);
  the corrections of 2026-10-27 below.
- **Checked by:**
  - git: every file in the repository matches the manifest sites sent, and the manifest equals the staged tree. I had
    already copied an earlier list that sites changed minutes later; I reset and waited for sites to confirm this one.
  - sites: spec test 27/27 with plants caught and no page errors on this exact set; closure 76/76 (it now walks the
    light page, the stylesheet's fonts and the icons, with planted faults failing); version check with four planted
    faults failing; light-page and stub probes pass.
  - brotbot: delta re-gate 20/20 on the page one version string earlier (`ab902556`); the only change since is sites'
    version text. The re-gate also confirmed the *hand* fix and the removed link.
  - git, after the push: the spec test from this repository, served by `tests/serve.mjs`, on this set: **29 of 29 targets
    pass, plants caught, no page errors, none skipped.** Not checked by git: I did not read the whole page.
- **Open:** `assets/site.css` pins the whole site's stylesheet at this version. The README no longer lists the S17 failure
  or the light-page limit: both are fixed in this set.

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
