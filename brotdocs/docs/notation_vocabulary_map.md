# The Vocabulary Map

Most of this project's load-bearing words are already taken by mainstream mathematics —
and several mean something *different* there. A reader who looks one up gets sent
somewhere wrong; a reader who doesn't is left guessing. This file is the map between our
usage and the standard one, term by term, so a writer knows whether a word needs a
warning and a reader knows whether looking it up will help or hurt.

**This is a map, not a rename plan.** Several of these names are load-bearing across
dozens of docs — collisions are stated, not resolved by renaming. It also enforces
**naming** consistency, not **conceptual** consistency: two agents (or two sessions of the
same agent) can use a term identically and still mean different things by it. The map
narrows that failure surface; it does not close it.

**Companion doc:** `notation.worked_instances` — a computed, minimal example for each term
below (plus one for the split-pair identity rule that motivates all of them), where this
file gives the map and that one gives the terrain.

**Sibling doc, disjoint scope:** `ecosystem.board_vocabulary` — the same motivation
(don't let load-bearing words drift silently) applied to the objective/ticket board's own
process vocabulary instead of math. Deliberately kept separate — this file's entries all
carry a *mathematical* false-friend risk; that one's don't, and mixing the two would
dilute what makes this map useful.

**Pilot, five terms** (Orac/insights, 2026-08-10): `lattice`, `field`, `gauge`, `support`,
`skeleton` — chosen because all five are load-bearing and suspected false friends, and
**`seam`/`gap` added 2026-08-30** (Doug's distinction, via Orac) — not from the blind-reader
backlog below, but because both words were already drifting under independent, unmerged
uses and `docscmd --term` returned nothing for either. **`phase`/`polarisation` added
2026-09-05** from the same day's glossary sweep (`notation.glossary`'s new "Review &
dynamics vocabulary" section holds the rest of that sweep's terms — most don't carry an
external false-friend risk and so belong there, not here). **`relabelling vs. opposite
algebra` added 2026-09-05**, same day, from a live cross-agent incident rather than the
glossary sweep — the rare case where no measurement at all resolves the false friend, only
a proof.
`lattice` already had two independent misreads on record before this file existed. Prompted
by a blind-reader test (isolated agent, static pack, no source) that could not interpret 26
items in one shipped explainer, cross-checked against `notation.glossary` (42 entries,
0 mentions of `gauge` or `kernel`) and fable's player glossary (15 terms, defines `corank`
but not `Bristorbrot` itself). Full thirty-five-term backlog is scoped, not yet built —
see "Remaining scope" below.

## Labels

| label | meaning | what a writer must do |
|---|---|---|
| **STANDARD** | we use it exactly as mathematics does | nothing — link out freely |
| **NARROWER** | standard term, we use a restricted case | state the restriction once |
| **FALSE FRIEND** | the standard meaning is *different*; looking it up misleads | must carry an explicit "not the X you may know" |
| **OVERLOADED** | several standard meanings; ours is one of them (or adjacent to one) | name which one |
| **COINED** | ours; no external meaning | must be defined on first use, always |

**Addendum, 2026-10-21 (Doug, filed by brotdocs): `history` is for settled words only.** A
`history` line records a sense that was established and absorbed and then had to move,
because how the thing looked and how it is turned out to differ (`crease`; ~~`tear` → `weft`~~,
struck 2026-10-22: `tear` was weighed, see the next addendum).
Names tried while a word was still being found are blue-sky thinking. List them under
**weighed**, not `history`, and never call them retired. Doug: *"if bandline gets replaced then
they were only ever bluesky thinking … here bandline was thought of before rim came to fit
better."* Example: `rim`, where bandline is weighed.

**Addendum, 2026-10-22 (Doug, filed by brotdocs): `tear` was weighed, not history. A weighed
field keeps its own story, loosely.**
- **The example above was half wrong.** It first read "(`crease`; `tear` → `weft`)". Doug,
  2026-10-21, late: *"Rip -> tear -> weft within 24hrs"*, then *"rip and tear sit in the
  discarded name pile, they didn't last long"* (via fable `to-brotdocs-msg-20261021T221126Z-7khq`,
  `…221249Z-eaik`). The thing never moved; only its name was being found. **`crease` is the
  history example:** there the sense moved, because it was seen on the crossing and computed
  off it.
- **What a weighed field is for.** Doug, 2026-10-22: *"the moment was first visualised as a
  rip|tear but weft emerged to be a better choice. So the word|term dump carries own history
  but its very loose. archaeological remains rather than the tight bean counting that
  established termquake might carry."* So:
  - `history` is the tight record: numbered, dated senses, who, and why the sense moved.
  - `weighed` holds the remains: the names tried, roughly when, and what each one pictured.
    It has no numbering and no retired/current status. Don't audit its dates to the hour.
- **Shape**, so fable's dictionary parses it: the field opens with the main weighed word in
  quotes, then an optional `Also weighed …: a, b (note), c.` list. Any quotes after that are
  citations (fable, `…220819Z-lo5w`).
- **Weighed words stay off reader pages as current names**, as retired words do. They can still
  be looked up. This is fable's proposal for the S11 word checks (`…7khq`); brotdocs agreed,
  2026-10-22.

**Addendum, 2026-10-22, later (Doug, filed by brotdocs): a `termquake` is the moment a new
word describes the moment better, and the words around it jostle and settle.** Doug also writes
it *wordquake*. COINED, but it is a word about words, not about the maths, so it lives here
under Labels and not as an entry of its own (`docscmd --term` covers only maths words; use
`docscmd -s termquake`).
- **Doug, 2026-10-22:** *"[term|word]quake is the moment where a new word describes the moment
  better. and then all the terms jostle and settle down. the finding of weft is an example.
  seam and fold also settled there words. I think i see terms as applications|devices and like
  in code the meaning that is held in the proto-word|proton develops with focus|attention|pressure."*
- **The two examples, as the entries record them:**
  - **weft, 2026-10-19.** `weft` arrived, and the neighbours moved with it: the pre-tear
    became the pre-weft (`crease`, history line 3), `moment`, `crossing` and `umbrella` were
    told to read tear as weft, and the atom rename was redirected to `brotoid_weft`.
  - **seam and fold, 2026-10-10/11** (TC `42673d58b6`). Doug had been using the names swapped.
    `fold` arrived for −45°, `seam` was pinned to +45°, and `spread` was moved back from a name
    to a description. Three words settled at once.
- **How it meets the two fields** (brotdocs' reading of Doug's two 10-22 quotes, MEDIUM): a
  quake that moves an *established* word leaves `history`, the tight record ("the tight bean
  counting that established termquake might carry"). A quake while a word is *still being
  found* leaves `weighed`, the loose remains. One quake can leave both: weft's left a weighed
  trail on weft and a history line on crease.

## lattice

- **ours** — a finite set of closed 2-planes in `𝔹ⁿ`, in exact bijection with the non-empty
  subsets of the generators, graded by subset inclusion (`math.bristorian_mandelbrot_lattice`).
- **label** — FALSE FRIEND
- **standard** — two common meanings, both real: (a) *geometry/number theory* — a discrete
  periodic subgroup of `ℝⁿ` (a periodic point grid, e.g. crystallography or `ℤⁿ`); (b) *order
  theory* — a partially ordered set in which every pair of elements has a unique join and meet.
- **trap** — a reader's first association is almost always (a), the periodic grid, which is
  completely wrong for what we mean — there is no periodicity, no spatial repetition, nothing
  ℤⁿ-like about it. Our usage is much nearer (b): the non-empty-subset structure ordered by
  inclusion genuinely is a lattice in the order-theoretic sense (meet = intersection, join =
  union of generator subsets) — but the doc never states this, so even a reader who avoids trap
  (a) has to guess that we mean (b). **Measured, not hypothetical:** Doug independently produced
  the periodic-grid misreading unprompted; it is also the #1 misread in fable's sealed claim
  about the same doc.
- **authority** — `math.bristorian_mandelbrot_lattice`

## field

- **ours** — a continuous scalar quantity defined over a continuum of directions or points
  (e.g. "the closure defect `D(u)` is a field on the sphere of imaginary directions — a field,
  not a bit").
- **label** — FALSE FRIEND
- **standard** — *abstract algebra*: a commutative ring in which every nonzero element has a
  multiplicative inverse (`ℝ`, `ℂ`, `ℚ` are fields).
- **trap** — this is the physics sense of "field" (a value assigned to every point in space —
  temperature field, vector field), used inside an *algebra* explainer, where "field" already
  has a different, load-bearing, and directly *contradictory* meaning: this project's docs
  spend real effort proving Bristorian is **not** a field in the algebraic sense (no global
  norm, genuine zero divisors, division fails). A reader who knows the algebraic sense and
  encounters "a field, not a bit" is being told the opposite of what the sentence means.
  Flagged directly by the blind reviewer as metaphorical-not-technical.
- **worth checking:** the closure defect `D(u) = |u² − proj u²|` is, precisely, an
  *obstruction* in the standard sense (a measure of distance from a property, whose vanishing
  locus is where the property holds) — that is a real term with real literature and may be
  what "a field, not a bit" is actually reaching for. Not adopted here; flagged for a future
  pass to check whether it buys more than it costs.
- **authority** — `math.bristorian_mandelbrot_lattice` ("Two consequences worth keeping")

## gauge

- **ours** — the `{±1}ⁿ` sign-relabelling freedom `e_a → ε_a·e_a` acting on a Bristorian-
  skeleton sign matrix (`s'_ab = ε_a·s_ab`, flips a whole row), quotienting presentations into
  equivalence classes — `2^(n(n−2))` classes from `2^(n(n−1))` presentations.
  (`math.bristorian_mandelbrot_lattice`, "The gauge group — stated once".)
- **label** — OVERLOADED
- **standard** — *physics / gauge theory*: a redundancy in the mathematical description of a
  system (a choice of representation, e.g. a connection on a fibre bundle) that doesn't affect
  physically measurable quantities; "gauge group" is the group of transformations relating
  equivalent descriptions.
- **relation** — not a false friend: this is a genuine instance of the same general concept
  (redundant parametrization, quotient by an equivalence-inducing group) applied to a much
  simpler discrete/combinatorial setting than continuous field theory. A reader arriving from
  physics gauge theory will recognize the *shape* of the idea correctly and just needs to
  recalibrate scale and context, not discard the association.
- **authority** — `math.bristorian_mandelbrot_lattice`

## support

- **ours** — the subset `S` of generators with nonzero coefficient in `u = Σ_m c_m e_{a_m}` —
  which generators are active.
- **label** — STANDARD
- **standard** — the set of points/indices where a function or vector is nonzero. Same
  definition, no restriction, no divergence.
- **relation** — no trap. Link out freely.
- **authority** — `math.bristorian_mandelbrot_lattice` ("Setup")

## skeleton

- **ours** — the algebraic *shape* shared by an entire family of algebras — the relation
  `e_a·e_b = s_ab·e_b`, `e_a² = −1`, without specifying the sign matrix `s_ab` itself.
  Bristorian is the one point `s_ab = sign(a−b)` in that family ("skeleton theorem" vs.
  "Bristorian corollary").
- **label** — OVERLOADED
- **standard** — at least two real senses compete for "most findable," and neither is ours:
  (a) *algebraic topology* — the `k`-skeleton of a CW complex, the union of its cells of
  dimension `≤ k` — plausibly the most commonly encountered technical sense given this
  project's topological adjacency; (b) *category theory* — the skeleton of a category is a
  subcategory containing exactly one object per isomorphism class. Separately, "skeleton" is
  also common informally across mathematics and CS to mean *the basic structural framework with
  specifics stripped out* ("skeleton proof," "skeleton code") — which is the sense ours is
  actually closest to.
- **trap** — a topologically-minded reader may expect sense (a) (a sub-complex of some CW
  structure) and find neither that nor a stated relation to it. Our usage matches the informal
  sense closely enough that it isn't badly misleading, but it collides with two distinct
  standard technical senses that a mathematically literate reader might reasonably expect
  instead.
- **authority** — `math.bristorian_mandelbrot_lattice` ("Whose theorem is this?")

## gap

- **ours** — the DIFFERENCE between two ideas, presentations, or measurements — information
  that is *preserved* by the disagreement and readable from it. Classify a gap by what kind
  it is: a broken path, an equivalent presentation, claim overreach, or a real plurality.
- **label** — COINED (Doug's distinction, 2026-08-30, filed by Orac)
- **standard** — informal English only; no competing technical sense to collide with.
- **relation** — defined by contrast with `seam` below — the two words are a deliberate
  pair, not synonyms. A gap is where two things **differ**; a seam is where two things
  **join and the join destroys information**. "A gap preserves it in the difference."
- **authority** — this entry (Doug via Orac, 2026-08-30); the method this names is already
  load-bearing across the project (counterflow, two independent passes, read the
  difference) even where the word "gap" wasn't yet used precisely for it.

**Addendum, 2026-10-11 (fable, flagged) — a second, unrelated sense exists in the glyph
grammar: `A gap B`, "an odd vs even break" (a structural reading of two things' relation, not
a measurement difference). Not merged with the sense above — flagged here as a fourth entry
in this project's small list of words carrying more than one load-bearing meaning (alongside
`seam`), not yet fully disambiguated. See `ecosystem.glyph_language`.

## seam

- **ours** — three jobs, one word, deliberately kept as three uses rather than merged into
  one concept, because a merge would itself be the failure-shape this project keeps
  cataloguing:
  1. **ALGEBRAIC (primary, oldest, sharpest).** The zero-divisor diagonal `e_a + e_b`,
     explicitly paired with `lattice = e_a − e_b` — flipping a sign swaps which one is
     which. See `math.bristorian_division` for the authoritative pairing and the 2026-08-30
     extension (which pair beta mixes, and why rank on `R` — not `det L` — is what actually
     separates the two diagonals for a given pair).
  2. **METHODOLOGICAL.** caro's pipeline arrows (`object → representation → … →
     propagation`); "Arm N (nominated seam)" in experiment design.
  3. **ENGINEERING.** The ordinary sense — "found + fixed 2 integration bugs at the seam."
- **label** — OVERLOADED (deliberately, not a drift to correct)
- **standard** — no single competing technical sense; "seam" is common informally across
  domains for a join, which is close to senses 2 and 3 but not what makes sense 1 precise.
- **the shared structure across all three, stronger than metaphor:** a seam is where two
  things join *degenerately* — the join destroys information, and **the loss is invisible
  from either side**. Algebraically: the product annihilates and rank drops with nothing
  local to warn you. Methodologically, in caro's own words, failures were "locally
  plausible on both sides of one arrow." Same shape, different domains — which is why the
  overload is worth keeping explicit rather than resolving into one word or three.
- **the methodological consequence this makes precise:** *agreement at a seam is not
  evidence.* When two instruments agree because the joint they share is degenerate — both
  blind to the same property — the agreement carries no information and looks exactly like
  confirmation. This is caro's "joint kernels" blind spot (agreeing instruments can be
  jointly blind; parity and identifiability must be reasoned about, not voted on) with a
  name attached. Completes a symmetry with `gap` above: two paths that **differ** are a gap,
  to be classified; two paths that **collapse** are a seam, and the live question is whether
  the convergence is evidence or degeneracy.
- **breakdown is as valid a finding as convergence — four filed results are seam-collapses,
  not failures to find something:** the zero divisor / torsion (squaring's blind spot, "the
  impossible place"); escape time being even and therefore structurally blind to the hand;
  `Σ = J·Jᵀ` being parity-even in magnitude, shape *and* orientation; cloud's bulk-cloud
  chirality cancelling exactly. A vocabulary that treated seams only as defect sites would
  misfile all four.
- **authority** — Doug's distinction via Orac, 2026-08-30; algebraic sense authoritative in
  `math.bristorian_division`; methodological sense in caro's
  `investigation/RESULT_seam_audit_gap_method_20260825.md` and the Experiment C design
  (`insights/PREREG_expC_seam_selection_20260828.md`,
  `insights/RESULT_expC_seam_selection_20260830.md`).

**Addendum, 2026-10-10 (brotbot, asked; brotdocs, answered) — "collapse" in sense 1 is the
forward (product) reading, not the backward (division) one; the entry needed this stated.**
Asked on TC (`42673d58b6`): when this entry says "two paths that collapse are a seam," is
that read forward through multiplication or backward through division? **Forward.** Every
witness this entry and `math.bristorian_division` cite for sense 1 is a product-side
rank-drop — `det L = 0`, `det R = 0`, `x·y = 0` for the zero-divisor pair — i.e. the
*multiplication* by a seam direction loses rank; nothing here is stated in terms of the
inverse map. Division has a separate, consistent, but distinct behaviour at the same locus:
rather than collapsing, it **blows up** (`1/distance`-type growth approaching the seam,
unbounded, not degenerate in the same sense). So the two directions of travel are not two
readings of one word — they are two different (both true) facts about the same locus:
forward, it collapses; backward, it diverges. Sense 1's "collapse" names only the forward
fact. This doesn't change the pairing with `lattice = e_a−e_b`, the rank-on-`R` asymmetry,
or any numeric result already filed in `math.bristorian_division` — it only makes explicit,
for a reader who wasn't sure, which direction "collapse" was always describing.

**Addendum, 2026-10-11 (brotbot's TC room 42673d58b6; caro, insights, brotdocs) — the specific
diagonal "seam" names at B2 is settled as `i+j` (45°), paired against a new, separate term
`fold` for `i−j` (135°); do not use the bare word "seam" for both.** Doug had been using the
two names swapped (seam for the fold line, spread for the zero-divisor line); this addendum
is the correction, recorded before any public page is checked against it. Measured (caro,
2026-10-10/11, current i-roll, unit `x` stretched by multiplying along each line):

| `x` points along | stretches of `y → x·y` | reading |
|---|---|---|
| pure `j` | 1, 1, 1 | nothing lost, nothing stretched |
| **seam** (`i+j`, 45°) | 1.22, 1.22, **0** | one direction collapses while two overreach, at once |
| **fold** (`i−j`, 135°) | **1.41**, 0.71, 0.71 | widest spread, nothing lost |
| near the seam, dividing | grows like 1/angle (×405 at 0.1°) | division overreaches without bound |

`det L_x = (p−q)(p²+pq+q²)` — zero only on the seam, in both rolls (sympy-checked).
**fold = the 135° plane, `i=−j`** — the project's one true 3D-print mirror (print one half,
mirror it) — is a *new* term as of this addendum, not a renaming of anything already filed;
nothing previously called "fold" meant this plane. See `## fold` below.

**Do not silently join the fixed-left operator `L` and the squaring Jacobian `J` — they are
different operators that can be singular at the same locus without sharing a kernel there
(caro, 2026-10-11, exact, unnormalised i-roll coordinates; corrected 2026-10-11, see dated
addendum below — an earlier version of this line said "agree at the seam but not at the
fold," which is wrong):**

- `L_(i+j)(1+i−j) = 0` — the seam direction is a genuine kernel of left-multiplication.
- `L_(i−j)` has determinant 2 in `(real,i,j)` order — **invertible**. The fold is *not* a
  zero-divisor of `L`.
- `J_(i+j)(i−j) = 0` **and** `J_(i−j)(i+j) = 0` — the squaring map's differential is singular
  in the same cross-direction at *both* loci.

So "the fold is a mirror, not a zero-divisor" (true of `L`) and "the fold shows a rank-drop
under squaring" (true of `J`) are both correct — they are statements about two different
operators. A result proven for one does not transfer to the other without checking which
operator it was proven for.

{% notation.vocab_seam_fold_superseded_20261011 %}
status: archived

Superseded 2026-10-11 (caro, exact counterexample — see addendum below): this block
originally closed with "...they are statements about two different operators that happen
to coincide at the seam but diverge at the fold." That inference was wrong — the two
operators are both singular at the seam but do not coincide there; they have different
kernels.
{% endnotation.vocab_seam_fold_superseded_20261011 %}

**Addendum, 2026-10-11 (caro, exact counterexample to the line above; current i-roll,
coordinates `(real,i,j)`, unnormalised):** let `a = i−j`, `b = i+j`. Then

- `L_b(a) = −b`, `J_b(a) = 0` — both operators are singular at the seam (`b`), but
  `ker L_b = span(1+a)` while `ker J_b = span(a)`. **Different kernels — they do not
  coincide.**
- At the fold (`a`): `L_a` is invertible (`det = 2`, as already stated above), so only `J`
  is singular there.

**Corrected statement, replacing the superseded sentence above:** both operators are
singular at `i+j`, with different kernels; at `i−j` only `J` is singular. Do not say the two
operators "coincide" at the seam — being singular at the same point is not the same as
sharing a kernel. Full symbolic reproduction: `caro/investigation/seam_observer_20261011/
{check.py,witnesses.json,README.md}`. The earlier witness note already had both kernels;
the error was introduced when a later synthesis joined them too strongly into "coincide."

**Source vs. image (caro, 2026-10-11): a locus's algebraic name and the place its visible
effect shows up need not be the same address.** `u = cosβ·i+sinβ·j` squares, under current
i-roll, to `u² = −1 + cosβ sinβ·(j−i)`. At 45° (input `i+j`) the extra imaginary part points
along `j−i` — *outside* `span(1, i+j)` — which is why that plane isn't closed under squaring.
At 135° (input `i−j`) the extra part lies *inside* `span(1, i−j)` — closed, hence the fold
slice renders as a sheared-but-complete Mandelbrot copy rather than a visibly damaged one.
Label the algebraic object at its source (`seam`/`fold` as defined above); describe what a
*rendered slice* does (spreads apart, looks sheared, misses area, shows false cover) as a
separate, visual-layer statement — never collapse the two into one word. This is also why a
public page's slice captions should name the algebraic locus and the visual effect
separately rather than using one bare word (e.g. "a seam," "a spread") to carry both — see
`## fold` and `## spread` below for the two new entries this forced, and
`ecosystem.glyph_language`/`reflect` node `42673d58b6` for the full working.

**Generalisation, 2026-10-11 (fable's observation, verified by brotdocs for `philosophy_ant_
and_eagle`): squaring never creates seam content — the cross term of any square in the
(i,j)-plane lies entirely along the fold axis.** For any `u = x·i + y·j` (not just the unit
circle used above), direct expansion under current i-roll gives
`u² = −(x²+y²) + xy·(j−i)` — the imaginary part of the square is *always* a multiple of
`j−i` (the fold direction), for every `x,y`, not only at 45°. Two consequences: (1) the fold
plane (`x=−y`) is closed under squaring because its own cross-term already lies along its
own axis; (2) the seam plane (`x=y`) is not closed, because its cross-term (coefficient `x²`,
nonzero whenever the input is nonzero) points along the fold axis, *outside* the seam's own
span — "the seam leaks into the fold." This sharpens, but does not change, the 45°/135°
special-case formula already filed just above. **The seam is still two-sided under current
i-roll** (see `math.bristorian_division`'s 2026-10-11 addendum): `(1+j−i)·(i+j)=0` is the
right-annihilator, distinct from the seam's filed left-annihilator `1+i−j`. fable's draft
note that `(1+i−j)·(i+j)=2(i+j)≠0` is correct and doesn't contradict this — it's a true,
narrower fact about one specific shared vector acting as a zero only from one side, not a
claim that the seam has no right-annihilator anywhere.

**Addendum, 2026-10-19 (brotdocs) — the pairing, as currently written: seam = +45° (`i + j`), fold = −45° (`i = −j`), and 0 between them** (Doug, 2026-10-13; see the `fold` entry). The 2026-10-11 addendum above writes the fold as 135°. It is the same line.

## fold

- **ours** — the −45° plane in B2, `i = −j` (and its analogues at higher rank): the
  project's one true mirror plane — print one physical half, mirror it, get the other half.
  Paired with `seam` (`i+j`, +45°) as of 2026-10-11, with 0 between them: the two are the diagonal and
  anti-diagonal of the same 2-plane, not two names for one thing.
- **label** — COINED, 2026-10-11 (Doug, settled on TC `42673d58b6`). Not a renaming — no
  earlier filed entry used "fold" for this plane.
- **standard** — "fold" is common informally for a mirror/crease; no competing technical
  sense in this project to collide with (contrast `seam`, which already carried three).
- **relation** — `fold` is invertible under left-multiplication (`det L_(i−j) = 2`) but
  *not* under the squaring Jacobian (`J_(i−j)(i+j) = 0`) — see the seam entry's 2026-10-11
  addendum for why both are true at once. Visually, the fold slice is the "perfect-looking"
  one (sheared but complete), the seam slice the visibly damaged one — the two loci read as
  opposites under rendering even though neither is "more defective" algebraically.
- **authority** — Doug, 2026-10-10 (TC `42673d58b6`, "Settled first"); operator distinction,
  caro, 2026-10-11 (`caro/investigation/inbox_outreach_20261011/seam-source-and-image.md`).

**Addendum, 2026-10-19 (brotdocs, writing Doug's 2026-10-13 convention): write the fold as −45°.** Fold = −45° (`i = −j`), seam = +45° (`i + j`), and 0 is the middle. Doug: *"we have a ternary system so 0 is the middle is best."* A line at 135° is the same line as one at −45°, so nothing in the maths changes. This is a clearer way to write it, not a correction: 135° was never wrong, it just hid that the fold is the negative side and the seam the positive. Labels and angle readouts use −45°. Text above that says 135° inside dated addenda, or that quotes a page heading, is left as written; read it as −45°.

## spread

- **ours** — NOT a locus name. "Spread" is a *description* of what a rendered slice does
  (points move apart; an underlap, in the glyph-grammar sense — see `ecosystem.glyph_language`),
  not the proper name of any specific diagonal. The 2026-10-11 confusion this entry exists to
  head off: a public page had used "a spread" as the heading for the 45° (seam) slice and
  "a seam" as the heading for the 135° (fold) slice — the visual description and the
  algebraic locus name had been merged into competing proper nouns, backwards from the
  settled algebraic pairing.
- **label** — CLARIFIED, 2026-10-11 — not coined new, since the underlying glyph-grammar
  sense (apart/underlap) already existed; what's new is the explicit instruction not to use
  it as a locus's name.
- **standard** — no technical collision; ordinary English "spread apart" is exactly the
  intended sense.
- **relation** — pairs with `seam`/`fold` only as a *description*, never a *label*: the seam
  (+45°) slice is the one that visibly spreads (underlap, missed area); the fold (−45°) slice
  is the one that closes/overlaps (false cover, "perfect-looking"). Write "the seam — the
  slice spreads apart" or "the fold — a closed, sheared slice," never "45°: a spread" /
  "135°: a seam" as bare headings; see the seam entry's "source vs. image" note above.
- **authority** — brotdocs, 2026-10-11, resolving outreach's `to-brotdocs-msg-20261011T091649Z`
  and fable's `to-brotdocs-msg-20261011T103522Z` (docscmd had no entry for this word at all).

## join

- **ours** — a grammar/method sense, not an algebraic locus: *contact, two surfaces meeting
  within a stated tolerance.* "It takes two: one reading on its own cannot make a join."
  No B2 locus is known for this sense — do not pair it with `seam`/`fold`/`spread` as if it
  named a diagonal; it names a relation between two readings, not a place in B2.
- **label** — Doug, 2026-09-10 (corrected same day, from "where neither exists" to
  "touching"); published `bristorbrot.org` v2, 2026-10-05,
  `fable/web/site/content/home/45_learned.md:38`.
- **standard** — no competing technical sense found in this corpus; ordinary English "join"
  (contact/union) is close enough not to mislead.
- **relation** — none established to `seam`/`fold`/`spread`. It was one of four relation
  glyphs the glyph-term lookup (`&g(term);`, see `ecosystem.glyph_language`) found with no
  canon entry at all; this entry exists so it reads cyan rather than "no glyph yet," filed
  on fable's sourcing — if an algebraic sense surfaces later, add it below this one as a
  dated addendum, don't overwrite the grammar sense.
- **authority** — Doug, 2026-09-10/2026-10-05 (grammar/site); filed to this map by brotdocs,
  2026-10-11, on fable's `to-brotdocs-msg-20261011T152359Z` (sourcing, filing left to
  brotdocs' judgment).

**Addendum, 2026-10-19 (brotdocs): a B2 locus surfaced and was renamed within two days.**
On 2026-10-17 fable asked (for Doug) that `join` name the brotoid's det J = 0 line, the
border between the keep and mirror sheets, with "join cone" for the det J = 0 cone. On
2026-10-19 Doug renamed it **`crossing`** / **`crossing cone`**: *"crossing is better"*,
because nothing comes together there; one hand crosses into the other. So `join` keeps
only the grammar sense above. Pages dated 10-17 to 10-19 that say "join" or "join cone"
for det J = 0 mean `crossing`. See the `crossing` entry. ("Two wefts join", a brotoid
moment, uses ordinary English and is not this term. Its verb is still open: see `moment`.)

**Addendum, 2026-10-25: join, meet and cross, told apart by what happens** (Doug and brotdocs,
in session; **posed**, since Doug's words are *"only my current understanding, so not
definitive"*). Doug asked for cases of meeting rather than joining: *"or do things at a meet
actually join for that momment. An example might be the Q^2 brot and Bbrot 'meet' at
j=i=0"*. The posed rule:

| verb | what happens | the count | example |
|---|---|---|---|
| **join** | two become one | drops by one | two wefts join at a peak of h; their two inner umbrellas vanish |
| **meet** | they coincide or touch, and both carry on | unchanged | **Qbrot and Bbrot meet** on the i = 0 plane and on the j = 0 plane: each plane is the exact Mandelbrot for both, because the Bristorian cross term vanishes there (`math.bristorian_vs_quaternion`, norm-defect addendum). Doug's j = i = 0, the real axis, is where those two planes cross. Off them the two sets part, and neither becomes the other. |
| **cross** | one passes through the other | unchanged | the `crossing`: one hand crosses into the other |

Checked against the names already in use (brotdocs, HIGH on the counts):
- **"two rims meet"** (10-23): two rims become one, so by this rule it is a join.
- **"two self wefts meet"** (insights 0z5m, a peak of ρ; the self-weft count −1): two become
  one, so it is a join. It has the same form as "two wefts join".
- So far **every brotoid "meet" is a join.** The only true meet on file is Doug's Q/B example.
  Renaming the two moments is Doug's call; their names stay until he rules. (brotdocs' earlier
  suggestion of "join = skin event, meet = self-weft event" fails this test, so it is not filed.)

⚠ **Clash with this entry's own first sense.** The 2026-09-10 grammar sense above makes `join`
mean *contact, two surfaces touching*. That is what the posed rule calls **meet**. The two
cannot both stand. Raised with Doug; nothing above is changed.

**Addendum, 2026-10-27: Doug's view on the clash** (Doug, in session with brotdocs; his words
are "imo", so this is his current understanding, not a final ruling). *"there are two verbs
meet & join. meet meaning touching but may pass on|over|through ... a join implies some level
of fusing|melding."*
- **meet** — they touch, and may pass on, over or through. Nothing fuses. Doug's example: **a
  crease that becomes a weft is a meet.**
- **join** — some level of fusing or melding: two become one. This matches the posed rule's
  join row, and "two wefts join" (count −1) stands.
- **The clash above resolves this way.** The touching sense that the 2026-09-10 grammar entry
  gave `join` now belongs to **meet**. So it is a sense that moved, not an error. Its trail in
  TC: fable 09-10 (node 0fa0944f46, *"Doug says he MEANT JOIN AS TOUCHING"*) and fable 10-05
  (node c384eb354f, vocabulary line *"join = contact within tolerance"*). It belongs in this
  entry's `history` field when the field is rolled out (lnv8).
- **Open (brotdocs, for Doug):** (1) Doug's meet includes passing *through*, which the posed
  rule gave to **cross**. Is cross then a kind of meet, or a third verb? (2) "Two rims meet" and
  "two self wefts meet" fuse (count −1), so by this view both are joins. Their names stay until
  Doug renames them.

## phase

- **ours** — collides with two live senses of its own, both in this project: (a) `arg(z)`,
  the standard complex-argument sense; (b) a component of `phase space` (`notation.glossary`
  — where `z` lives, distinct from `parameter space`). Doug additionally reaches for "phase"
  informally to mean an angular offset in β, flagged as loose usage, not a definition.
- **label** — OVERLOADED, and recommended narrower going forward
- **standard** — *complex analysis*: `arg(z)`, the angular coordinate of a complex number.
  Also standard in physics/signal processing for a waveform's angular offset.
- **trap** — three senses live in the same corpus at once (arg(z), phase space, Doug's loose
  angular-offset usage) and none is marked as the default. A reader has no way to know which
  is meant from the bare word.
- **recommendation (Doug via Orac, 2026-09-04):** use **angular offset** for the β/rotation
  sense near the algebra; keep "phase" for signal-processing work, where it is least
  ambiguous and already standard. Do not use bare "phase" near the algebra for anything.
- **authority** — this entry (2026-09-05); `notation.glossary`'s `phase space` entry for
  sense (b).

## polarisation

- **ours** — recovering a symmetric bilinear form from a quadratic one:
  `xy = ((x+y)² − x² − y²)/2`. This is *why escape time cannot see the algebra's hand* —
  squaring only ever produces the symmetric (polarised) part of a product, never the
  antisymmetric part where chirality lives (`controls.md`).
- **label** — STANDARD (a real, correctly-used technical term, not a false friend)
- **standard** — *bilinear algebra*: the polarisation identity, recovering an inner product
  or bilinear form from its associated quadratic form. Same definition, no divergence.
- **relation** — **reserved — do not repurpose.** Doug reached for "polarisation" as a
  candidate name for the β/orientation sense (motion vs. convention,
  `rendering.canonical_orientation`); that would collide with this already-load-bearing,
  correctly-used technical term. Flagged so the word isn't spent twice.
- **authority** — `controls.md` (the mechanism this names); this entry, 2026-09-05.

## relabelling vs. opposite algebra

- **ours** — two operations on a Bristorian presentation that are **numerically
  indistinguishable by every observable measured so far, and provably not the same thing**:
  a *relabelling* (`e_a ↦ e_π(a)`, an isomorphism by construction) versus *the opposite
  algebra* `Aᵒᵖ` (proved **not** isomorphic to `A`, Gröbner basis, B2/B3/B4 —
  `math.chirality_lock`). Not a single word's false-friend risk, the pair itself: saying
  "it's just a relabelling" and "it's `Aᵒᵖ`" describe mutually exclusive facts about the
  same-looking transformed object, and nothing in the numbers tells them apart.
- **label** — FALSE FRIEND, unusually — **the friendliness is total: no numerical tell
  exists.** (Every other entry in this file at least has a trap a careful measurement can
  avoid; this one cannot be resolved by measuring harder.)
- **the incident that found this (cloud + Orac, 2026-09-05):** cloud's fixed-point check on
  a shared test-point set failed (residual `6.6e-2`) until components 1 and 2 were swapped,
  after which it passed to `5.6e-17`, and cloud concluded *"your basis is my basis with
  `e1↔e2`, i.e. `Aᵒᵖ`."* **The "i.e." is false.** A relabelling is an isomorphism by
  construction; `‖conj(M,τ) − Mᵒᵖ‖ = 2.0`, not zero — the swap found was a relabelling, full
  stop, not `Aᵒᵖ` under another name.
- **why it was an easy error — the actual content of this entry:** every observable in play
  agreed on both readings. Generic left-/right-multiplication rank over 4,000 random
  elements: `3` and `3`, identically, for `A`, for the relabelling, and for `Aᵒᵖ`. A
  separate phase-count control returned exactly `178` for the swap *and* for `Aᵒᵖ`. **Two
  independent agents' own instruments could not have caught this by measuring — only the
  filed Gröbner proof (`math.chirality_lock`) resolves it.** This is a sharper instance of
  the same-family-audit discipline elsewhere in this project: some distinctions exist only
  at the level of proof, never at the level of any measurement anyone has run.
- **what usually explains the confusion in the wild:** a coordinate-mapping mismatch
  between two agents' code, not an algebra difference — see `algebra.iteration` /
  `rendering.canonical_orientation`. Check that first; it is far more common than a genuine
  `Aᵒᵖ` sighting.
- **The sharpest form of the trap, from cloud's own side of the same incident (2026-09-05):
  only the *number of halves* swapped distinguishes a convention from a defect.** Applying
  the `e1↔e2` swap to **both** halves of a fixed-point check is the relabelling — residual
  `5.6e-17`, clean. Applying the identical swap to **one** half only is a real bug, not a
  convention — residual reads `12.53%`, a wrong number that looks like evidence of `Aᵒᵖ`
  rather than a partial, inconsistent fix. Before concluding either "it's a relabelling" or
  "it's `Aᵒᵖ`," check whether the transform was applied consistently everywhere it needs to
  be — an inconsistent application of a harmless operation is indistinguishable, by output
  alone, from either of the other two readings.
- **the generalization this is one instance of (cloud, 2026-09-05):** cloud's own path into
  this error was inferring identity from agreement on a *single* observable (`Aᵒᵖ` and the
  swap both returned exactly `178` on one count) — the same shape as `rendering.
  lattice_artifacts`' jitter control, one level up. **Agreement on an observable that
  cannot distinguish two things is not evidence they are the same thing** — before reporting
  a match, ask whether the instrument you used was even *capable* of telling the two
  candidates apart, the same question a null-overlap control asks of a coding vocabulary
  (`reference.canonical`'s Experiment C rows) or a same-family census asks of a
  distinctiveness claim.
- **authority** — `math.chirality_lock` (the proof this false friend is checked against);
  this entry, 2026-09-05.

## LH / RH

- **ours** — the letters LH/RH have been doing **two unrelated jobs** in the corpus:
  1. **which of the two multiplication-table sign conventions is in force** — renamed
     **i-roll** / **j-roll** (Doug, 2026-10-02, shortened from insights' 09-30 "i-turn
     roll"/"j-turn roll") to stop the collision. **i-roll** = canon since 2026-09-08
     (`notation.overview` "Current declared convention"): `i·j = +j, j·i = −i`; `×i` is a
     clean turn (`det +1`), `×j` turns *and* flips `i` (`det −1`). **j-roll** = the legacy
     1995 table (the old "LH roll"): `i·j = −j, j·i = +i`; `×j` is the clean turn. The name
     keys on which multiplication is the *clean* turner because CW/CCW can't name them (both
     rolls turn `1→i` and `1→j` the same way, and CW/CCW flips with the viewing side anyway)
     — determinant orientation doesn't depend on the viewer. **They are one algebra
     relabelled**, not two algebras (`e_a → e_{n−a}`, verified isomorphism). Always say
     "roll," never bare "i-turn"/"j-turn" (reads as "multiply by i," which is a turn in
     *both* rolls).
  2. **which operand survives in `e_a·e_b` — the actual hand** — **RH (right-dominant)** =
     standard, `e1·e2 = ±e2`, the right operand survives = canon's "diagonal-right
     skeleton." **LH (left-dominant)** = the shadow pair, `e1·e2 = ±e1` = `Bᵒᵖ`. `B ≇ Bᵒᵖ`
     is proved (Gröbner, n=2,3,4) — this pairing, not the roll, is where the real,
     irremovable chirality lives (see **relabelling vs. opposite algebra**, above).
- **label** — FALSE FRIEND, internal collision (not a mainstream-math false friend like
  most entries in this file — both senses are this project's own coinage, which is exactly
  why nothing stopped them sharing letters).
- **the trap, stated as a consequence worth re-reading twice (insights, 2026-09-30):**
  squaring symmetrizes operand order and literally cannot see `B` vs `Bᵒᵖ`
  (`math.bristorian_squaring` "Not the transpose") — so **every LH/RH label ever written on
  square/Jacobian code is a *roll* label, never a *hand* label**: CodeT SHIPPED, codon's
  `isLH`, catchfield's "LH square," T-049's "RH roll," all of them. Reading one of those as
  if it told you the hand is the actual failure mode this entry exists to stop.
- **policy (Doug): no purge.** Old "LH/RH roll" phrasing stays as a labelled alias, not
  swept — history is read as written, not corrected. Reference implementation:
  `insights/bristorian_fixture.py`'s `bristor(n, roll='i-turn'|'j-turn')`, which also
  accepts `'RH'`/`'LH'` as roll aliases (so old call sites keep working) — note even this
  reference script's own aliasing is axis-1 (roll) only, never axis-2 (hand), consistent
  with the trap above.
- **authority** — `notation.overview` "Current declared convention" (the i-roll decision
  and its pointer to this entry); `math.chirality_lock`/`math.bristorian_chirality` (the
  hand); `math.bristorian_squaring` (why squaring can't see the hand); this entry,
  2026-10-07 (Doug/insights/fable, 2026-09-30 → 10-02, filed by brotdocs).
- **Addendum, 2026-10-24: never write a bare LH/RH; name the pair** (Doug, 10-24, via insights
  `to-brotdocs-msg-20261023T231652Z-mz4q` and `…232120Z-273j`): *"LH|RH is overloaded… the issue
  isn't that it's wrong, it's just imprecise and prone to causing misidentifying."* The brot is
  about pairs, and LH/RH has been read as more than the two jobs above. The pairs Doug named:
  - **B | Bᵒᵖ** — the hand (sense 2 above);
  - **(zz)z | z(zz)** — the two brackets of the cube (see `chirobrot`);
  - **i-roll | j-roll** — the sign convention (sense 1 above);
  - **rigid | absorbs** — left multiplication `a·x` (a signed permutation) against right
    multiplication `x·a` (rank 2). Doug marked this pair with "?", and no word for its second
    half has been decided (below).

  **Rule:** in new writing, write the pair you mean, never LH or RH alone. Sense 2's labels
  ("RH = right-dominant", "LH = Bᵒᵖ") stay above as the key for reading old text, not as labels
  to use; write B | Bᵒᵖ. The no-purge policy stands: old text is read as written. fable's GFX
  README house rule 6 ("dissolved in August 2026") is not wrong, only imprecise; it should point
  here.

  **The rank-2 word was never decided** (checked 2026-10-24 for Doug, who remembered a decided
  term). On file, none confirmed: `notation.glossary` **absorbing / signing** (Orac's
  reconstruction, 2026-09-04, the left operand's index is absorbed and gives only a sign; still
  "reconstructed", no second source, 09-08); `math.bristorian_diagonal_right_skeleton`
  **"L rigid / R collapses"** (OBJ-002's founding measurement); `math.bristorian_group_action`
  **"rank 2, maximally degenerate"**. The `automorphism` entry below already names
  `rigid`/`absorbing` as a word family "carrying more than one mechanism, no entry to check
  against". So "absorbs" is Doug's own current pick, posed with his "?"; it is his to settle.
- **Addendum, 2026-10-24 (later): the rank-2 word is decided — `collapses`** (Doug, 10-24, via
  insights `to-brotdocs-msg-20261023T233521Z-ypfq`). The pair is **rigid | collapses**, taken
  from `math.bristorian_diagonal_right_skeleton`'s "L rigid / R collapses". "Absorbs" was his
  placeholder; it is weighed, not history. The glossary's `absorbing / signing` is a different
  idea (operand roles) and stays as it is.

  **The worked case for "name the pair":** in `B`, the **right** factor survives (`i·j = +j`),
  but **left** multiplication is rigid and **right** multiplication collapses. The L and R in
  "L rigid / R collapses" name the side the fixed factor multiplies from, not the surviving
  factor, so the letters swap. **Rigid when the fixed factor is not the survivor; collapses when
  it is.** In `Bᵒᵖ` the roles swap. Doug's own first phrasing paired "RH survives" with "rigid",
  which is backwards; that slip is the misidentifying this rule exists to stop. So two pairs must
  never share letters:
  - **right-survives | left-survives** = `B | Bᵒᵖ` (the hand);
  - **rigid | collapses** = left vs right multiplication, as read in `B`.

  Full worked example, ranks and Doug's "apparent descriptive paradox based on framing":
  `math.paradox_candidates` Candidate 4.

## chirobrot

- **ours** — the escape-time set of **z³ + C**, under either bracket, **(zz)z** or **z(zz)**,
  and the melt between them. The word names the map and its set, not one picture.
- **label** — COINED, status posed (Doug, 2026-10-23, asked insights for the entry). Spelling
  **chiro-**, from Greek *cheir*, "hand" (chirality comes from the same root).
- **why it earns a word** (Doug): it was the first brot with a hand. z² + C is provably
  hand-blind, because squaring symmetrises operand order and sees only the Jordan part
  (`math.bristorian_squaring` "Not the transpose"; see `LH / RH`, "the trap"). The cube is the
  first escape-time map that separates B from Bᵒᵖ, and no linear map takes one bracket onto the
  other (T-053, proved at n = 3 and n = 4, per insights).
- **caveat, keep with the word:** separating the two renders is not yet naming the hand.
- **standard** — none. "Chiral" and "chirality" are standard and mean handedness in general;
  this word names one set.
- **seen** — caro's `quaternion^3_chirobrot_melt` and `julia_…` pages; insights' catchfield_orac
  `chirobrot_sbs`; an outside correspondent's draft. Those are renders of it. bq_body labels the
  set "z³+C : (zz)z" (or z(zz), or melt).
- **weighed** — "chirabrot", Doug's first spelling, from "chiral". Kept as an alias for search.
- **authority** — Doug, 2026-10-23, via insights `to-brotdocs-msg-20261023T224529Z-t8yp`. The
  T-053 claim is insights' (ticket done 2026-09-09; proof in
  `insights/RESULT_cubic_T053_20260908.md` against its frozen prereg; not yet filed in docs).
  Filed by brotdocs, 2026-10-24.

## automorphism

- **ours** — this word does **three unrelated jobs** in the corpus with no entry to check
  against, until now:
  1. **a linear map `φ` commuting with squaring** (`φ(z²)=φ(z)²`) — the dynamical sense.
     The Bristorian squaring map's group here is proved **order 2** (`σ`: reverse and
     negate the imaginaries). `math.chirality_two_witnesses`.
  2. **an algebra automorphism** proper (preserves `+` and `·`) — where the LH/RH reversal
     lives, e.g. `σ` itself proved an automorphism of `B_n`. `math.chirality_two_witnesses`,
     `math.chirality_lock`.
  3. **a homeomorphism of the rendered set** `h: M → M` — Wolf Jung's sense (2003), built
     by quasiconformal surgery, non-linear, does **not** commute with iteration. This
     group has the **cardinality of the continuum** and is non-compact. `reference.
     literature`.
- **why it's a trap:** sense (1) is a special case that happens to also satisfy sense (2)
  here (`σ` is both), which invites assuming they're the same claim generally — they
  aren't; a squaring-commuting map need not preserve the algebra's multiplication in
  general, and sense (3)'s objects aren't linear at all. A bare sentence like "the M-set's
  automorphism group is order 2" reads as **false** under sense (3) (continuum, not order
  2) and **true** only under sense (1)/(2) restricted to the *linear, iteration-commuting*
  maps of *this* algebra — not a fact about the classical Mandelbrot set under Jung's sense
  at all.
- **the incident that found this (Orac, 2026-09-08):** wrote "the M-set's automorphism
  group is order 2" in filing the squaring-commutation result, without specifying sense.
  Doug forwarded Jung's paper with no comment; the collision was the comment. Same failure
  family as `rigid`/`absorbing` (a word carrying more than one mechanism, no entry to check
  against) — `docscmd --term` is exactly the instrument that would have stopped it, had
  this entry existed first.
- **completeness caveat, carried separately:** sense (1)'s "order 2" result has proved
  *membership* (`σ` commutes with squaring) but not *completeness* (that nothing else
  does) — don't let the vocabulary fix read as also closing that open question.
- **authority** — `math.chirality_two_witnesses` (the order-2 proof and the Jung
  cross-reference); `reference.literature` (the Jung citation); this entry, 2026-09-08.

## pullback

- **ours** — two unrelated senses in live use, no entry to check either against until now:
  1. **the P2 pullback ring** (dynamics, caro) — the finite ring structure of inverse
     iterates in the basin near a P2 saddle region, period `ln2/ln(1/|λ_pair|)`; `pullback`
     and `shell` are the two candidate readings the epsilon-response detector separates by
     varying the *instrument*, not by reading the point (`math.bristorian_p2_stability`,
     `caro/RESULT_epsilon_detector_20260913.md`).
  2. **pullback, the navigation/lifecycle motion** (knowledge-tree, caro) — the retraction
     of stale growth back into the main forest view, the counterpart to a tree's
     citation-driven growth: *"the rhythm is growth followed by pullback… a healthy
     knowledge tree does not only accumulate"* (`caro/METHOD_knowledge_precipitation_
     20260915.md`). Carries its own UI requirement — the last-tree crumb must stay
     visible/clickable through a pullback, or local continuity is lost
     (`caro/story_20260915.md`, flagged as an open gap there, not resolved by this entry).
- **label** — sense (1) STANDARD (a correct instance of the ordinary dynamical-systems
  reading — inverse iterates/preimages under a map); sense (2) COINED (project-specific,
  chosen for the "pulling back a view" image, no external meaning to collide with).
- **standard** — dynamical systems and category theory each have a real, independent
  technical sense of "pullback" (inverse image under a map; the universal construction on
  two morphisms). Sense (1) is a correct instance of the dynamical-systems reading; sense
  (2) corresponds to neither.
- **trap** — the two *in-project* senses can collide with **each other**, not just with an
  external reader's prior: a bare "pullback" in a caro doc could mean the math ring object
  or the forest-navigation motion, and nothing marks which. Flagged by fable, 2026-09-17,
  from T-077 work — before the two collided in a shared write-up, not after.
- **authority** — sense (1): `math.bristorian_p2_stability`, `caro/RESULT_epsilon_detector_
  20260913.md`; sense (2): `caro/METHOD_knowledge_precipitation_20260915.md`. This entry,
  2026-09-17.

## hand

- **ours** — which way round one Bristorian squaring turns a small shape at one point:
  **hand = χ = sign det J**, where J v = qv + vq is the Jacobian of z ↦ z² at q. It has two
  values. **keep** is +1 (det J > 0, cyan on fable's pages) and **mirror** is −1 (det J < 0,
  orange). On the `crossing` cone det J = 0, and there is no hand. In B2 exactly half of all
  directions mirror, because J is 3×3 and J(−q) = −J(q), so det J(−q) = −det J(q) (brotbot;
  brotdocs sampled 50.4% of 20 000 q). `rendering.bristorian_splat_plane` §Chi already calls χ
  "handedness".
- **label** — NARROWER, plus a clash. The standard idea is orientation: keep = orientation-
  preserving and mirror = orientation-reversing, here always for the squaring map. **CLASH
  with chirality**, see relation.
- **standard** — the sign of a Jacobian determinant (orientation-preserving or -reversing).
- **relation** —
  - **not chirality.** Chirality (`math.bristorian_chirality`) is global and per rank: does
    the whole fractal have a distinct mirror twin? It follows a period-4 ladder, and B2 is
    ACHIRAL. hand is local and per point, and it varies with q. Both are true; they answer
    different questions.
  - **not LH / RH.** J v = qv + vq is the same in A and its opposite algebra, so the hand cannot
    tell the LH and RH algebras apart (see `LH / RH`, `math.bristorian_squaring`).
  - **"mirror" is used three ways.** In `fold` it is a plane ("the project's one true mirror
    plane"); in the chirality ladder it is a mirror operation. The hand's mirror is a value of
    χ, neither a plane nor a twin.
  - **normed algebras have only keep.** In ℂ, det J = 4|z|² ≥ 0 (closed form). In ℍ, 0 of
    20 000 sampled q gave det J < 0 (brotdocs, 2026-10-25, numerical). So mirroring needs the
    Bristorian product. A normed algebra's brot has no orange.
  - **i as keep, j as mirror depends on the reading** (fable, `to-brotdocs-msg-20261021T110025Z-lnv8`).
    As operators, ×i is a clean turn (det +1) and ×j turns and flips (det −1), so i keeps and
    j mirrors. In the components of a square the roles reverse: the cross term −bc goes to i
    and +bc to j. At rank n it is a relation, not a property: e_a·e_b = sgn(b−a)·e_b. Any
    keep/mirror name for a unit must say which reading it uses.
- **Doug's current understanding** (2026-10-25, in session with brotdocs; posed, and in Doug's
  words *"only my current understanding, so not definitive"*): *"isn't the hand about the
  bristorian, and then the bristorbrot expesses it. so the immordial numbers are chiral|odd,
  however orders of factor 2 will always be even:achiral. Norm algerba is achiral, and cannot
  see chiral|odd algerba."*
  Read against canon (brotdocs, HIGH):
  - **Agrees:** the hand belongs to the algebra and the brot shows it, and a normed algebra
    cannot mirror (see relation).
  - **The odd/even part answers a different question.** Odd/even decides whether flipping
    every imaginary at once (−I) is itself a reflection, which happens exactly when n is
    odd (`math.bristorian_chirality`, question 1). Whether the whole fractal is chiral
    (question 2) follows the period-4 ladder: achiral for n ≡ 1, 2 (mod 4) and chiral for
    n ≡ 3, 0 (mod 4). So B4 (even) is chiral and ℂ (odd) is achiral.
- **authority** — Doug's ask via brotbot, `to-brotdocs-msg-20261019T143645Z-ud9j` (definition,
  sources `fable/web/keep/`, `fable/web/proto_brotoid/` §2, `fable/web/proto_explorer_tour/`).
  Doug's understanding: 2026-10-25. Filed by brotdocs, 2026-10-25.

## brotoid

- **ours** — the image of a ball under one Bristorian squaring. Take the ball
  `|x − q| ≤ r` in B2 (parts `[1, i, j]`) and square every point. The **skin** of the
  brotoid is the squared sphere `|x − q| = r`. Each point of the ball either keeps or
  mirrors the hand of a small shape, according to the sign of det J (the Jacobian of the
  square): **keep** (cyan) where det J > 0, **mirror** (orange) where det J < 0. Keep and
  mirror are properties of points. They are not the algebra's LH/RH; see `LH / RH`. As r
  grows the brotoid passes through a fixed sequence of **moments** (see `moment`), and
  `crossing`, `crease`, `weft` and `umbrella` are the names for what those moments create.
- **label** — COINED. Doug: *"-brot- carries more meaning."* **`bristoroid` is retired**
  (2026-10-19). It was an earlier alias that only ever appeared on fable's brotoid page.
- **standard** — no external meaning. The "-oid" suffix reads like spheroid or cardioid,
  which is harmless.
- **relation** — inverse brotoid, bsplat, wing, splitpairdouble, Jacobian ghost and chain
  (fable's T-175 terms) are pending a separate filing.
- **authority** — fable (T-175), `to-brotdocs-msg-20261012T002244Z-9b13`; the name and the
  retirement are Doug's, 2026-10-19, via fable `to-brotdocs-msg-20261019T080922Z-j9ke`.
  Filed by brotdocs, 2026-10-19.

## q

- **ours** — the one Bristorian number that every figure reads. In B2 it is a point
  `q = (1, i, j)`, given in the examples as a size times a direction, |q|·(around, toward 1) in
  degrees. The readings B, R, O and T read q alone (as if the ball round q were vanishingly
  small). The brotoid squares a ball of radius `r` round q. **r never moves q, and never changes
  q's readings.**
- **label** — COINED, a letter rather than a word. Define it at first use: "q, the number
  being read". ⚠ **q is not a quaternion.** q is the usual letter for one, and reading Bristorian
  as quaternionic is this project's most common cold-start mistake (see
  `math.bristorian_vs_quaternion`). Here q is a Bristorian number (an imordial), and nothing
  quaternionic is meant (Doug asked for this warning, 2026-10-22).
- **standard** — none. It is only a point; no standard meaning collides.
- **relation** — `r` is the radius of the ball round q. The brotoid's shape depends only on
  q's direction and on r/|q| (see `r`). Moment ③ is r = |q|.
- **|q| = 0.9 was chosen by chance** (Doug, 2026-10-22). It came from the first test on insights'
  explorer ("q is always 0.9 long unless stated", TERMS_crease_explorer). fable's pages are
  moving to |q| = 1.0. Examples filed at 0.9 stay true as written, because each one states its
  q. To move one to |q| = 1.0, keep the direction and divide every r by 0.9 (see `r`). So
  q3 = 0.9·(150°, 30°) with crossing loop born at r 0.2725 becomes q = (150°, 30°), born at
  r 0.3028.
  - **Addendum, 2026-10-23: the move to 1.0 is held.** Doug, 10-23 (via fable
    `to-brotdocs-msg-20261023T002333Z-uca9`): *"your pages will move to |q| = 1.0 but you can
    hold it; it may change some readings but no new findings."* fable's pages still show
    |q| = 0.9, with r/|q| beside every r. The move will run as a settings quake across pages,
    blocks and links together (TC 3834d3dc90). In the q3 example above, "crossing loop" means
    the loop on the ball, which is the `rim` (the word since 10-21; on the skin, its square is the
    crossing loop).
  - **Addendum, 2026-10-24: the hold is lifted; |q| = 1.0 is settled** (Doug, 10-23 at 13:4x, in
    session with brotbot: *"|q| is now 1.0 and settled. the 'don't touch [till later]' — later came
    now updated to rookie expectations"*; via `to-brotdocs-msg-20261023T154616Z-h1i9` and fable
    `…135140Z-z0uj`). This supersedes the 10-23 "held" addendum above. **Write new examples at
    |q| = 1.** Pages at |q| = 1: brotoid (with Fig 2's cone view), proto_brim, proto_hatscope.
    proto_qunit keeps both, being the 0.9-vs-1.0 page; proto_hat stays at 0.9 (Doug's keep-as-is).
    The rule for moving an example is unchanged: keep the direction, divide every r (and every
    length: h, gap) by 0.9; angles, counts and kinds read the same.

    **This map's worked examples, restated at |q| = 1** (brotdocs, 2026-10-24, by that rule, not
    re-measured; the 0.9 forms in each entry stay true as written, since each states its q):

    | entry | at \|q\| = 0.9 (as filed) | at \|q\| = 1 |
    |---|---|---|
    | `q`, `moment` | q3 = 0.9·(150°, 30°): rim born r 0.2725; wefts born 0.4348, 0.8754, 1.9102; two wefts join 2.1286; umbrella count 0, 2, 4, 6, 4 at r 0.4, 0.6, 0.98, 2.0, 2.2 | q3 = (150°, 30°): rim born r 0.3028; wefts born 0.4831, 0.9727, 2.1224; join 2.3651; umbrella count 0, 2, 4, 6, 4 at r 0.4444, 0.6667, 1.0889, 2.2222, 2.4444 |
    | `crease` | q = 0.9·(−62°, 4°), r 0.245: crease at 112.0°, gap 0.0442 (h 0.2892); weft born r 0.2892 | q = (−62°, 4°), r 0.2722: crease at 112.0°, gap 0.0491 (h 0.3213); weft born r 0.3213 |
    | `tear`, `weft` | q = 0.9·(150°, 20°), r 1.004: cross, self, self, cross, cross | q = (150°, 20°), r 1.1156: cross, self, self, cross, cross |

    fable's proto_dictionary checks the examples at their stated q, so it can move to |q| = 1
    against this table (told fable, 2026-10-24).

    **Addendum, 2026-10-25: the table above is now measured, and all 15 numbers hold** (fable,
    `to-brotdocs-msg-20261025T112519Z-jfmc`, HIGH). proto_dictionary's check D2·q1 tests all three
    rows against the atom at |q| = 1: the rim 0.3028; wefts 0.4831, 0.9727 and 2.1224; join
    2.3651; the five umbrella counts; crease 112.0°, gap 0.0491 and h 0.3213; and the kinds at
    r 1.1156 (page sha 45625060b19c, spectest 12/12). So "not re-measured" above no longer
    applies. ⚠ **Keep the table's header row as it is.** The page finds the table by a header
    ending `at \|q\| = 1 |`.
- **weighed** — "b" (Doug, 2026-10-22: *"why was it 'q' and not 'b'"*, then *"keep q"*). No
  reason for q is on file. fable notes against b: it would clash with B (the reading), B2 (the
  rank) and B (the far end of an eye length).
- **authority** — "keep q" and the |q| ruling: Doug, 2026-10-22 (via fable
  `to-brotdocs-msg-20261022T154859Z-pvra`, and in session with brotdocs). The definition is
  fable's, from the brotoid page. Filed by brotdocs, 2026-10-22.

## r

- **ours** — the radius of the ball `|x − q| ≤ r` that the brotoid squares. r sizes only the
  brotoid. It never moves q and never changes q's readings. That is easy to forget while
  dragging the slider, so fable's brotoid page now says it there.
- **label** — NARROWER. It is an ordinary radius; here, always the radius of the ball round q.
- **standard** — radius.
- **relation** — **the shape depends only on r/|q|** (brotdocs, algebra, HIGH). Squaring is
  homogeneous of degree 2: (s·x)² = s²·x² for any real s. So scaling q and r together by s
  scales the brotoid by s², and every moment's r scales by s. The crossing cone doesn't move,
  because det J(s·x) = s³·det J(x) keeps its sign. The moments are r values (see `moment`);
  ③ is r = |q|, which is r/|q| = 1.
- **authority** — fable `to-brotdocs-msg-20261022T154859Z-pvra` (the definition); the scaling
  rule is brotdocs, 2026-10-22, from the bilinearity of Bristorian multiplication. Filed by
  brotdocs, 2026-10-22.

## moment

- **ours** — a value of r where the brotoid changes kind. Doug's "event" means the same.
  **Moments come first and names second** (Doug, 2026-10-19): a name is filed only for
  something a moment produces, and a visual impression does not fix a name. The moments,
  in the order they appear as r grows for a fixed q (**insights/Orac, 2026-10-19, HIGH**:
  every rule recomputed from the CodeT atoms by `insights/web/crease_what/terms_check.mjs`,
  17 PASS, and a planted wrong value FAILs):

  | # | moment | when it happens | what it makes or ends |
  |---|---|---|---|
  | ① | **crossing loop born** | r = the distance from q to the crossing cone | a small `crossing` loop on the skin |
  | · | **two crossing loops meet** | at a cone line locally farthest from q, nearer than \|q\| | two crossing loops become one |
  | ② | **crease becomes a weft** (atom: ② weft born) | r = a dip of h (see `crease`) | a `weft`, born at one point with its two `umbrella`s |
  | · | **two wefts join** | r = a peak of h | two wefts become one; their two inner umbrellas vanish |
  | ③ | **r = \|q\|** | the ball reaches 0, where J vanishes completely | the skin passes through 0 |

  A **crease** is a *state*, not a moment: it exists while a dip of h is still above r.
  **Worked example,** q3 = 0.9·(150°, 30°): the crossing loop is born at r 0.2725, wefts
  are born at 0.4348, 0.8754 and 1.9102, and two wefts join at 2.1286. The umbrella count
  reads 0, 2, 4, 6, 4 at r 0.4, 0.6, 0.98, 2.0 and 2.2.
- **label** — FALSE FRIEND. In standard mathematics a "moment" is a statistical moment, a
  moment of inertia or a moment map, and none of those is meant here. On first use, write
  "moment (an r where the brotoid changes kind)".
- **standard** — the nearest standard idea is a *bifurcation value* (or a codimension-one
  event) in a one-parameter family of maps from a surface to 3-space.
- **relation** — **open, not filed as terms:**
  - **eversion.** Doug sees the brotoid "eversion through the tear"
    (`aicolab/tmp/eversion.md`). Being inside out is not a moment: wherever det J < 0
    the solid is already turned inside out, from ① onward. The candidate moment is
    instead the point where a weft (or part of one) switches from *cross* to *self* (see
    `weft`). The ruler above has no tick for that switch. The question went to insights on
    2026-10-19 (`to-insights-msg-20261019T083744Z-wcu1`). File `eversion` only if a moment
    answers to it.
  - **"two wefts join" vs "two wefts meet".** The moment is confirmed; the verb is not.
    Doug hears join/meet as "B meeting Q", so he is not sure yet.
- **authority** — moments: insights, `insights/web/crease_what/TERMS_crease_explorer.md`,
  2026-10-19, and `insights/story_20261017.md` (turn_through §5, the 3-D cardioid moment:
  "the 2-D cusp splits into three moments"). The word "moment" and the order "moments
  first": Doug, 2026-10-19. Filed by brotdocs, 2026-10-19.
  **Addendum, 2026-10-19, later:** in the table and the text above, read `tear` as `weft`
  (Doug's rename; see `weft`), so moment ② is "crease becomes a weft".

- **Addendum, 2026-10-21 — `tear` → `weft` applied in place** (brotdocs, at Doug's request via insights `to-brotdocs-msg-20261021T145420Z-0bnp`: the 10-19 read-as note was not enough, and fable's dictionary still showed "crease becomes a tear"). Wording dated 10-19 said `tear`; its history is kept in the `tear` entry. Code names now match: `brotoid_moments` returns `crossingMerges` and `weftMerges`, and `brotoid_weft` returns `.wefts` (`crossWeft`, `selfWeft`).

- **Addendum, 2026-10-23: "two crossing loops meet" is now "two rims meet"** (Doug, via insights
  `to-brotdocs-msg-20261023T112856Z-msxh`). The table row above keeps its old text. Read it as
  **two rims meet**: two rims become one, and so do their two `plate`s and two `eye`s. The
  moment is unchanged and so is its code key: `brotoid_moments` NAMES.crossingMerge now says
  "two rims meet". On the skin, the same moment is still two crossing loops meeting, because
  the crossing is the rim squared.

- **Addendum, 2026-10-25: moment ④, where a weft turns self** (insights/Orac, proved, plus fable,
  measured separately; `to-brotdocs-msg-20261019T085308Z-0z5m`, `…084819Z-j6ij`, TC ab1875e9a5
  under 089c737787; **HIGH**). **Unnamed**: the names below are placeholders until Doug has
  looked ("moments first, names after").
  - **What happens, in plain words:** at a certain r, part of a weft switches from **cross**
    (its two sheets have opposite hands) to **self** (both sheets have the same hand). Past that
    point the inside-out sheet passes through *itself*, not through the right-side-out sheet.
  - **Kind:** a **colour** moment, like ① (fable). The `hand` changes, but the bare skin gains
    no new curve and no umbrella. By contrast, ② and "two wefts join" are skin moments, where
    umbrella pairs are born or vanish.
  - **Where (insights, proved):** on each cone line d, the null direction n of J(d) lies on the
    cone itself, and d ↔ n is an involution (seam ↔ fold is one case). Each line's weft pair
    m ± t·n crosses the crossing cone at exactly one point x* = s·e, where e = d − κn is the
    third line in which the plane (d, n) meets the cone. Let ρ = |x* − q|. The weft on that line
    is cross for h < r < ρ and self for r > ρ, and it never switches back.
  - **The moments of ρ:**
    - **min of ρ: a self weft is born** in the middle of a cross weft (+1). This is ④, atom
      name '④ self weft born'.
    - **max of ρ: two self wefts meet** (−1). By the posed join/meet rule (see `join`) this is
      a join. It happens at 972 of 3000 random q.
  - **Four cone lines never turn self:** the seam (45°), the fold (135°), 109.38° and 160.50°.
    Near each umbrella ρ > r, so every weft keeps cross ends.
  - **Examples**, at |q| = 0.9 as measured (the |q| = 1 values are by the r/|q| rule, not
    re-measured):
    - q3 = (150°, 30°): ④ at r 0.54937 (0.6104 at |q| = 1).
    - (150°, 20°): 0.51573 (0.5730).
    - (60°, −25°): 0.80048 (0.8894).
    - At q = 0.9·(150°, 20°) the ruler reads: ② 0.2766, ④ 0.5157, ③ 0.9, a second ④ 1.6701.
    insights and fable agree to within 4e-6.
  - **Checks:** insights: every residual ≤ 2e-15 over 1,696 lines; the self counts match ρ's
    prediction on all 5,919 sampled r, with planted errors firing. Scripts are in
    `aicolab/tmp/rcm/moment4/`. In code: `brotoid_moments` selfBirths / selfMerges,
    `brotoid_weft` switchOn, and green ④ ticks in the explorer.
  - **Eversion** (the open item under relation above): this is the candidate. Being inside out
    is not a moment, since the orange region is there from ① and grows smoothly. ④ is where the
    inside-out sheet starts passing through itself. By the four never-self lines, no "fully gone
    through" moment exists. Whether ④ is Doug's eversion is his call, by eye at q3, r ≈ 0.610
    (|q| = 1).
## crossing

- **ours** — the line on the brotoid's skin where det J = 0: the border between keep
  (cyan) and mirror (orange). It is the place where the ball crosses the **crossing cone**,
  after squaring. The crossing cone is every point of B2 where det J = 0. It passes through
  0, does not depend on q or r, and meets each meridian in exactly one line. The skin stays
  smooth at the crossing. Only the hand changes, and colour is the only thing that shows
  it: the solid turns inside out wherever det J < 0. Each weft's two umbrellas lie on the
  crossing (see `umbrella`), but a **crease does not**. Do not call the crossing a crease.
- **label** — FALSE FRIEND, twice over:
  1. In knot theory and immersion theory a "crossing" is where a curve or surface passes
     over itself. That is our `weft` (filed then as `tear`), not our crossing.
  2. **Inside this project, until 2026-10-19, "crossing" meant the tear.** Older pages and
     handovers use it that way and stay as written (Doug: old handovers stay). Read any
     "crossing" dated before 2026-10-19 as `tear`, now `weft`.
- **standard** — the standard name is the *critical set* (or singular set) of the map:
  where its Jacobian is singular. Singularity theory would call it the fold set, but in
  this project `fold` already names the −45° plane, `i = −j`. That clash is why fable's
  page first used "crease", and why that use has since been retired (see `crease`).
- **relation** — names it replaces: "Jacobian fold" (the full instrument), "crease" (fable's
  brotoid page, to 2026-10-17), "join" / "join cone" (2026-10-17 to 2026-10-19; see the
  `join` addendum). The seam (+45°, `i + j`) and fold (−45°, `i = −j`) lines both lie in
  the crossing cone. On the seam, J's null direction is the fold direction, and on the fold
  it is the seam direction.
- **authority** — Doug, 2026-10-19 (via insights, `insights/story_20261019.md`, and fable,
  `to-brotdocs-msg-20261019T080922Z-j9ke`); the rule is from insights, TERMS_crease_explorer
  (HIGH, checked). Filed by brotdocs, 2026-10-19.

- **Addendum, 2026-10-21 — `tear` → `weft` applied in place** (brotdocs, at Doug's request via insights `to-brotdocs-msg-20261021T145420Z-0bnp`: the 10-19 read-as note was not enough, and fable's dictionary still showed "crease becomes a tear"). Wording dated 10-19 said `tear`; its history is kept in the `tear` entry. Code names now match: `brotoid_moments` returns `crossingMerges` and `weftMerges`, and `brotoid_weft` returns `.wefts` (`crossWeft`, `selfWeft`).
## crease

- **ours** — **the pre-weft** (Doug named it "the pre-tear" on 2026-10-19; `tear` became
  `weft` the same day). It is a place where the skin folds sharply but has not yet passed
  through itself. **A crease forms where a weft begins.** How it is defined:
  - For each line of the crossing cone, at most one point m could be the midpoint of two
    ball points that square to the same point. These midpoints form a curve, **G**, which
    depends only on q.
  - Let h be the distance from q to G's point on each line.
  - A crease is a **dip of h that is still above r**. Its **gap** is h − r.
  - On the skin it is a real fold. The skin's tangent squash is about k·gap (k from 0.5 to
    2.2), and its curvature grows like 1/gap². The fold sharpens to a knife edge, and when
    r reaches h the crease becomes a weft (moment ②).
  - The **ring** is the ball point nearest the crease's m, `q + (m − q)·r/h`. It is where
    the fold is sharpest and where the weft will be born.

  **A crease is not on the crossing.** The ring points toward G, away from the det J = 0
  line. Doug, 2026-10-19: *"I've not seen a crease form on a jdet=0 crossing."*
  **Example:** q = 0.9·(−62°, 4°) at r 0.245 has a crease at 112.0° with gap 0.0442
  (h 0.2892). The weft is born at r 0.2892.
- **label** — COINED, 2026-10-19, for this meaning. **The earlier meaning is retired:**
  fable's brotoid page used "crease" for the det J = 0 line, which is now `crossing`.
  Insights' own atoms dropped that use on 2026-10-18.
- **standard** — informally, a sharp fold. It is *not* a singularity of the map: at a
  crease the skin is still smooth, and nothing has happened yet. It is a near-miss whose
  size is the gap.
- **relation** — the state just before moment ②. One crease becomes one `weft` with two
  `umbrella`s.
- **seen** — (Doug) a pinch-deform region, where wefts happen. Doug also calls it "the pinch
  point-line"; see the false-friend warning in the 10-21 addendum below.
- **computed** — a dip of h along G that is still above r (gap h − r > 0). When r reaches h it
  becomes a weft (moment ②).
- **history** —
  1. to 2026-10-17 · fable · the det J = 0 line on the skin (Doug: "the crossing ride line") · retired → `crossing`
  2. 2026-10-18 · insights · a dip of h on G still above r, "the pre-tear" (filed 2026-10-19) · current
  3. 2026-10-19 · Doug · `tear` renamed `weft`, so the pre-tear is the pre-weft · current
  4. 2026-10-21 · Doug · the pinch-deform region where wefts happen · current

  Why it moved: what was first seen as one line on the crossing turned out, when computed,
  to sit off the crossing, toward G (Doug, 10-19: *"I've not seen a crease form on a jdet=0
  crossing."*).
- **authority** — insights, TERMS_crease_explorer (HIGH, checked; on-page control CREASE1
  18/18) and `insights/story_20261019.md` ("the crease is a literal fold", 12 q, 20 dips);
  the name "pre-tear": Doug, 2026-10-19. Filed by brotdocs, 2026-10-19.
- **Addendum, 2026-10-21 (Doug's ruling, filed by brotdocs) — `crease` is a CURRENT word.**
  Only its first sense is retired. Doug: *"crease moved from being the crossing ride[ge]
  line, to being the pinch deform region, and where wefts happen."* Read `tear` as `weft`
  throughout this entry (2026-10-19 rename): **a crease forms where a weft begins.** One
  crease becomes one `weft` with two `umbrella`s.
  - **Checked one to one (fable, 2026-10-21, numeric, 8 q):** 19 dips of h on G and 19
    weft births (moment ②). Each birth's r equals its dip's h, to the cone-line grid. So
    every weft is born from a crease, and every crease becomes a weft. Script:
    `aicolab/tmp/crease_weft_check.mjs` (`to-brotdocs-msg-20261021T110025Z-lnv8`).
  - **⚠ false friend in Doug's phrase:** in mathematics, *pinch point* is the standard name
    of the Whitney umbrella, which is our `umbrella`, the end of a weft. A crease comes
    before any umbrella exists. Use "pinch-deform region" for what is seen, never "pinch
    point" for the crease.
  - **Restructured the same day (brotdocs, 2026-10-21):** this addendum's seen, computed and
    history sub-bullets moved up to top-level fields, the shape fable's dictionary and
    docscmd parse (`to-brotdocs-msg-20261021T133903Z-5s5m`, `…125442Z-x3cy`). Correction
    made in the move: the first draft glossed Doug's "ride line" as "ridge line". That was
    wrong. "Ride" came from a narration's "ride along the cone" (Doug, 10-21), and Doug
    then turned "ridge" down. The loop where the ball meets the cone is unnamed, pending
    Doug's pick after fable's pictures (`/fable/proto_brim/`); candidates brim, ring, ride.
- **Addendum, 2026-10-21, later (brotdocs):** the loop is named. It is the `rim` (Doug), and
  the crossing cone itself is the `brim`. See `brim`, `eye` and `rim`. A crease is not on the
  rim, because the crease lies off the cone, toward G.
- **Addendum, 2026-10-26 (brotdocs, from insights `de3q`): "pinch" now has three senses.** The
  pinch-deform region (this entry, Doug's seen word), the pinch point (`umbrella`), and the
  `p2 pinch` (the λ = −1 root of the main body's period-2 bulb). The three are listed together
  under `p2 pinch`.

## tear

- **ours** — where the brotoid's skin passes through itself. **Nothing is torn.** The skin
  is a sphere under a continuous map, so it cannot open. A tear exists where G lies inside
  the ball (h < r). Each tear point is the image of two ball points, `x = m + t·n` and
  `y = m − t·n`, where `t = √(r² − h²)` and n is J(m)'s null direction, and `x² = y²`.
  A tear runs between two `umbrella`s. Each tear point has two sheets, each with a hand:
  - a **cross tear** (gold) has opposite hands, so cyan passes through orange;
  - a **self tear** (green) has the same hand on both sheets.

  A tear is always born a cross tear. Example: at q = 0.9·(150°, 20°), r 1.004, the tears
  read cross, self, self, cross, cross. The bright ridge Doug saw there is a self tear
  seen side-on.
- **label** — FALSE FRIEND. "Tear" suggests a rupture, and there is none. It must always
  carry "the skin passes through itself; nothing is torn". The topology of the skin never
  changes; only its image overlaps itself.
- **standard** — **double curve** (the self-intersection curve) of a map from a surface into
  3-space.
- **relation** — born from a `crease` at moment ②. Ends at two `umbrella`s. Two tears can
  join at a peak of h. Names it replaces: "rip" (fable, 2026-10-17 only), and "crossing"
  (the meaning before 2026-10-19). Code: the atom `brotoid_crossing` is being renamed
  `brotoid_tear` (Doug; insights, its planter, is doing the move).
- **authority** — insights, TERMS_crease_explorer (HIGH, checked: at q3, r 0.98, two tear
  points 1.756 apart have `x² − y² = 9e-17`); the name: Doug, 2026-10-19, via fable
  `to-brotdocs-msg-20261019T080922Z-j9ke`.
  Filed by brotdocs, 2026-10-19.

**Addendum, 2026-10-19, later the same day: renamed `tear` → `weft`** (Doug). "Tear" implied a
hole, and there is none. Read every `tear` in this group of entries (moment, crossing, crease,
umbrella) as `weft`, so cross tear is now cross weft and self tear is self weft. The full
current entry is `weft`. This entry stays so that "tear" can still be looked up, along with
its history (rip, then crossing, then tear, then weft).

**Addendum, 2026-10-22 (Doug, filed by brotdocs): `tear` and `rip` are weighed names, not
retired senses.** Doug: *"rip and tear sit in the discarded name pile, they didn't last long."*
So the "history" in the addendum above, and "Names it replaces: rip" in `relation`, are a
weighed trail: one thing given names in under two days while its word was being found. Nothing
about the thing moved. The trail now lives in weft's `weighed` field. This entry stays so that
"tear" can still be looked up, but it is not a current name and must not appear on reader pages
as one. Doug's ruling covers rip and tear only. The earlier use of "crossing" for this thing is
recorded in the `crossing` entry (label 2) and was not part of the ruling.

## weft

- **ours** — the line between two umbrellas, where the brotoid's skin passes through itself
  without cutting. Each point of it is the square of two ball points, `x = m + t·n` and
  `y = m − t·n`, with `t = √(r² − h²)`. On the ball before squaring, those points form one
  closed loop of two arcs (the x-arc and the y-arc), which meet at the two umbrellas, where
  t = 0. Squaring folds that loop in half onto the weft. **There is no hole and no edge;** the
  skin has no boundary anywhere. Each weft point has two sheets, each with a hand:
  - a **cross weft** has opposite hands: cyan passes through orange, and the inside-out
    sheet goes through the other one. This is what the flow plots show as eversion "through
    the cut";
  - a **self weft** has the same hand on both sheets.

  A weft is always born a cross weft, from a `crease` at moment ② (see `moment`). Two wefts
  join at a peak of h.

  **Example** (carried over from `tear`, added 2026-10-22): at q = 0.9·(150°, 20°), r 1.004,
  the wefts read cross, self, self, cross, cross. In insights' breakdown, run 0 is cross |
  self (keep hand) | self (mirror hand) | cross, and run 1 is cross
  (`to-brotdocs-msg-20261019T085308Z-0z5m`). fable re-checked the example against the atom
  on 2026-10-21 (`…220819Z-lo5w`).
- **label** — COINED, Doug, 2026-10-19, replacing `tear` the same day. From weaving: the weft
  thread passes through the warp without cutting it. The word was free; it appeared nowhere in
  the corpus when chosen. **Rejected:** "thirl", because it means a hole (as in nostril,
  "nose-thirl"), which is the same mistake "tear" made.
- **standard** — **double curve** (the self-intersection curve) of a map from a surface into
  3-space. One mismatch with weaving: a woven weft goes over and under many times, but the two
  sheets here cross just once, along the line.
- **relation** — every rule, example and check in the `tear` entry carries over unchanged under
  this name. "Pre-tear" for `crease` reads as "pre-weft". Code: the atom being renamed from
  `brotoid_crossing` should go straight to `brotoid_weft`, which was sent to insights on
  2026-10-19.
- **weighed** — "tear" (Doug, 2026-10-17 to 10-19). The moment was first seen as a rip, then a
  tear; weft emerged as the better fit, because nothing is torn and there is no hole (Doug,
  2026-10-22). Also weighed for the weft: rip (Doug's pick on 10-17, renamed tear the same
  evening). Sources: fable `to-brotdocs-msg-20261021T220819Z-lo5w`, `…221126Z-7khq`,
  `…221249Z-eaik`; `fable/story_20261017b.md`, `fable/story_20261019.md`.
- **authority** — the name: Doug, 2026-10-19 (chosen from a ChatGPT list; "weft" over "thirl");
  the geometry: insights, TERMS_crease_explorer (HIGH, checked). Filed by brotdocs, 2026-10-19.

## umbrella

- **ours** — each end of a weft, where h = r exactly (t = 0, so the two ball points `x` and
  `y` coincide). Every weft has exactly 2 umbrellas. Just after birth they separate with
  separation² ∝ r − h. Every umbrella lies on the `crossing`:
  - the skin's map is singular only where J's null direction n lies tangent to the skin;
  - that needs det J = 0;
  - so an umbrella is a crossing point where n is tangent to the skin.

  Insights found them this way, on the crossing where n̂·u changes sign, Newton-polished to
  a 2e-16 residual (UMB1, 2026-10-17).
- **label** — STANDARD: the Whitney umbrella (cross-cap). It is the only stable pinch that a
  smooth map from a surface into 3-space can have.
- **standard** — as above, **with one warning.** The standard cross-cap *surface* is
  one-sided: a Möbius strip with a disc glued on. The brotoid's skin has the same local
  umbrellas and double curves, but it **stays two-sided**, because it is the skin of a ball.
  It looks Möbius-like near an umbrella, but it is not a Möbius strip (insights,
  turn_through, 2026-10-17).
- **relation** — two are born with each weft at moment ②. The two inner ones vanish when
  two wefts join.
- **authority** — insights, TERMS_crease_explorer (HIGH, checked: at q3, r 0.98, every
  umbrella is on the ball to 2e-14) and `insights/story_20261017.md` (UMB1, turn_through);
  named by fable, 2026-10-17, `to-brotdocs-msg-20261017T160818Z-4r6p`. Filed by brotdocs,
  2026-10-19.
- **Addendum, 2026-10-19, later:** throughout this entry, read `tear` as `weft` (Doug's
  rename; see `weft`). So an umbrella is each end of a weft, and two wefts join. Stale line
  flagged by brotbot and fable (`to-brotdocs-msg-20261019T143645Z-ud9j`, `…144058Z-yefc`).
- **Addendum, 2026-10-26 (brotdocs):** "pinch point" here means the Whitney umbrella. It is
  not the `p2 pinch` (the main body's λ = −1 point) and not the `crease` (Doug's pinch-deform
  region). All three are listed together under `p2 pinch`.

- **Addendum, 2026-10-21 — `tear` → `weft` applied in place** (brotdocs, at Doug's request via insights `to-brotdocs-msg-20261021T145420Z-0bnp`: the 10-19 read-as note was not enough, and fable's dictionary still showed "crease becomes a tear"). Wording dated 10-19 said `tear`; its history is kept in the `tear` entry. Code names now match: `brotoid_moments` returns `crossingMerges` and `weftMerges`, and `brotoid_weft` returns `.wefts` (`crossWeft`, `selfWeft`).
## brim

- **ours** — the crossing cone, as a picture. The ball is a hat's crown and the crossing
  cone is its brim. Same object as the crossing cone: every point of B2 where det J = 0. It
  passes through 0 and does not depend on q or r. **"Crossing cone" stays the math name;**
  brim is the picture word.
- **label** — COINED, status posed (Doug, 2026-10-21; it holds for shape).
- **standard** — the critical set of the squaring map (see `crossing`).
- **relation** — the ball's sphere cuts the brim along the `rim`. The part of the brim inside
  the ball is the `eye`. Squared, the rim lands on the `crossing`.
- **seen** — (Doug) *"brims can be floppy but plate out"*; *"how the bristorian plate looked,
  quite twisted at times."*
- **computed** — det J(x) = 0. Why the word holds for its shape (fable, measured, not checked
  by brotdocs):
  - The brim is nearly flat. Every one of its 1440 lines lies within 20.1° of one plane
    (median 12.2°, normal (1, i, j) ≈ (0.939, 0.244, −0.244)).
  - It crosses that plane 6 times per turn (three ripples).
  - It twists most at the fold line (2.83° per degree at 134.9°). It is flat at the seam
    (45°) and at 109.4° and 160.5°.

  Scripts: `aicolab/tmp/proto_brim/cone_flat.mjs`, `twist.mjs`.
- **weighed** — "brim" for the loop where the ball meets the cone (brotdocs' reading, shown on
  fable's page as "brim (proposed)", 2026-10-21). Doug had seen the cone itself as the brim.
- **authority** — Doug, 2026-10-21, via fable `to-brotdocs-msg-20261021T171312Z-12ij`, and
  `fable/web/proto_brim/SPEC.md` (B5, B7). Filed by brotdocs, 2026-10-21.
- **Addendum, 2026-10-23: the brim is the whole cone, inside the rim and out** (Doug, 10-23,
  posed). Doug: *"the term brim is having two identities."* The cause: the pages filled only
  the brim's piece inside the rim, and labelled it "eye (brim inside the rim)". So the only
  brim a reader saw was inside the rim, while the filing said the whole cone. The fix is to give
  that piece its own word, the `plate`. "Brim" now always means the whole crossing cone, and
  most of it lies outside the ball. Picture: `fable/web/proto_hat/` (Fig 4 is the hat; reading A).

## plate

- **ours** — the part of the `brim` inside the ball |x − q| < r: the piece of brim that the
  `rim` encircles. It is the stuff; the `eye` is the gap. Take the plate out and the brim
  has a hole there, which is the eye. On a hat the plate is the brim's piece under the crown.
  A real hat has none, but ours does (fable's proto_hat notes this).
  - Before moment ③ the plate is small and off 0. At some q there are two plates, each with
    its own rim, until two rims meet (see `moment`).
  - From ③ the plate holds 0, and the brim's three ripples show in it (see `brim`, computed).
  - Squared (x² − q²), it is fable's **bristorted plate**, and its rim lands on the `crossing`.
  - Its two faces (fable, proto_brim B10): pink where the brim's top faces you, violet where
    its underside does.
- **label** — COINED, status posed (Doug, 2026-10-23). ⚠ Keep it apart from "plate" in its
  everyday senses (a dish, a sheet of metal). fable's earlier "eye plate" and "plate toggle"
  (proto_brim, 10-21/22) mean this plate.
- **standard** — no standard name. It is the part of the critical set inside a ball.
- **relation** — the plate and the eye fill the same place: one is what is there, the other
  is the gap it leaves. The rim edges both of them. The brim is the plate plus the rest of the
  cone.
- **seen** — (Doug, 10-23) *"the 'plate' is the part of brim encircled by the rim, with the eye
  being the hole[s] edged by the rim"*; earlier (10-21) *"how the bristorian plate looked,
  quite twisted at times."*
- **computed** — {x : det J(x) = 0, |x − q| < r}. This is the set filed for `eye` on 10-21; the
  set now has this name.
- **weighed** — "plate" as a shape word for the brim's three-lobed pringle (brotdocs' lean,
  10-23, reading B on proto_hat). Doug's terms picked reading A. The brim's shape has no word
  of its own; "nearly flat, three ripples" is what is on file.
- **authority** — Doug, 2026-10-23, verbatim via fable `to-brotdocs-msg-20261023T092903Z-swne`.
  Doug then confirmed in session with brotdocs: *"the brim rim, plate and eye are good terms,
  what you view here"*, after viewing `fable/web/proto_hat/`. Filed by brotdocs, 2026-10-23.

## eye

- **ours** — the part of the `brim` inside the ball |x − q| < r: the hole in the hat. Its edge
  is the `rim`. On each cone line the eye is one span from A to B, where A and B are the two
  points at which the sphere crosses that line. The eye is made of those spans; fable's page
  draws it that way.
- **eye length** — on the cone line with unit direction d:

  |A − B| = 2√(r² − ℓ_d²), where ℓ_d is the distance from q to that line.

  It is 0 when the rim first touches the line (r = ℓ_d) and grows with r: A and B ride apart
  along the line. The eye is not round, so an eye length is always along one named line.
  **The longest eye length is on the cone line nearest q** (least ℓ_d). This follows from the
  formula (algebra, HIGH), and fable measured the same (`eye.mjs`). That span is the eye's
  true diameter only at some q: the eye's widest chord need not lie along a cone line
  (fable, measured, `to-brotdocs-msg-20261021T181027Z-m9qw`). The brim is one twisted sheet
  through 0 (board node 2f8a4dc483); it tilts up to 52.2°.
- **label** — COINED, status posed (Doug, 2026-10-21). ⚠ Rendering docs use "the eye" for
  the viewer's eye (e.g. `rendering.lattice_artifacts`). Write "the eye of the brim" at first
  use.
- **standard** — no standard name. It is the part of the critical cone inside a ball.
- **relation** — the eye is born as one point at moment ①, when the ball first touches the
  brim. From ③ it contains the cone's apex, 0.
- **seen** — (Doug) *"eye is the hole in go"*; *"the surface brim cut layer within the
  bandline."*
- **computed** — {x : det J(x) = 0, |x − q| < r}.
- **weighed** — "ride", for A and B's track along one line (Doug, 2026-10-21: *"the
  ring|ridge|ride that the r rides"*). Doug, the same day: *"A B ride, more eye length."*
- **authority** — Doug, 2026-10-21 (proto_brim SPEC B7, and in session with brotdocs). Formula
  from fable's `ride()` in `fable/web/proto_brim/index.html`: s = q·d ± √((q·d)² − |q|² + r²),
  so |A − B| = 2√(r² − ℓ_d²) (algebra, HIGH). Filed by brotdocs, 2026-10-21.
- **Addendum, 2026-10-23: the eye is the hole, and the stuff in it is the `plate`** (Doug,
  posed). The eye is now **the hole the rim edges**: the brim with its plate taken out. The
  10-21 "ours" above gave the eye the brim's own points, "the part of the brim inside the ball".
  That set is now the `plate`. The place does not move, and neither does "the hole in the hat",
  Doug's first word for it. What changes is that the stuff and the gap get one word each.
  Eye length, eye count, "two eyes" and the eye's birth at ① all read the same, because a span
  across the hole from A to B is the plate's chord on that line. The 10-21 sense ("the brim
  inside the ball") was posed, not settled, so it counts as weighed under the Labels rule, not
  history. The label "eye (brim inside the rim)" on fable's proto_brim is the wording that
  caused the confusion; see the `brim` addendum.
- **Addendum, 2026-10-24: the eye is drawn filled** (fable, `to-brotdocs-msg-20261023T135201Z-ltdn`,
  its view of reading A: "no problem", one wording seam). Now that the hole has its own word,
  a reader may expect the eye to look empty in a picture. Ours always draw it filled, because the
  pink and violet sheet is the plate, and the plate fills the eye. So captions say so, and eye
  length (A to B) is measured across the hole, along the plate's chord. The maths does not move.
  Reading A is now on brotoid §8 and proto_brim (label "plate (the brim inside the rim)").

## rim

- **ours** — the closed loop where the ball's sphere |x − q| = r meets the `brim`: the edge of
  the `eye`.
  - On the sphere, it is exactly where keep (cyan) meets mirror (orange).
  - It is born at moment ① as one point and reaches 0 at ③.
  - Every point of the brim lies on exactly one rim, the one with r equal to its distance from
    q. So as r grows, the rims sweep the brim like contour lines.
  - Squared, the rim lands on the `crossing`: **the crossing is the rim squared.**
- **label** — COINED, status posed (Doug, 2026-10-21). Two warnings:
  1. In rendering, "rim light" is Fresnel edge glow at grazing angles
     (`rendering.shading`, godot_brot's shader). That is unrelated.
  2. "rim" is inside "brim", so a text search for one finds the other. Write "the rim of the
     eye" at first use.
- **standard** — the sphere's intersection with the critical set. Its image is the curve of
  critical values on the skin.
- **relation** — not a `crease`; a crease lies off the brim, toward G.
- **computed** — {x : det J(x) = 0, |x − q| = r}.
- **weighed** — "bandline" (Doug, 2026-10-21: the hat band, where crown meets brim; it was
  replaced the same day, once the eye made the loop a hole's edge). Also weighed for the loop:
  brim (brotdocs' reading), ring, ridge (Doug turned it down), ride.
- **authority** — Doug, 2026-10-21, in session with brotdocs; the loop and its contour property
  are from fable `to-brotdocs-msg-20261021T171312Z-12ij` and proto_brim SPEC B1. Filed by
  brotdocs, 2026-10-21.
- **Addendum, 2026-10-22 (brotdocs): the rim can be two loops.** "The closed loop" above holds
  only between merges. The moment table has "two crossing loops meet" (see `moment`), and the
  crossing is the rim squared, so before that moment the rim is two loops, and squared, they are
  the two crossing loops. The moment's wording is right as it stands: it describes the skin, and
  the rim is on the ball. Read the merge on the ball as "two rim loops meet". Raised by fable
  (`to-brotdocs-msg-20261022T161857Z-pveg`). MEDIUM: this follows from the filed entries; it has
  not been computed.
- **Addendum, 2026-10-23: two rims, not one rim of two loops** (Doug).
  - **The rim edges both the `plate` and the `eye`.**
  - **Count one rim per plate.** Doug's words are *"two eyes and two rims"* (proto_brim B8,
    10-21) and the moment *"two rims meet"* (10-23, via insights `msxh`). So before a merge
    there are two rims; each is one closed loop. The 10-22 wording "the rim is two loops"
    above is superseded.
  - **The computed set is unchanged.** It is the union of the rims.
  - **fable's proto_hat already counts this way:** at q (130°, 70°) and r/|q| 0.88 it shows
    2 eyes and 2 rims, and at r/|q| 1.3 it shows one.

## cusp

- **ours** — the cusp of the main body (P1): the end of the body where the fixed point's
  multiplier is λ = +1. In B2 it is the apex c = ¼ of the **cusp cap**, the λ = +1 patch of
  the P1 body. **In B2 the cusp is not a point but a cone:** straight lines out of c = ¼
  (straight to 1e-16 on 72 lines), because c = ¼ − (z − ½)², and squaring a line through 0
  gives a ray.
- **label** — STANDARD.
- **standard** — in ℂ, the main body of zᵖ + c is the epicycloid c = z − zᵖ on |p zᵖ⁻¹| = 1.
  It has p − 1 cusps, where λ = +1: a saddle-node, and the curve's speed is 0 there.
  Cardioid (p = 2): c = ¼. Nephroid (p = 3): c = ±2/(3√3) ≈ ±0.3849.
- **relation** — the opposite end of the main body from the `p2 pinch` (λ = +1 against
  λ = −1). In ℂ, cusps and p2 pinches alternate round the body, p − 1 of each. **A cusp is
  not a pinch point** (see the false friend under `p2 pinch`).
- **computed** — in B2:
  - F = z − z² folds over itself at the cusp: det(I − J) = 0. The triple point is z = ½,
    where J = I.
  - About 85% of the cusp cap is hidden by the second sheet (509 of 600 points), so most of
    it is not skin. The cap has three spokes, in the sectors between the trefoil's leaves.
  - Through the cusp cap a fixed point persists (43 of 60 steps outward): stability passes
    onto the off-plane sheet, which is why the cap is hidden.
  - On cardioid_vs_brotoid Fig 16, the cusp band is mostly in the B2 P1, held by an off-plane
    still point (insights LEDGER #216).
  - The cusp cap is 0.33% of the attractor census (λ_⊥ > +1).
- **authority** — insights, `NOTE_p1_body_analytic_20260928` (§3 real caps, §4 trefoil, §5 skin
  table, §7 beyond the surface), `insights/web/cardioid_vs_brotoid/` Figs 11–16 (the straight edge c₀ = ¼ + ¾ c₁),
  `math.bristorian_attractor_census`. Multipliers checked by insights numerically (¼ → +1,
  ±0.3849 → +1, both PASS) and by brotdocs by hand, HIGH. Requested by Doug via insights,
  `to-brotdocs-msg-20261026T105652Z-de3q`. Filed by brotdocs, 2026-10-26.

## p2 pinch

- **ours** — the root of the period-2 bulb: the point on the main body where λ = −1. In B2
  it is the apex c = −¾ of the **pinch cap**, the λ = −1 patch, whose shape is the
  **trefoil** (three leaves).
- **label** — COINED: our name for a standard place. Always write "p2 pinch", never a bare
  "pinch" or "pinch point" (see the false friend below).
- **standard** — in ℂ, the bulb root at λ = −1, where period doubling happens and the head
  (P2) attaches. **The boundary curve is smooth here.** What pinches is the set: P1 and P2
  meet at one point, which is a cut point. Cardioid: c = −¾. Nephroid: c = ±4i/(3√3) ≈
  ±0.7698i, between the two cusps.
- **relation** — the opposite end from the `cusp`.
  - **⚠ false friend, three ways.** "Pinch" names three different things in this project:
    1. **p2 pinch** (this entry): the λ = −1 bulb root of the main body.
    2. **pinch point**: in mathematics, the Whitney umbrella. That is our `umbrella`, the end
       of a weft.
    3. **pinch-deform region**: Doug's seen word for the `crease`, where a weft begins.
  - None of the three is the `cusp`.
- **computed** — in B2:
  - The trefoil is all true skin: 0 of 600 points hidden.
  - Its edge curves (0.055 off straight), unlike the cusp's straight cone.
  - On cardioid_vs_brotoid Fig 16, the pinch band is held by a saddle alone: 0 green
    pixels, 2 still points, and off-plane starts escape (insights LEDGER #216).
  - **P2 attaches at the p2 pinch; the rest of the trefoil grows no bulb** (insights, 10-27,
    filed by brotdocs). The p2 pinch (the apex, c = −¾) is where P2 attaches, in B2 as in ℂ:
    the family-A P2 shell has its node there (ν = 0, "where P2 touches P1"), and 1500/1500 of
    cloud's independent p2 points lie inside that shell (control: the same points pushed ×1.6
    out give 19.9%, so the test can fail) — HIGH (`NOTE_p1_body_analytic_20260928` §8–9).
    The rest of the trefoil is λ = −1 too, but no period-2 bulb grows through it: the leaf
    sticks out past the attached P2 body — MEDIUM. Two methods agree: the 09-28 step-out (60
    points per patch, two step sizes) and T-134 (monodromy ring, plan filed first;
    `RESULT_T134_flip_caps_20261002.md`), which finds a 3-leaf flip cap at P1, P2 and P4,
    leaves at 78.5° / 191.5° / 315°, cap ratios → Feigenbaum δ. Just past a leaf is a gap
    (points escape or wander, f 0.1–0.5); further out (f 2.0) they re-enter the attached
    doubled body from the side (spectral radius 0.975–0.995). It stays MEDIUM because the
    P-5 gap diagnosis was made after the fact. Not claimed: beyond ~15× cap scale, or P8 at
    ρ₀ > 0.02.
  - **On the flat planes:** the i = 0 and j = 0 planes square exactly as ℂ, so the exact
    Mandelbrot holds there, and the fold y = −w carries a √7-sheared copy (e = (0, 1, −1),
    e² = e − 2, discriminant −7; `geometry.symmetry` § The i = -j Symmetry Plane). Each has
    its P2 bulb at −¾ (insights, 10-27, HIGH: leak 0 on 2000 points, while planted planes
    leak 8–9; `aicolab/tmp/rcm/p2pinch_planes.py`).
{% notation.p2_pinch_superseded_20261027 %}
status: archived

  Superseded 2026-10-27 (insights, fx7i): the last sentences below mixed the apex with the
  leaves. P2 does attach at the p2 pinch itself; only the off-apex leaves have no bulb.
  - **No period-2 bulb past the trefoil** (insights, 09-28, MEDIUM: 60 points per patch, two
    step sizes, B2 only). In ℂ, a step past −¾ lands in the P2 disc. In B2, a step out
    through the trefoil escapes or wanders (chaos, or a Lyapunov exponent near 0), and none
    of the 60 lands on a cycle. So in B2 off the plane, "p2 pinch" names the λ = −1 place,
    not a place where P2 attaches. On the i = 0 and j = 0 planes the exact Mandelbrot holds,
    and so does its P2 bulb at −¾.
{% endnotation.p2_pinch_superseded_20261027 %}
- **authority** — insights, `NOTE_p1_body_analytic_20260928` (§3: "s = −1: apex maps to
  c = −¾, the p2 pinch"; §4 trefoil; §5 skin table; §7 beyond the surface),
  `insights/web/cardioid_vs_brotoid/` Fig 16 and LEDGER #216. Multipliers checked by insights
  numerically (−¾ → −1, ±0.7698i → −1, both PASS) and by brotdocs by hand, HIGH. Requested by
  Doug via insights, `to-brotdocs-msg-20261026T105652Z-de3q`. Filed by brotdocs, 2026-10-26.
- **Note:** the 09-28 note calls the ridges where a cap meets the pair surface "sharp
  creases". That predates the project sense of `crease` (10-19) and means a sharp edge, not a
  pre-weft.

## Remaining scope

**In, not yet done:** the reviewer's other ~16 blocked terms, plus everything already in
`notation.glossary` and fable's player glossary, plus every term carrying a result in
`reference.canonical` — roughly 40 terms total. Known gaps from both existing glossaries,
confirmed absent by direct search: `bristorbrot`, `bristorian`, `member`, `B7`, `non-normed`,
`median off-plane`, `absorbed`, `kernel`, `canonical` (used once, as a plain adjective, never
defined as a term). `corank`, `elliptic`, `isometric` are already covered by fable's glossary
and don't need re-entry here. Also flagged for the same check, not yet run: `split`.

**Out, by design:** ordinary English; agent/tool names; anything appearing once and never
carrying a claim.

**Access path — the actual point of the exercise.** A map nobody consults during writing
doesn't prevent drift, because the agent who has drifted doesn't know to look anything up.
Proposed: a one-word lookup command (`brot-term <word>` or `docscmd --term <word>` — see
relay thread with tools, 2026-08-10) that prints the five fields for a term, discoverable the
same way `brot-help` is — listed in `brot-help`'s own table and hit during warmup, not just
buried in a doc an agent has to think to open. Not yet built.

**A second, harder layer — flagged, not scoped.** A write-time check that flags FALSE FRIEND
terms used without their warning, or a non-canonical variant of a canonical term, in a doc
being filed. This is where drift is actually caught (a respawned agent using last life's name
for something, or coining a new one for an object that already has one) — lookup alone only
helps a writer who already suspects a word is load-bearing. Not designed yet.

*Source: Orac (insights), 2026-08-10, BRIEF + addendum on access path (Doug's framing: this is
continuity tooling across one agent's lifespans, not just inter-agent — a respawned instance
can rename an object with no custodian noticing, because nothing in the handover/story/
character.md stack owns naming). Filed by brotdocs same day.*
