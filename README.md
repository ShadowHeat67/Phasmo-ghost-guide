# Phasmo Ghost Guide

An interactive Phasmophobia ghost identifier, checked against game version **v0.19.0.2** (data checked 3 Oct 2026).

## Features

- All 30 ghosts, including the Deildegast (added v0.18.0.0)
- Evidence filter with found / ruled-out states and 3, 2, 1 or 0 evidence difficulties (handles guaranteed evidence and Mimic fake orbs)
- Speed, line-of-sight and hunt-sanity filters
- Playable footsteps for every hunt speed, synthesized in the browser at the ghost's real step tempo
- Hunt pattern demos: LOS build-up, Revenant, Deogen, Jinn, Raiju, Dayan, Deildegast
- Speed tables for Hantu (temperature), Moroi (sanity), Thaye (age) and Deildegast (items touched)
- Smudge and hunt cooldown timers, tap-tempo speed finder
- Per-ghost tests (definitive vs hint), rule-outs, known bugs, misconceptions and recent patch changes

### Keyboard

| Key | Action |
| --- | --- |
| 1 to 7 | Cycle evidence (unknown, found, ruled out) |
| T | Tap tempo |
| S / C | Start or stop smudge / cooldown timer |
| / | Search |
| Esc | Close panel or stop sound |
| Shift + R | Reset everything |

## Run it

No build step. Open `index.html` in a browser, or host with GitHub Pages:
Settings, Pages, Deploy from a branch, `main` / root.

## Editing ghost data

All ghost facts live in `js/ghosts.js` and guide tables in `js/guides.js`. Update `GAME_VERSION` and `DATA_DATE` at the top of `ghosts.js` when you recheck after a patch.

## Speed to tempo

Step interval in seconds = `1 / (speed × ghost speed setting) − 0.075`, the same conversion the Zero-Network cheat sheet uses. Line-of-sight max is 1.65× base over 13 s (8.667 s for Aswang).

## Sources

- Kinetic Games patch notes v0.18.0.0 to v0.19.0.2
- Zero-Network Unofficial Phasmo Cheat Sheet (open wiki text, Sep 2026, and its v0.17.1.5 data snapshot)
- Phasmophobia Fandom wiki (Deildegast)

Text is written for this project, not copied. Not affiliated with Kinetic Games. Phasmophobia is a trademark of Kinetic Games Limited. No game audio is included.
