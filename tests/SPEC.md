# proto_brotoid: goal-target spec

fable, 2026-10-19. Doug: "fable/proto_explorer_tour/ seems amazing, really well guided … I feel this level of flow could feed back
into the method written for brotoid. A clean rewrite might be better than just updating." Doug picked **BROT as the whole**, and asked
for the spec first.

- **Status:** live at `/fable/brotoid/`. brotbot's re-gate 6 (10-24, 564da92a1120, |q| = 1): every fail-if S1–S20 passes (receipt `aicolab/tmp/brotbot_gate/proto_brotoid_gate_20261024.md`). Its findings 1–3 were fixed 10-24 (T-215): the r steps the ÷0.9 pass missed, the slider range and grid (min 0.056, max 1.778, step 0.001, so 0.667 sits on it), the gallery seed's URL (it opened at a name, lon NaN; it now passes &mag), and the uncaught throw on every gallery open. Probe `aicolab/tmp/proto_brotoid/t215.mjs`: 3/3 fail on `index_pre_t215_20261024.html`, 3/3 pass after. Finding 4 (the setter's framing in absolute units) is insights'.
  Was: spectest 10/12 on 10-19, while S5 waited on brot_readings and S12 on links back.
  Change at build: §6 has its own brotoid figure (Fig 4) instead of embedding the tour's first view. An embedded explorer would be a second
  live heavy frame on the page, and the brotoid at the panel's own q keeps the whole in one state. brotbot tests the built page against this spec, and that test is the gate for shipping
  (feedback 07-18).
- **Name:** proto_brotoid while it is being built. The current page stays live at `/fable/brotoid/`. That URL goes to the new page only
  once it has passed the gate.
- **Sites:** the page goes to sites only after a recut with current words, and its checks go with it.

---

## What the page is for

A reader who has never heard of BROT picks one Bristorian number q. They see four answers about it at once: **B**ristor, **R**otation,
**O**rder, **T**orsion. They take each answer in turn, in its place among the four. They finish knowing which half of BROT the fractal
can show (B, and R without the mirror) and which half only this instrument shows (O, T, and the mirror).

**The reader should leave able to:**
1. say what each letter asks, and what ℂ answers to the same question;
2. set q themselves and predict which readings will change;
3. find, on the figure, where the hand flips (the crossing);
4. say why z ← z² + c cannot see O, T or the mirror.

---

## Order (Doug's pattern from the tour: start from the whole, then each part and how it fits)

| § | Heading (working) | Lit on Fig 1 |
|---|---|---|
| 0 | Four words for one number (under the title "BROT: one number, four readings"). A short flow: roll q and watch all four change together | all four |
| 1 | B: what squaring does to a small ball round q (stretch; the squared ball at a glance) | B |
| 2 | R: how far it turns, and whether it turns to its mirror (the hand χ, the crossing cone) | R |
| 3 | O: does q·v equal v·q? | O |
| 4 | T: does it matter where the brackets go? | T |
| 5 | What the fractal cannot see: the square sees B and R without the mirror; O, T and the mirror are missing | B, R lit; O, T and the mirror struck through |
| 6 | B up close: the brotoid. Its own live figure (Fig 4: the brotoid at the panel's q, r, the moments from the atoms); links to the tour for the full walk; no copied text | B |
| 7 | Explore: the tour, insights' explorer, caro's instrument | none |
| 8 | Words caught | none |
| 9 | What it is not, and How we checked (the checks run live) | none |
| 10 | Figures | none |

---

## Targets

Each target says how it fails. A target that cannot fail is not a target.

**S1. The whole first, and in view.** Fig 1 is the BROT panel. It has the q setter (a sphere coloured by hand) and four live readings,
B R O T, one cell each, all computed for the same q. On a wide screen it sits in a sticky column; on a narrow one, a sticky band. When
a beat or section is about one letter, that cell lights and the others dim, so a letter is always seen next to the other three.
*Fails if:* a section about a letter scrolls Fig 1 out of view; the wrong cell (or no cell) is lit; any two cells show different q.

**S2. Every letter has a picture, not only a number** (an image conveys its state).
- B: the squared ball, with its longest axis l and its shortest w marked, so B = l/w is drawn (Doug 10-22: "we're not really showing the
  length/width").
- R: the turned frame, with its mirror shown as a flipped frame.
- O: q·v against v·q over the directions v, drawn as a map or as arrow pairs.
- T: the two bracketings of the witness triple, as two arrows and the gap between them.

Every cell carries its ℂ answer next to it (1, angle of q, 0, 0). *Fails if:* a cell has a number and no figure; a figure does not move
when q moves; the ℂ answer is missing.
*Amended 10-22 (Doug).* The panel's hand line ends "BROT reads q alone, not r" (Doug: "does r change those values"); its title says
why (a vanishingly small ball round q; r sizes only the brotoid). It costs the panel no height, so Fig 2 keeps its size. *Fails if* (S2·lw): l or w is not the ellipsoid's longest or shortest axis (the extremes of |J u|, sampled apart
from the page's SVD), l/w is not the B shown, or the hand line doesn't say it. The plant draws w on the middle axis.
*O and T pictures: posed.* The current page gives O and T as numbers only.

**S3. Doug's order** as in the table above. Each part comes after the whole, and the fractal section comes after all four letters.
*Fails if:* the headings are out of this order, or a letter is explained before §0 has shown all four.

**S4. No contradiction on screen.** When text names a reading, a hand, a moment or a colour, Fig 1 is showing that same state: the
same q, and the lit cell agreeing in value and in hand. The "cannot see" marks in §5 strike exactly O, T and R's mirror half.
*Fails if:* a caption's number differs from the cell's live number; a "mirrors" caption sits over a keep-hand q; §5 strikes B.

**S5. Numbers come from the atoms.** B, R, O and T come from bristor_product and bristor_square_jacobian. The crossing and the moments
come from brotoid_weft and brotoid_moments. Nothing is typed into the text: the values in the prose are filled in at load.
- If a reading needs code the atoms lack (polar split, commutator max, the associator witness), it becomes an atom first, planted by
  insights, with a conform test. Working name: brot_readings.
- *Fails if:* a number in the prose is a literal in the HTML; a reading has a code path that is not an atom.

**S6. Checks with plants.**
- §9 recomputes each reading by a second path: its own product, its own minimum search.
- Each check has a planted fault that it must catch, or it says plainly that it has none.
- These carry over from the current page: the size range 0.58–1.49 (with 1/√3 to six places); det J odd (det J(−q) = −det J(q));
  the seam/fold factor 4(y − z)(y + z)²; the thin example's stretch ratio, 141.21, matched against caro's.
- Every number the page shows has a second path, the moments included (brotbot g21: ① moved +0.01 went unseen): ① is the ball's distance
  to the crossing cone by the page's own det J, and ③ is |q|.
- *Fails if:* a check passes with its plant in, or a check shows no plant status.

**S7. Words caught,** the tour's method.
- Every term is marked where it is first used. The mark is a link (bold, dotted) that runs its show-me on Fig 1. It is coloured only where the term has a colour on a figure (keep cyan, mirror orange, crossing pink, weft gold); otherwise it is in the body colour, so colour keeps meaning something (brotbot g21: 31 of 46 marks are body-coloured, by design).
- Each term's "where" names its figure through the figure registry, never by a typed Fig N.
- Each term is listed in §8 with its rule, where it shows, and its standing from `docscmd --term`: canon, standard, notation, posed,
  clash, or two names / two senses.
- Clashes are gathered at the top of §8.
- Known at spec time:
  - hand = canon χ = sign det J (keep +1, mirror −1);
  - **crossing** (in the ball's space: the ball meeting det J = 0) against **caustic** (its image on the brotoid). Every use says which
    side (insights, node 6390009dea);
  - torsion here is the name's reading, not a geometric torsion tensor;
  - fold is the i − j plane, not the caustic's fold;
  - brotoid and moment are Doug's posed words.
- *Fails if:* a term is used before it is marked; a term is missing from §8; crossing or caustic is used with no side given.

**S8. Rank is said.** Every figure states its rank. The brotoid is B2 (1, i, j). B3 is offered only where it means something, and
the rank is visible whenever it changes. The readings name the n they are computed at. *Fails if:* a figure shows B3 output under a
B2 label, or the label is missing.

**S9. The reader drives, and the page follows.**
- The beat track uses the page's own controls, as a reader could: q setter, r, show-me.
- Any reader input pauses the track, and the page stays where the reader left it.
- A show-me drives the figure to its state and leaves it there, with send-back to return.
- *Fails if:* the track moves a control while paused; input during a show-me is overwritten.

**S10. Figures carry Fig N, a ref hook and their state.**
- Every live figure has a state chip (q, r, rank, lit part) and a ⧉ ref link.
- The figure list sits at the end.
- Print is ink-light: canvases are redrawn on white, controls are hidden, and the figure list is printed.
- The page fits 390 px with no sideways scroll, and also works at mid widths (1040–1200).
- *Fails if:* a canvas or a figure's background, including one set at run time (the gallery box), prints as a dark block (over 15% dark pixels);
  a control prints; the page scrolls sideways at 390; a figure is missing from the list.

**S11. Current knowledge only.** The page has no word that brotdocs' notation_vocabulary_map retires (read from the map each run, never a hand-written
list: proto_dictionary D6, 10-21; today bristoroid, tear, rip, join cone, Jacobian fold). A retired sense of a current word (crease's det J = 0 line,
join's B2 locus) is not a word ban. Crease is current (Doug 10-21). The page has no
order-of-discovery prose, except where history is the point (the June reading of BROT). Nothing from the past is listed, not even as
"excluded". *Fails if:* the reader's text, notes or title attributes contain any word the map retires. The plant must catch all of them. Exempt (brotbot gate,
10-19): the shared glyph guide, lib/proto_symguide.js, whose "join" is canon's current sense (touching: contact within tolerance).

**S12. Links held, not shown (Doug 10-20, via sites; was "links both ways", 10-19).** The three outbound links (the tour, insights'
explorer, caro's instrument: none live on the host) sit in the page's source inside HTML comments, unrendered, until they can link to
descriptions of the brotoscope's function mode. Fig 2's brotoid_flow and S16's crease_cone.js are not links: they ship with the page. *Fails if:*
any of the three is rendered as a link, or any is missing from the source's comments (so it can come back).

---

**S13. The reverse box (Doug 10-20).** §7 takes four readings and a hand and returns every direction of q that has them, each with
a "go" that sets the panel there. It says that |q| does not come back, and that without T the fold mirror (the reversal automorphism,
math.chirality_lock) comes back too. A §9 check runs it from the conch, the thin one, (83°, 5°) and 6 random q, typed as "from the panel" fills the box (the
reader's digits, not exact readings: brotbot g21), with a plant (the search without its Chebyshev polish, which misses). *Fails if:* the box misses the q its readings came from, returns a direction whose readings differ from the ones typed, or,
with T left out, does not return the mirror twin.

---

**S14. The model sits with the settings (Doug 10-20, recut).** Fig 2 is insights' brotoid_flow, live, as the crease explorer shows it
(its embed mode, its S driven each frame): in the sticky column, under the BROT panel, so the settings (q), the four readings and the model are in
view together, top to bottom. It is at the panel's q and the page's r (one r: its slider and Fig 4's). Nothing of it is in the text. A touch on it
pauses the track. In the narrow band it is not shown (§6's Fig 4 is the brotoid there). Replaces the travelling overlay and the splat build
(same day: Doug preferred the explorer's view and placement). *Fails if:* there is more than one brotoid frame, any of it is in the text, it is
not wholly in the window both at the top and at §6, its q or r differs from the page's after the panel moves, or a touch on it leaves the track playing.
*Cost:* on Intel and NVIDIA Firefox the page keeps 60 fps and its 30 ms timers with Fig 2 live (aicolab/tmp/proto_brotoid/probe_rate_ff.mjs, 10-20). Headless
Chromium draws it in software and starves the page (1.3 s per tick), so the spectest opens every page with ?model=0 (Fig 2 unloaded) except S14's own.

**S15. The ending: a summary, then the gallery (Doug 10-20).** §6 ends with "So what makes a brotoid?": BROT in one sentence, then
the brotoid's three properties (its shape depends on q; it has a hand; it changes hand along a whole cone) and its moments. The track's last beat says
them, then opens Fig 6, the gallery, full window: a large live seed (brotoid_flow, its own frame, only while open; Fig 2 held meanwhile) visits the
seven named q's of Fig 1, then a sweep of the sphere (Fibonacci, 30 less those near a named one). At each it casts off a still that flies out from the
seed to its place, shrinking as it goes. The place is q's direction in the seed's own frame, so turning the seed turns the gallery. The beat names
each named still as it is cast. ✕ or Esc closes; the stills stay in the figure; the page's q never moves. *Fails if:* a still's place is not its
q (to 1 px), a still arrives no smaller than it left, the cast skips or reorders the named q's, closing leaves the seed frame or Fig 2 held, or
the page's q differs after the gallery from before it.

**S16. The q setter, in its own frame beside the model (Doug 10-20; own frame 10-21).** Doug: "TL the q settings controller … the q ball with cone ray and instead of
pin r, we will use the r ball … I really like the view where the sphere cuts the cone and that links to wefts"; then "TL PIP q sphere on the cone
ball". In the top left of Fig 2 sits a picture-in-picture: insights' cone-ball view (insights/web/crease_what/crease_cone.js coneView, loaded live,
not copied), at the page's q and r. It shows the space before squaring: the crossing cone (det J = 0), the ball |x − q| ≤ r, the crossing loop (pink) where
the ball meets the cone, and G, gold where the ball has swallowed it (the weft). The q sphere (lib/sphere_setter.js) sits on its corner and
rolls q. The ball is the r indicator, so the pin does not carry r. The wheel over the PIP sets r. The q sphere is the panel's own setter, moved:
while Fig 2 shows, it lives in the PIP; in the narrow band (Fig 2 not shown) it is back in the panel. One q and one r: the panel, the PIP and
Fig 2 agree. Drag on the PIP's cone view turns it. The PIP is not printed. *Fails if:* the PIP's r is not the page's r in q's units (r / |q|
passed as r is the named risk: brotoid_flow calls that fraction r_frac, "size" until 10-21); the PIP's q differs from the panel's; a roll of the q sphere or a
wheel over the PIP does not move the panel; a line of the cone is not det J = 0 when det J is taken from the product atom by finite differences
(a second channel, not the weft atom's own detJ); the PIP leaves the stage or covers Fig 2's r bar; or there is not exactly one q sphere,
visible, in each layout.
**Own frame (Doug 10-21: "I think there's too much overlap. I think the setter needs its own frame rather than be PIP frame").** The setter is
no longer over the model. Fig 2 holds two frames: the setter (cone view, q sphere on its corner) and the model (brotoid_flow, its r bar). They
sit side by side while Fig 2 is wider than tall (1366×768: setter 220×236, model 274×236) and stacked, setter above, once it is taller
(1920×1000: 500×178 over 500×284), by a container query on Fig 2. The q sphere is sized from the setter's own box. *Fails if:* the setter's
frame and the model's share a pixel, the setter leaves Fig 2, it is under 120×100, or the layout is not beside at 1366×768 and above at
1920×1000 (target S16·frame; plant: the old PIP over the model's top left).

**S17. Words from the map (Doug 10-22: "I take it that the terms are loaded so updates of terms feed in to existing pages").** The page
keeps its own list of words, each with its rule, where it shows, and its show-me, written for this page's reader. A listed word that
brotdocs' notation_vocabulary_map files is marked so (`map:`), and its standing is read from the map at each load: filed or posed (the
label's status), then the map's label (coined, standard, false friend …). If the map can't be read, the typed standing stands and §8 says
so. The brim and the rim, which the setter shows, are listed, and the page says rim where it said crossing loop.
*Fails if* (S17·live): a listed map word shows a standing other than the map's, or, with the map unreachable, §8 doesn't say so (plant:
the map blocked). *Fails if* (S17·listed): a word the map files appears where a reader sees it and is not in §8, or a listed word the map
files neither takes the map's standing nor declares its own senses (plant: brim dropped from the list).
*Amended 10-22 (sites: the map 404s at bristorbrot.org; Doug: "reword it").* §8 no longer says the map is "read each time this page
loads", which would be untrue wherever the map isn't served; it says the standing is read as the page loads wherever the map is served, and
otherwise is the one filed with the page. The text stays true at both origins, with or without a published copy of the map; S17·live's
checks are unchanged.

**S18. The eye of the brim, squared, on the brotoid (Doug 10-22: "show the pink plate", proto_brim Fig 1's eye strip).** Fig 5 fills the
eye (the part of the brim inside the ball) after squaring, pink where the brim's top faces you and violet where its underside does, from
the shared eye block (candidate `brim_eye/v1.js`, lifted from proto_brim, whose checks 8 and 9 hold it). *Fails if:* a quad's corner is
off the brim or outside the ball before squaring, its drawn point is not that corner squared less q², or the quads miss a pair of
neighbouring lines the ball reaches (counted apart from the block), at 5 q and 3 r past ①; or the eye shows before ① (plant: the eye of
the ball at r + 0.05).

**S18·rim (Doug 10-22: "pink band on sphere looks wrong").** Fig 3's pink line on the ball is the rim: where the ball's sphere meets the
brim, built from each cone line's span. Until 10-22 it drew the weft's ball points (`crossing().runs`, renamed under it on 10-18), which run
off the keep/mirror border. *Fails if:* a point of the line is off the sphere |x − q| = r or off the brim (det J by finite differences), at
5 q and 3 r past ① (plant: the old weft runs).

**S19. q's size is the page's unit, and the page holds it at 1 (Doug 10-22: "keep 0.9, apply the q wording and add r/|q|"; 10-23,
after reading proto_qunit: "yes lets move to |q| = 1.0").** Squaring scales (sq(t·x) = t²·sq(x), det J(t·x) = t³·det J(x), checked on
2000 points), so the brotoid's shape depends on r/|q| alone and |q| is a unit. The page holds |q| at 1: every r it sets (the default, the
slider's range and grid, the clamp, every step: moment buttons, show-mes, the track's beats, the setter's wheel) is the 0.9-era value divided by 0.9, so every picture keeps its shape. With |q| = 1, r is r/|q|: both
r readouts (under Fig 4 and Fig 2) say so, and the conch is q = i (q² = −1). §8's q entry says what q is (the ball's centre) and that the
page *holds* |q| at 1; the r entry says r is r/|q| here. Fig 2's setter (insights' cone view) must read q at the page's |q|, not its own.
*Fails if:* the page's q is not of size 1; or at 3 r, a readout doesn't show r as r/|q| with |q| = 1 (plant: the 0.9-era readout); or
the q entry doesn't say the page holds |q| at 1 and only r against |q| changes the shape, or the r entry doesn't say r is r/|q|, or the
conch still reads 0.9i (plant: the 0.9-era q rule).

**S20. The page rests when nobody is there (Doug 10-23: "auto sleep and be flow still after an idle time out ... reanimate when the page
has viewer activity"; his picks: 60 s, chip + badge).** fable/web/lib/rest.js. After 60 s with no input from the reader, every animation
loop on the page and in its same-origin frames (Fig 2's brotoid_flow, the gallery's seed) holds its next frame: each picture keeps its last
frame and the GPU does nothing. The live figures' chips read "resting · move to wake" in place of "live", and each live figure carries a
small badge saying the same. Any input from the reader wakes it at once, and each loop goes on from where it stopped. While the track or a
show-me plays, or the gallery is casting, it stays awake. ?rest=N sets the seconds and ?rest=0 turns it off. Under automation (navigator.webdriver)
it is off unless ?rest is given, so a long test never falls asleep halfway.
*Fails if:* at ?rest=2, 3.5 s after the last input, a rAF counter on the page or in a same-origin frame still advances, or there is no
badge, or Fig 1's chip doesn't say resting (plant: the frame's counter still advancing); or an event the page dispatches itself wakes it;
or a real mouse move doesn't restart both counters and bring 'live' back; or it rests while the track plays; or it doesn't rest 3.5 s
after the track is paused; or ?rest=0 doesn't turn it off.

## Carried in, moved out, dropped

**Carried in (recut):**
- the BROT acronym block and the "a reading, not a derivation" note;
- the four questions, each with its ℂ answer;
- What the fractal cannot see;
- the three B2 facts (direction matters; it crosses along a cone; it has a hand), each with a show-me;
- the hand map, with its plot ⇄ cone toggle;
- What it is not;
- How we checked.

**Moved to the tour (linked, not copied):** the moments ①②③④, the weft and umbrellas, and the ball in the cone. §6 keeps one view of
the brotoid and the three facts, then hands over.

**New:**
- the O and T pictures;
- cross/self weft colouring and ④, in §6's view (T-175);
- brotbot's two open fixes (the chips: "one of many"; the ambient hold after pause('reader')), built in from the start.

**Dropped:** the "slot for the instrument (caro, in progress)" placeholder. §7 links what exists.

---

## Process

1. Doug reads this spec. The O and T pictures are posed and wait for his eye.
2. If S5 needs an atom, relay insights to plant brot_readings.
3. Build `fable/web/proto_brotoid/index.html`, together with its test, `aicolab/tmp/proto_brotoid/spectest.mjs`. The test checks S1–S16
   and plants a fault for each target.
4. brotbot tests the live page against this spec. That is the gate.
5. Swap: `/fable/brotoid/` serves the new page, and the old one is kept as `index_pre_rewrite_<date>.html`.
6. Recut for sites, and relay sites.
