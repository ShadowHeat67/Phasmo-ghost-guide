window.GUIDES = {
  setup: [
    ["Crucifix first, where you stand", "It leaves a dead zone where a hunt cannot start on top of you. Demon range is 50% bigger, enraged Gallu 2m smaller."],
    ["Three salt piles in a loose circle near the ghost room", "Wraith never steps in salt. Gallu skips salt while enraged. Two piles stepped in 2s+ apart rules out Gallu."],
    ["Incense on hand and a smudge timer every time", "Use the timer in the tools panel: under 90s is Demon, under 180s is not Spirit."],
    ["Touch nothing for the first hunt", "A flat 3.0 m/s hunt with no build-up is the Deildegast tell. Moving items before that hunt hides it."],
    ["Electronics on, far from the ghost when a hunt starts", "Running straight to you rules out Yokai. No instant speed-up near your gear rules out Raiju."],
    ["Bring motion sensors, a second incense, a firelight, a video camera and a switch to flick", "Firelight for Onryo, camera for Mimic orbs and Goryo DOTS, switch for Mare."]
  ],
  order: [
    ["Hunt start speed", "Plain 1.7, slightly off (1.45 to 1.96), or extreme (0.4, 1.0, 2.75, 3.0)? Play the speeds tab to train your ear."],
    ["Does it build speed the longer it sees you?", "Deildegast, Deogen, Hantu, Kormos, Revenant and Thaye never do. Dayan only from 10m+."],
    ["Did anyone touch items before this hunt?", "Fast hunt after an untouched house, slower after a messy one: Deildegast."],
    ["Footsteps", "Myling cuts out beyond 12m and sounds soft; everything else stomps."],
    ["Blinking in a hunt", "Oni very visible, Phantom nearly invisible, Obake swaps model for one blink."],
    ["Events", "A singing event rules out Shade. A mist event rules out Oni and Kormos."],
    ["Salt", "Any pile disturbed rules out Wraith."],
    ["Smudge timer", "Hunt before 180s rules out Spirit; before 90s is Demon."],
    ["Last tests", "Mare light flicks, Onryo candle, Yokai hearing, Yurei doors, Thaye Ouija age."]
  ],
  tests: [
    { title: "Speed and line of sight", cols: ["What you see", "Points to or rules out"], rows: [
      ["Hunt starts at a plain 1.7 m/s", "Rules out Aswang, Deogen, Obambo, Revenant, Thaye, The Twins, Moroi at low sanity, and Deildegast if no items were touched"],
      ["Speed builds the longer it sees you", "Rules out Deildegast, Deogen, Hantu, Kormos, Revenant, Thaye, and Dayan within 10m"],
      ["Flat 3.0 m/s from the start, no build-up, never slows near you", "Deildegast (nothing touched since the last hunt)"],
      ["Fast far away, crawling when close", "Deogen: 3.0 then 0.4"],
      ["Crawl, then an instant sprint when it notices you", "Revenant (1.0 to 3.0) or Kormos (2.21 when it hears you 5m+)"],
      ["Instantly fast near your active electronics", "Raiju. No speed-up with gear on rules it out"],
      ["Fast from distance with breaker on, normal within 3m", "Jinn: 2.5 to 1.7"],
      ["Speed rises when you move and drops when you stop, within 10m", "Dayan: 2.25 moving, 1.2 still"],
      ["Speed shifts between rooms with no cause", "Hantu (temperature)"],
      ["Speed jumps mid-hunt between 1.45 and 1.96", "Obambo"],
      ["Faster each hunt as sanity drops, still builds LOS", "Moroi"],
      ["Slower each hunt, never builds LOS", "Thaye"]
    ]},
    { title: "Smudge, cooldown, salt and crucifix", cols: ["Test", "Result"], rows: [
      ["Smudge timer", "Hunt before 90s: Demon. Before 180s: not Spirit"],
      ["Cooldown after a hunt or crucifix burn", "Hunt in under 25s: Demon"],
      ["Salt circle, three piles", "Any pile stepped in: not Wraith. Two piles stepped in 2s+ apart: not Gallu"],
      ["Salt under a Tier 1 or 2 motion sensor", "Sensor fires, salt untouched: Wraith"],
      ["Three salt rows, incense after the first", "First disturbed, the rest not: Gallu"],
      ["Smudge with sensors at the exits", "Leaves the room inside 90s: not Yurei"],
      ["Crucifix burns from a neighbouring room", "Normal. Even a Shade can do it from next door"]
    ]},
    { title: "Fire (Onryo)", cols: ["Test", "Result"], rows: [
      ["Relight a Tier 1 or 2 candle right after it is blown out", "Blown out again within 20s: Onryo"],
      ["Hunt starts right next to a lit flame", "Not Onryo"],
      ["Crucifix burns while a covering candle is lit", "Not Onryo"],
      ["Ghost lights a flame", "Not Onryo"]
    ]},
    { title: "Lights, breaker and electronics", cols: ["Test", "Result"], rows: [
      ["Flick a light on within 4m of the ghost", "Instantly off, repeatedly: Mare"],
      ["Ghost turns a light on", "Not Mare"],
      ["Flicker with EMF at the switch", "Not Mare"],
      ["Breaker off during a hunt", "Visible breath: Hantu. Ghost turns it on: not Hantu"],
      ["Ghost turns the breaker off itself", "Not Jinn"],
      ["Talk or key chat beyond 2.5m in a hunt", "It never comes: Yokai"]
    ]},
    { title: "Events, visuals and sound", cols: ["Observation", "Result"], rows: [
      ["Singing event (a short hum does not count)", "Not Shade"],
      ["Mist (airball) event, actually seen", "Not Oni, not Kormos"],
      ["Any chasing event", "Not Kormos"],
      ["Male model or name", "Not Banshee, not Dayan"],
      ["Very visible in a hunt", "Oni"],
      ["Nearly invisible in a hunt", "Phantom"],
      ["Model changes for one blink", "Obake"],
      ["Cannot hear it 12m to 20m away", "Myling"],
      ["Items fly far, constantly, in a hunt", "Poltergeist"],
      ["Door left partly open outside a hunt (not lockers)", "Not Yurei"],
      ["Changes favourite room", "Not Goryo"],
      ["Orbs in the favourite room on 0 evidence", "The Mimic"],
      ["Ouija age goes up, or 90+", "Thaye"],
      ["Unique scream on parabolic mic", "Banshee"]
    ]}
  ],
  changes: [
    ["v0.18.0.0", "21 Jul 2026", "New ghost: Deildegast (EMF 5, Ghost Writing, D.O.T.S). The old sheet filed it under \"no clear match\"."],
    ["v0.18.0.0", "21 Jul 2026", "Raiju's louder heartbeat was a bug and was removed. The YouTube video was right; the old site data was stale."],
    ["v0.18.0.0", "21 Jul 2026", "Phantom can no longer roam to dead players or players outside. The front-door EMF test is gone."],
    ["v0.18.0.0", "21 Jul 2026", "All ghosts could copy the Yurei's door ability. Fixed, so exit-door tells are reliable again."],
    ["v0.18.0.0", "21 Jul 2026", "Kormos: no longer hears players in the post-hunt grace period or through incense, no wrong-floor chases, no kills through walls."],
    ["v0.18.0.0", "21 Jul 2026", "Obake shapeshifts now count toward the ghost video objective."],
    ["v0.19.0.0", "25 Aug 2026", "Oni singing events now drain 20% like its other events (was 10%)."],
    ["v0.19.0.0", "25 Aug 2026", "Delayed door-closing sounds that were mistaken for Yurei fixed."],
    ["v0.19.0.0", "25 Aug 2026", "Custom difficulty can pick a ghost type (0x multiplier). Use it to practise every test here."],
    ["v0.19.0.1–2", "Sep 2026", "Equipment, VR and console fixes. No ghost behaviour changes."]
  ],
  video: [
    ["Raiju heartbeat", "Said the louder heartbeat was removed", "Correct. Removed in v0.18.0.0"],
    ["\"Dildos\" ghost", "Starts fast, loses 0.1 m/s per object, down to 0.4", "Correct. This is the Deildegast"],
    ["Thaye threshold", "About 70% when young", "75% by data, about 74% in practice due to a known bug"],
    ["Jinn boost", "Fast \"from a distance\"", "Needs breaker on, LOS, and you more than 3m away"],
    ["Poltergeist and candles", "A ghost that lights a candle is not a Poltergeist", "No such Poltergeist rule. Only Onryo is known to be unable to light flames"]
  ]
};
