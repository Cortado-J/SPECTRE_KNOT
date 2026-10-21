# The Spectre Knot

A single-strand Celtic knot on the spectre aperiodic monotile: one tile, one ribbon design, and across the spectre tiling drawn on the site (the nest tiling) the pieces join into one endless strand.

Made with AI (Claude, by Anthropic): how is on `made.html`; what has been checked is on the proof site, https://cortado-j.github.io/SPECTRE_KNOT_PROOF/#checked. The paper has not been peer reviewed. Justin Roughley is the author and is responsible for the work; the AI is not an author.

This repository is the published website (GitHub Pages). It is generated; the sources live in a separate development repository (`site/src`, built by `publish_site.sh`).

- `index.html`: home, with the zoom from one tile out to 34,649 tiles
- `see.html`: watch the strands join, one block at a time
- `understand.html`: questions and answers, with diagrams, in five sections (`understand-*.html`)
- `make.html`: the fold-up tile and the downloads
- `prove.html`: the proof, at four depths
- `made.html`: how AI was used, and who did what
- `about.html`: how it was made, credits, citing
- `downloads/`: the A4 handout, the cut-out page, and the tile as a large PNG
- `assets/`, `data/`, `img/`: styles, scripts, drawing data and pictures

Our paper (the write-up of the proof), its programs and logs, and the Lean formalisation are on the proof site,
https://cortado-j.github.io/SPECTRE_KNOT_PROOF/ (repository `Cortado-J/SPECTRE_KNOT_PROOF`).

The spectre tile is due to David Smith, Joseph Samuel Myers, Craig S. Kaplan and Chaim Goodman-Strauss ([*A chiral aperiodic monotile*](https://arxiv.org/abs/2305.17743), Combinatorial Theory 4(2), 2024). Justin Roughley came up with the original idea of looking for a mono-stranded aperiodic knot, and then used AI to search for it (2026).

Fonts: Figtree in `assets/fonts/` (SIL Open Font License, `assets/fonts/Figtree-OFL.txt`); the handout and tile embed TeX Gyre Pagella (GUST Font License).

Licence: the text, pictures, handout and paper are CC BY 4.0 (`LICENSE-CONTENT.md`); the code is MIT (`LICENSE`).
