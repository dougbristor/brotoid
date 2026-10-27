# Brotoid receipts

Till receipts: newest first, one per change a reader can see and one per correction. Each is short, and enough to
trace the change back to its commit.

- **change**: what changed, who asked for it, the check that proves it (and the planted fault that check catches), and
  the commit.
- **correction**: what was claimed before, what was wrong with it, and what made someone look.

## 2026-10-27 · change · spec test added (`tests/`)

- **What:** `tests/spectest.mjs` (fable's test, 10-23), its helper `s11_words.mjs`, `SPEC.md` (fable's copy of 10-24, as written),
  `serve.mjs` (a static server for this repo) and `package.json`. Changed from fable's file: the playwright import is the
  package, and the page and map addresses come from `BASE` / `PAGE` (default `http://localhost:8190`). Nothing served
  changed, so the manifest and the stamp are unchanged.
- **Asked:** Doug Bristor ("yes, add the spec test now").
- **Checked by:** git ran it from this repository, served by `serve.mjs`: **28 of 29 targets pass, a plant caught in each.**
  The first run failed with a missing helper file (`s11_words.mjs`), which showed the test had a hidden dependency on the
  local folder. The second run, with the helper, completed. The one failing target is **S17 (listed)**: *hand* is
  seen by a reader, filed as posed in the map, and not declared in §8. Sites' own run on the staged set gives the same
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
