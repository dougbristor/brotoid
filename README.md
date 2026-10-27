# Brotoid

**Online documentation of the brotoid and its cousin the chirobrot, with a few live tools that show what they are.**

**Website: [bristorbrot.org/brotoid](https://bristorbrot.org/brotoid/)** · The toolkit for investigating them:
[dougbristor/brotoscope](https://github.com/dougbristor/brotoscope) · Algebra blocks:
[dougbristor/bristorbrot](https://github.com/dougbristor/bristorbrot)

## What this is

The brotoid page reads one Bristorian number *q* four ways at once: B (Bristor), R (Rotation), O (Order),
T (Torsion). The fractal can show only B and the unmirrored half of R. The page is a finding with figures you can
move, not a product: each claim in its checks section is recomputed live by a second path, and each check runs a
deliberately wrong version (a plant) that must fail.

This repository is the findings. The Brotoscope is the main product: a whole toolkit, with plugins, for
investigating the brot. The two are separate on purpose.

The **chirobrot** is the cousin: the escape-time set of z³ + C under either bracket, (zz)z or z(zz), and the melt
between them. It was the first brot with a hand. Its entry is in the vocabulary map below, marked *posed*. It has no
page of its own in this release.

## What is in it

The repository mirrors the served paths of bristorbrot.org, so the files you read here are the files the site serves,
byte for byte.

- `brotoid/`: the page (`index.html`), its eye (`brim_eye/v1.js`) and the update log (`changes.md`).
- `brotoid_light/`: the light page.
- `lib/`: the page's shared libraries (the glyph grammar, pageflow, panes, the rest rule, the sphere setter).
- `codetree/blocks/`: the algebra and figure atoms the page imports, as built copies. Edit them at their source, not here.
- `insights/brotoid_flow/` and `insights/crease_what/`: the flow figure and the crease cone it uses.
- `fable/`: a redirect stub from the old page address, and the two library files the flow figure loads from there.
- `brotdocs/docs/notation_vocabulary_map.md`: a dated snapshot of the vocabulary map the page reads, **untrimmed**.
  Every word carries its status (posed, settled or weighed). A posed word is a proposal, not canon.
- `tests/`: the page's spec test (`spectest.mjs`), the spec it checks against, and a small static server. They are not served, and are not in the manifest.

[`MANIFEST.sha256`](MANIFEST.sha256) lists every served file with its sha256. A commit holding it is the record that
these exact bytes existed before they went live. Check a checkout with `sha256sum -c MANIFEST.sha256`.

## What is not in it

- **The voice.** The page can read its captions aloud, off by default. The voice engine and model are not here. They
  are [dougbristor/brotvoice](https://github.com/dougbristor/brotvoice) (GPLv3, code only) and a model on the site
  under non-commercial terms. `lib/proto_voice.js` is the MIT glue; the page works without the voice.
- **A chirobrot page**, and insights' and caro's other brot pages. They stay with their owners until they say yes.

## Honest limits

- **The bytes are not edited for tidiness.** The hash is the stamp, so some comments still name local working paths
  (`aicolab/tmp/...`) and one example link to a local address. They mean nothing outside the project. A change to a
  served file is a new commit with a new manifest.
- **The page's figures are measurements and readings, not proofs.** Claims carry their status in the page.
- **One spec target fails in this release.** S17 (listed): the word *hand* is shown but not declared in the page's §8, while
  the map files it as posed. The spec test is how we know; see [tests/README.md](tests/README.md). The page is unchanged
  until its owner fixes it, and the fix is a new commit.
- **The vocabulary snapshot is a snapshot.** The live map moves. The snapshot is dated in RECEIPTS.md.

## Current first, history second

The README describes what is here now. [RECEIPTS.md](RECEIPTS.md) records every change and every correction, newest
first, with what proved it. [brotoid/changes.md](brotoid/changes.md) is the page's own update log.

## Licence

Code and text are [MIT](LICENSE). Copyright (c) 2026 Doug Bristor. Made in the Bristorbrot project by Doug Bristor with
caro, insights, fable and brotdocs; the site's team staged and checked the release.
