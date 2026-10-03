/*
 * Ghost data for Phasmophobia v0.19.0.2 (16 Sep 2026).
 * Written for this project from: Kinetic Games patch notes (v0.18.0.0 to v0.19.0.2),
 * the Zero-Network cheat sheet's open wiki strings and v0.17.1.5 data snapshot,
 * and the Phasmophobia Fandom wiki. Text is paraphrased, not copied.
 *
 * Field guide
 *  evidence:   evidence keys (see EVIDENCE in app.js)
 *  guaranteed: evidence always shown when at least 1 evidence is given
 *  speeds:     playable speeds [{v, label}] in m/s at 100% ghost speed
 *  range:      true if speed varies continuously between min and max
 *  los:        true = standard LOS speed-up (x1.65 over 13s), false = none
 *  sanity:     {base, min, max} hunt thresholds in average-sanity percent
 *  pattern:    optional named footstep demo (see PATTERNS in app.js)
 */
window.GAME_VERSION = "v0.19.0.2";
window.DATA_DATE = "3 Oct 2026";

window.GHOSTS = [
{
  id: "aswang", name: "Aswang",
  evidence: ["freezing", "writing", "dots"],
  speeds: [{ v: 1.53, label: "base" }],
  los: true, losTime: 8.667,
  sanity: { base: 50, min: 50, max: 50 },
  tells: [
    "Ends the hunt instantly if it walks into an official hiding spot that a detected player is inside.",
    "After a hunt ends that way, the next hunt starts with it walking straight to that player, even during the grace period.",
    "Hits max LOS speed in about 8.7s instead of the usual 13s."
  ],
  confirm: [
    { t: "While it has LOS on you, get into a hiding spot. If the hunt stops the moment it reaches your spot, it is an Aswang.", def: true },
    { t: "Put salt or motion sensors near the ghost room. If it walks through them during a hunt's grace period, it is an Aswang. A cursed possession hunt shortens the grace period to 1s.", def: true }
  ],
  ruleOut: ["The hunt starts at a flat 1.7 m/s."],
  extra: [
    "The hunt only ends if it enters the same hiding spot you are in. Seeing you go in is not enough.",
    "Slightly slow start (1.53 m/s, 90% of normal) is easy to mistake for a normal ghost, so compare against the 1.7 m/s sound below."
  ]
},
{
  id: "banshee", name: "Banshee", female: true,
  evidence: ["uv", "orbs", "dots"],
  speeds: [{ v: 1.7, label: "base" }],
  los: true,
  sanity: { base: 50, min: 12, max: 87, note: "50% of its target, which can mean 12% to 87% team average" },
  tells: [
    "Female only. A male model or name rules it out.",
    "33% chance of a unique scream on the parabolic microphone or sound recorder.",
    "Hunts on its target's sanity, not the team average, and only chases its target if they are inside.",
    "Its target loses 15% sanity touching it during a singing event (normally 10%)."
  ],
  behaviours: [
    "Prefers singing events.",
    "Roams toward its target while in DOTS state.",
    "66% chance to stalk its target without leaving EMF. It cannot stalk between floors, except single-room basements."
  ],
  confirm: [
    { t: "Hear the unique scream on a parabolic mic.", def: true },
    { t: "In multiplayer, everyone stays inside for a hunt. If it ignores non-targets, or a non-target can touch it and live, it is a Banshee.", def: true },
    { t: "Motion sensors show it keeps wandering toward the same player.", def: false }
  ],
  ruleOut: ["Male ghost model or male name."],
  extra: [
    "Targeting: a random player is chosen at the start (always the host in solo). It changes when any player dies or the target leaves. Known bug: it can switch target after killing anyone, not just the target.",
    "Anyone can hear the scream on the parabolic mic, not only the target.",
    "Known bug: if the target dies using the Monkey Paw's wish for life while above 50% sanity, the Banshee may never hunt again until someone else dies."
  ]
},
{
  id: "dayan", name: "Dayan", female: true,
  evidence: ["emf", "orbs", "spiritbox"],
  speeds: [{ v: 1.2, label: "you stand still" }, { v: 1.7, label: "everyone 10m+ away" }, { v: 2.25, label: "you walk" }],
  los: "partial", losNote: "Only while every player is more than 10m away. Inside 10m it still builds in the background.",
  sanity: { base: 50, min: 45, max: 65, note: "65% if you walk near it, 45% if you stand still near it" },
  pattern: "dayan",
  tells: [
    "Female only.",
    "Within 10m in a hunt, its speed follows the nearest player: 2.25 m/s if they walk, 1.2 m/s if they stand still.",
    "Hunt sanity also follows movement near it: 65% walking, 45% still, 50% when no one is close."
  ],
  confirm: [
    { t: "Within 10m during a hunt, it speeds up when you move and slows when you stop.", def: true },
    { t: "It suddenly slows as it gets near, even without seeing you.", def: false }
  ],
  ruleOut: ["Male model or name.", "Speed keeps building with LOS while you stand close to it."],
  extra: ["Standing still near a Dayan makes it the slowest hunting ghost short of a Deogen or slowed Deildegast, which can save a loop."]
},
{
  id: "deildegast", name: "Deildegast", isNew: true,
  evidence: ["emf", "writing", "dots"],
  speeds: [{ v: 3.0, label: "nothing touched" }, { v: 1.7, label: "13 items" }, { v: 0.4, label: "26+ items" }],
  range: true, los: false,
  sanity: { base: 50, min: 50, max: 50, note: "50% per community testing" },
  pattern: "deildegast",
  tells: [
    "Hunts at 3.0 m/s, minus 0.1 m/s for every unique item players picked up or used since the last hunt or hunt attempt (minimum 0.4 m/s after 26 items).",
    "Speed is locked when the hunt starts and resets to 3.0 m/s after every hunt or hunt attempt.",
    "No LOS speed-up. It is fast before it ever sees you."
  ],
  behaviours: [
    "Less likely to touch doors and light switches (10% chance each, normally 25%).",
    "Prop interactions only succeed 85% of the time; a failed attempt sends it back to its favourite room."
  ],
  confirm: [
    { t: "Touch nothing between hunts. A flat 3.0 m/s hunt with no LOS build-up that does not slow as it reaches you points hard to Deildegast.", def: false },
    { t: "Before the next hunt, have the team pick up or use 10 to 15 different items. If that hunt is clearly slower, it is a Deildegast.", def: true }
  ],
  ruleOut: ["Speed builds the longer it sees you.", "Speed changes during a single hunt.", "Hunts at a plain 1.7 m/s when nobody has touched anything."],
  extra: [
    "What counts: picking up any non-equipment item (living or dead players), using props like microwaves or consoles, light switches, the breaker, taps.",
    "What does not count: equipment, cursed possessions, doors, and items the ghost throws itself.",
    "Each item counts once per cycle, anywhere on the map, including outside the house and in the truck.",
    "Dead players can help: throwing items while dead still slows it.",
    "Added in v0.18.0.0 (21 Jul 2026). This is the ghost the YouTube video called \"Dildos\"."
  ],
  speedTable: { title: "Items touched since last hunt", cols: ["Items", "Speed"], rows: [[0,3.0],[3,2.7],[6,2.4],[9,2.1],[13,1.7],[16,1.4],[20,1.0],[23,0.7],[26,0.4]] }
},
{
  id: "demon", name: "Demon",
  evidence: ["uv", "writing", "freezing"],
  speeds: [{ v: 1.7, label: "base" }],
  los: true,
  sanity: { base: 70, min: 70, max: 100, note: "70% normally, any sanity through its ability" },
  tells: [
    "Can hunt 60s after being smudged instead of 90s.",
    "Can hunt 20s after a hunt ends or a crucifix burns, instead of 25s.",
    "Crucifix range is 50% larger: 4.5m, 6m, 7.5m by tier."
  ],
  abilities: ["Can start a hunt at any sanity."],
  confirm: [
    { t: "Smudge it and time it. A hunt before 90s is a Demon.", def: true },
    { t: "A hunt less than 25s after the last hunt ended or a crucifix burned is a Demon.", def: true },
    { t: "A hunt above 80% average sanity with nobody under 50% and no candles lit. (On Sunny Meadows the chapel candles let an Onryo do this too.)", def: true }
  ],
  ruleOut: [],
  extra: [
    "It can hunt between 60s and 90s after a smudge but often will not, so several smudges without an early hunt do not rule it out.",
    "A crucifix burning from a surprising distance can be the bigger Demon range."
  ]
},
{
  id: "deogen", name: "Deogen",
  evidence: ["spiritbox", "writing", "dots"], guaranteed: "spiritbox",
  speeds: [{ v: 3.0, label: "far" }, { v: 0.4, label: "close" }],
  los: false,
  sanity: { base: 40, min: 40, max: 40 },
  pattern: "deogen",
  tells: [
    "Always knows where you are in a hunt. Hiding does not work.",
    "Sprints at 3.0 m/s from far away, then crawls at 0.4 m/s near its target.",
    "33% chance of heavy breathing on the spirit box within 1m.",
    "More visible during hunts."
  ],
  confirm: [{ t: "In a hunt you hear it rush toward you, then slow right down when close.", def: true }],
  ruleOut: ["Any hunt or hunt attempt above 40% average sanity.", "A plain 1.7 m/s hunt."],
  extra: ["Spirit Box is guaranteed whenever at least 1 evidence is given.", "Loop it slowly in a circle once it is close; it is easier to dodge than to hide from."]
},
{
  id: "gallu", name: "Gallu",
  evidence: ["emf", "uv", "spiritbox"],
  speeds: [{ v: 1.36, label: "weakened" }, { v: 1.7, label: "normal" }, { v: 1.96, label: "enraged" }],
  los: true,
  sanity: { base: 50, min: 40, max: 60, note: "Normal 50%, enraged 60%, weakened 40%" },
  tells: [
    "Cycles Normal, then Enraged, then Weakened, then back to Normal.",
    "Salt, incense or a crucifix pushes it to the next state (salt takes 2s from Normal, 3s from Weakened).",
    "While enraged it walks through salt without disturbing it, and can hunt on top of a Tier 1 floor crucifix."
  ],
  behaviours: [
    "Enraged: 1.96 m/s, hunts at 60%, incense blinds it 4s, crucifix range 2m shorter, ignores salt. Stays enraged until a hunt ends.",
    "Weakened: 1.36 m/s, hunts at 40%, incense blinds it 6s, crucifix range 1m longer, disturbs salt."
  ],
  confirm: [
    { t: "A fast ghost walks through salt in a hunt without disturbing it.", def: true },
    { t: "A normal or slow ghost speeds up 2 to 3 seconds after hitting Tier 1 or 2 salt.", def: true },
    { t: "Three rows of Tier 2 or 3 salt 1 to 2m apart. Incense it as it hits the first row. If the first is disturbed but the others are not, it is a Gallu.", def: true },
    { t: "It alternates between stepping in salt and not.", def: false }
  ],
  ruleOut: ["It steps in two salt piles that it reaches more than 2s apart."],
  extra: [
    "Any salt tier triggers the state change. Tier 3 salt's slowdown is a separate mechanic.",
    "Known bug: sometimes only the host sees it disturb salt."
  ]
},
{
  id: "goryo", name: "Goryo",
  evidence: ["emf", "uv", "dots"], guaranteed: "dots",
  speeds: [{ v: 1.7, label: "base" }],
  los: true,
  sanity: { base: 50, min: 50, max: 50 },
  tells: [
    "DOTS only show on a video camera and never while a player is in the room.",
    "Never changes favourite room.",
    "Rarely roams and cannot long roam."
  ],
  behaviours: ["Enters DOTS state more often than other ghosts. The DOTS state can start outside the room and drift in."],
  confirm: [],
  ruleOut: ["It changes favourite room.", "Hunts or spawns from two different rooms over the game in a way that shows a room change."],
  extra: ["DOTS is guaranteed whenever at least 1 evidence is given.", "The bone being in the ghost room is pure chance, not a Goryo tell."]
},
{
  id: "hantu", name: "Hantu",
  evidence: ["uv", "orbs", "freezing"], guaranteed: "freezing",
  speeds: [{ v: 1.4, label: "warm (15°C+)" }, { v: 2.1, label: "9 to 12°C" }, { v: 2.7, label: "below 0°C" }],
  range: true, los: false,
  sanity: { base: 50, min: 50, max: 50 },
  tells: [
    "Visible freezing breath during hunts when the breaker is off or broken.",
    "Faster in colder rooms, with no LOS speed-up.",
    "Cannot turn the breaker on, and turns it off more often."
  ],
  confirm: [
    { t: "Breaker off, watch a hunt. Visible breath means Hantu.", def: true },
    { t: "Speed shifts with no equipment or player cause as it moves between rooms.", def: true }
  ],
  ruleOut: ["No breath while the breaker is off.", "It turns the breaker on.", "It speeds up from LOS."],
  extra: [
    "Keep the house warm (breaker on) to keep it slow.",
    "It does not chill rooms faster or colder than other Freezing ghosts.",
    "Freezing is guaranteed whenever at least 1 evidence is given."
  ],
  speedTable: { title: "Room temperature", cols: ["Temp", "Speed"], rows: [["15°C+",1.4],["12–15°C",1.75],["9–12°C",2.1],["6–9°C",2.3],["3–6°C",2.4],["0–3°C",2.5],["below 0°C",2.7]] }
},
{
  id: "jinn", name: "Jinn",
  evidence: ["emf", "uv", "freezing"],
  speeds: [{ v: 1.7, label: "base" }, { v: 2.5, label: "boost" }],
  los: true, losNote: "Normal LOS speed-up, paused while boosted.",
  sanity: { base: 50, min: 50, max: 50 },
  pattern: "jinn",
  tells: [
    "With the breaker on, it jumps to 2.5 m/s while it sees a player more than 3m away, then drops back inside 3m.",
    "Never turns the breaker off directly.",
    "With the breaker on, can drain 25% from a player within 3m or in the same room, leaving EMF at the breaker."
  ],
  confirm: [{ t: "Breaker on, stand over 3m away during a hunt. 1.7 jumps to 2.5 when it sees you and drops back within 3m. Turn your electronics off so you don't confuse a Raiju.", def: true }],
  ruleOut: ["The ghost turns the breaker off itself."],
  extra: ["Built-up LOS speed can blend with the boost, which makes the drop near you hard to hear."]
},
{
  id: "kormos", name: "Kormos",
  evidence: ["orbs", "spiritbox", "uv"],
  speeds: [{ v: 1.7, label: "base" }, { v: 2.21, label: "detects you 5m+" }],
  los: false, losNote: "Pseudo-LOS only: builds speed while you move within 5m. Max 2.81 or 3.65 m/s.",
  sanity: { base: 50, min: 50, max: 70, note: "Up to 70% if you sprint in its room" },
  tells: [
    "Blind. Finds you by voice, electronics and footsteps: 10m crouch-walking, 15m walking, 30m sprinting.",
    "2.21 m/s when it detects you more than 5m away, 1.7 m/s otherwise.",
    "Never does mist (airball) or chasing events."
  ],
  confirm: [{ t: "Stand completely still and silent with electronics off. It loses you even in its path of travel unless it walks into you.", def: false }],
  ruleOut: ["A mist form event.", "Any event where it follows you.", "It stays at normal speed while clearly hearing your footsteps from range."],
  extra: [
    "v0.18.0.0 fixed it hearing players during the post-hunt grace period and through incense, going to the wrong floor, and killing through walls.",
    "Built-up pseudo-LOS speed carries between its two speeds, so it can jump from 2.81 to 3.65 m/s."
  ]
},
{
  id: "mare", name: "Mare",
  evidence: ["spiritbox", "orbs", "writing"],
  speeds: [{ v: 1.7, label: "base" }],
  los: true,
  sanity: { base: 60, min: 40, max: 60, note: "60% with its room's lights off or broken, 40% with them on" },
  tells: [
    "Hunts at 60% if the light switch in its current room is off (or lights broken), 40% if on.",
    "The only ghost that cannot flicker lights with EMF 2 at the switch.",
    "Never turns lights on."
  ],
  abilities: ["Can instantly switch off a light a player just turned on within 4m, even during an event."],
  behaviours: ["Roams more with lights on.", "Prefers turning lights off and light-burst events."],
  confirm: [
    { t: "During an event, flick lights on within 4m. If it switches them off mid-event, it is a Mare.", def: true },
    { t: "Each player flicks a switch on every 10s (once per switch). Repeated instant switch-offs suggest Mare. It cannot do this with shattered lights.", def: false }
  ],
  ruleOut: ["It turns a light on.", "A flicker with EMF at the switch."],
  extra: [
    "Any ghost event turns lights off, so a light going off right after an event is not the ability.",
    "Patch notes said it can turn on TVs and computers, but a known bug stops it.",
    "It does not prefer dark rooms; it simply roams more when its room is lit."
  ]
},
{
  id: "moroi", name: "Moroi",
  evidence: ["spiritbox", "writing", "freezing"], guaranteed: "spiritbox",
  speeds: [{ v: 1.5, label: "45%+ sanity" }, { v: 1.75, label: "~30% sanity" }, { v: 2.25, label: "0–5% sanity" }],
  range: true, los: true, losNote: "Standard LOS. Max 3.71 m/s at 0% sanity, the fastest in the game.",
  sanity: { base: 50, min: 50, max: 50 },
  tells: [
    "Curses you when you hear a spirit box reply, a paranormal parabolic mic sound or a recorder sound. Cursed players drain twice as fast, even in light.",
    "Faster as team sanity falls, plus LOS speed-up.",
    "Incense blinds it for 7s instead of 5s."
  ],
  confirm: [
    { t: "Its speed rises between hunts as sanity drops, and it still builds LOS speed.", def: true },
    { t: "After smudging it mid-hunt, it takes more than 5s to come back to you.", def: true },
    { t: "After a parabolic mic or recorder sound, standing in light cannot stop your passive drain.", def: true },
    { t: "Below 40% sanity, take sanity medication in a hunt. If it slows, it is a Moroi.", def: true }
  ],
  ruleOut: ["A plain 1.7 m/s start at 0% team sanity."],
  extra: ["Spirit Box is guaranteed whenever at least 1 evidence is given.", "Known bug: blindness is 7s rather than the 7.5s (5s + 50%) the patch notes described."],
  speedTable: { title: "Average sanity", cols: ["Sanity", "Speed"], rows: [["0–5%",2.25],["5–10%",2.164],["10–15%",2.081],["15–20%",1.998],["20–25%",1.915],["25–30%",1.832],["30–35%",1.749],["35–40%",1.66],["40–45%",1.583],["45%+",1.5]] }
},
{
  id: "myling", name: "Myling",
  evidence: ["emf", "uv", "writing"],
  speeds: [{ v: 1.7, label: "base" }],
  los: true, quiet: true,
  sanity: { base: 50, min: 50, max: 50 },
  tells: [
    "Footsteps and vocals in a hunt cut out beyond 12m (normally 20m).",
    "Makes parabolic mic and recorder sounds more often."
  ],
  confirm: [
    { t: "In a hunt, you cannot hear it between 12m and 20m away.", def: true },
    { t: "Two paranormal sounds on the parabolic mic or recorder within 80s of each other.", def: true }
  ],
  ruleOut: ["You hear it between 12m and 20m away during a hunt."],
  extra: ["It still makes vocal sounds in hunts; they just cut off sooner.", "Its steps sound like soft patters next to the usual stomp. Play the quiet footsteps below to compare."]
},
{
  id: "obake", name: "Obake",
  evidence: ["emf", "uv", "orbs"], guaranteed: "uv",
  speeds: [{ v: 1.7, label: "base" }],
  los: true,
  sanity: { base: 50, min: 50, max: 50 },
  tells: [
    "Can leave six-fingered handprints.",
    "Changes model for a single blink at least once per standard-length hunt.",
    "25% chance to leave no UV at all, and 25% chance to skip a footstep during events.",
    "Fingerprints fade twice as fast."
  ],
  confirm: [
    { t: "Loop it where you can see the model the whole hunt. A one-blink model change is an Obake.", def: true },
    { t: "After it steps in one salt pile, listen to the footsteps. A gap (step, nothing, step) is an Obake.", def: true }
  ],
  ruleOut: ["A long, fully watched hunt with no shapeshift makes Obake unlikely."],
  extra: [
    "UV is guaranteed whenever at least 1 evidence is given.",
    "Two left or two right footprints in a row mean nothing; any ghost can do that.",
    "Since v0.18.0.0 a filmed shapeshift counts for the ghost video objective."
  ]
},
{
  id: "obambo", name: "Obambo",
  evidence: ["writing", "uv", "dots"],
  speeds: [{ v: 1.45, label: "calm" }, { v: 1.96, label: "aggressive" }],
  los: true,
  sanity: { base: 65, min: 10, max: 65, note: "Aggressive 65%, calm 10%" },
  tells: [
    "Swaps between calm and aggressive every 2 minutes. The timer starts halfway through calm when the front door opens.",
    "Calm: 1.45 m/s, hunts at 10%. Aggressive: 1.96 m/s, hunts at 65%.",
    "Can switch state mid-hunt. Hunts that start aggressive are 20% shorter."
  ],
  confirm: [
    { t: "Mid-hunt it drops from 1.96 to 1.45 m/s or jumps the other way.", def: true },
    { t: "Speed alternates between 1.45 and 1.96 across hunts (The Twins are very close: 1.5 and 1.9).", def: false }
  ],
  ruleOut: ["A plain 1.7 m/s start."],
  extra: ["Use a 2-minute timer from the first front-door opening to predict when it turns aggressive."]
},
{
  id: "oni", name: "Oni", abnormalBlink: true,
  evidence: ["emf", "freezing", "dots"],
  speeds: [{ v: 1.7, label: "base" }],
  los: true,
  sanity: { base: 50, min: 50, max: 50 },
  tells: [
    "Events drain 20% sanity instead of 10% (singing events fixed to match in v0.19.0.0).",
    "Never does the mist (airball) event.",
    "Blinks less in hunts, so it is visible much more of the time."
  ],
  behaviours: ["More active with several people nearby.", "More likely to show its full model in events."],
  confirm: [
    { t: "It is clearly more visible during a hunt (solid for runs of several blinks).", def: true },
    { t: "With the sanity monitor on, an event takes 20% instead of 10%.", def: true }
  ],
  ruleOut: ["Any mist event.", "Normal blinking in a hunt."],
  extra: ["The walking-manifestation event makes the same hiss as the mist event. Only rule out Oni if you actually saw the mist."]
},
{
  id: "onryo", name: "Onryo",
  evidence: ["spiritbox", "orbs", "freezing"],
  speeds: [{ v: 1.7, label: "base" }],
  los: true,
  sanity: { base: 60, min: 40, max: 100, note: "60% normally, 40% near lit flames, any sanity via its ability" },
  tells: [
    "Every third flame it blows out, it attempts a hunt at any sanity.",
    "Lit flames work like crucifixes; it uses a flame within 4m before a crucifix.",
    "The only ghost that can blow out the same flame twice within 20s. Never lights flames."
  ],
  behaviours: ["More likely to blow out flames the more players are dead."],
  confirm: [
    { t: "It blows out the same Tier 1 or 2 candle twice within 20s (relight it straight away).", def: true },
    { t: "Above 75% sanity, put a candle on a Tier 1 or 2 crucifix. The crucifix only burns after 3+ blowouts.", def: false },
    { t: "Below 35% sanity, keep candles lit in its room. A long stretch with no hunt and no crucifix use.", def: false }
  ],
  ruleOut: ["It lights a fire source.", "A crucifix burns while a covering candle is still lit (Tier 3 crucifixes outrange a candle).", "A hunt starts right next to a lit flame."],
  extra: [
    "It does not avoid flames; it just blows one out instead of hunting near it.",
    "If a queued hunt cannot start (cooldown or smudge), flames blown out meanwhile do not count toward the next cycle.",
    "Tier 3 candles keep their timer running, so the double-blowout test needs Tier 1 or 2."
  ]
},
{
  id: "phantom", name: "Phantom", abnormalBlink: true,
  evidence: ["spiritbox", "uv", "dots"],
  speeds: [{ v: 1.7, label: "base" }],
  los: true,
  sanity: { base: 50, min: 50, max: 50 },
  tells: [
    "Vanishes when photographed or filmed, including in DOTS.",
    "Never appears in a \"Ghost\" photo or \"Ghost\" video.",
    "Nearly invisible in hunts (long gaps between blinks).",
    "Drains 0.5% sanity per second while you are in its heartbeat range during hunts and events."
  ],
  abilities: ["Roams to a random living player inside the investigation area, leaving EMF 2 at head height where it ends up."],
  confirm: [
    { t: "Photograph it in an event or DOTS. It vanishes, the event sound carries on, and the journal photo is not a \"Ghost\" photo.", def: true },
    { t: "Film it the same way. It vanishes and the clip is a \"Ghost\" video.", def: true },
    { t: "It looks nearly invisible during a hunt.", def: true },
    { t: "EMF 2 at head height near you with no visible interaction.", def: false }
  ],
  ruleOut: ["It appears in a \"Ghost\" journal photo.", "Normal or extra blinking in a hunt."],
  extra: [
    "Changed in v0.18.0.0: it can no longer use its roam ability on dead players or players outside, so the old \"wait outside the front door\" test no longer works.",
    "It still shows in Translucent, Shadow, DOTS and Hunting Ghost videos."
  ]
},
{
  id: "poltergeist", name: "Poltergeist",
  evidence: ["spiritbox", "uv", "writing"],
  speeds: [{ v: 1.7, label: "base" }],
  los: true,
  sanity: { base: 50, min: 50, max: 50 },
  tells: [
    "Throws an item every 0.5s during hunts, with extra force.",
    "The only ghost that can throw items while it stands in a lit room.",
    "Poltergeist Explosion: throws many items at once, draining 2% sanity per item from nearby players."
  ],
  behaviours: ["Throws and interacts more often, faster and further."],
  confirm: [
    { t: "Line items across its hunt path. If they all fly far, it is a Poltergeist.", def: true },
    { t: "Pile items close together (not stacked) in its room. Many thrown at once is a Poltergeist.", def: true },
    { t: "A throw while it stands in a lit room. Careful: any ghost can step into a dark doorway and reach back in.", def: false }
  ],
  ruleOut: ["Soft lobs with barely anything moved during a full hunt across cluttered floor."],
  extra: ["Throw speed matters more than how many items move."]
},
{
  id: "raiju", name: "Raiju",
  evidence: ["emf", "orbs", "dots"],
  speeds: [{ v: 1.7, label: "base" }, { v: 2.5, label: "near electronics" }],
  los: true, losNote: "Standard LOS outside electronics range; paused but still building while near them.",
  sanity: { base: 50, min: 50, max: 65, note: "65% near active player electronics" },
  pattern: "raiju",
  tells: [
    "2.5 m/s near active player electronics: within 6m, 8m or 10m on small, medium or large maps.",
    "Disrupts electronics out to 15m in events and hunts (normally 10m).",
    "Can hunt at 65% near active electronics."
  ],
  confirm: [
    { t: "Leave active electronics near its room and hide. Fast near the equipment, slower away from it.", def: true },
    { t: "With it hunting nearby, switch electronics on and off. Speed rises and falls with them. Equipment on the floor does not give you away.", def: true },
    { t: "A hunt between 50% and 65% sanity.", def: false }
  ],
  ruleOut: ["No speed-up near active electronics during a hunt."],
  extra: [
    "Changed in v0.18.0.0: the louder heartbeat was a bug and has been removed. Do not use heartbeat volume.",
    "Known bug: its heartbeat can be heard from 15m instead of 10m.",
    "Only player equipment counts, not house lights or TVs."
  ]
},
{
  id: "revenant", name: "Revenant",
  evidence: ["orbs", "writing", "freezing"],
  speeds: [{ v: 1.0, label: "searching" }, { v: 3.0, label: "detected" }],
  los: false,
  sanity: { base: 50, min: 50, max: 50 },
  pattern: "revenant",
  tells: [
    "Crawls at 1.0 m/s until it detects a player by sight, voice or electronics.",
    "Then jumps straight to 3.0 m/s until it reaches your last known spot, and slowly winds back down."
  ],
  confirm: [{ t: "Slow, then an instant sprint when it notices you, then slowing again. Faster than any Jinn or Raiju.", def: true }],
  ruleOut: ["Its hunt speed is anything other than 1.0 or 3.0 m/s."],
  extra: ["Break line of sight early and hide; it slows once it reaches your last known position."]
},
{
  id: "shade", name: "Shade",
  evidence: ["emf", "writing", "freezing"],
  speeds: [{ v: 1.7, label: "base" }],
  los: true,
  sanity: { base: 35, min: 35, max: 35 },
  tells: [
    "Never hunts, does events, or makes EMF-producing interactions in the same room as a player.",
    "Can never do singing events or the raise-and-throw-at-player interaction.",
    "The only ghost that shows as a shadow on summoning circle, music box and monkey paw events."
  ],
  behaviours: ["More likely to do mist events.", "Fewer events the further sanity is above 50%; none at 100%.", "Will not blow out flames in your room during a hunt."],
  confirm: [
    { t: "Light a summoning circle. A shadow model means Shade (music box and monkey paw events work too).", def: true },
    { t: "With a voodoo doll and salt or a sensor in the room with you, press a pin when it steps on them. No interaction (check EMF) means Shade.", def: true },
    { t: "Crucifix covering its room and sensors at the doors. It never does anything while you are in there.", def: false }
  ],
  ruleOut: ["Any singing event.", "EMF 2, 3 or 5 interaction or event in your room.", "A hunt or hunt attempt in your room.", "A hunt attempt above 35%.", "Any event at 100% sanity."],
  extra: ["It can leave the room and hunt from next door, so a crucifix in your room burning does not fully rule it out.", "This applies to any room, not just its favourite."]
},
{
  id: "spirit", name: "Spirit",
  evidence: ["emf", "spiritbox", "writing"],
  speeds: [{ v: 1.7, label: "base" }],
  los: true,
  sanity: { base: 50, min: 50, max: 50 },
  tells: ["Cannot hunt for 180s after being smudged (normally 90s)."],
  confirm: [{ t: "Smudge it, wait 150 to 170s, smudge again. A hunt within 60s of the second smudge means Spirit. Fails if the second smudge misses the ghost.", def: true }],
  ruleOut: ["Any hunt under 180s after a smudge."],
  extra: ["Any ghost may happen to wait 180s; only a Spirit must. Use the smudge timer in the tools panel."]
},
{
  id: "thaye", name: "Thaye",
  evidence: ["orbs", "writing", "dots"],
  speeds: [{ v: 2.75, label: "youngest" }, { v: 1.7, label: "6 ages" }, { v: 1.0, label: "oldest" }],
  range: true, los: false,
  sanity: { base: 75, min: 15, max: 75, note: "75% young down to 15% old" },
  tells: [
    "Tries to age every 1 to 2 minutes; it only ages if a player is nearby, otherwise retries in 30s.",
    "Each age step makes it slower (2.75 to 1.0 m/s) and lowers its hunt threshold (75% to 15%).",
    "Ouija age answers rise over time, and only a Thaye can answer 90+."
  ],
  behaviours: ["More active while young.", "No LOS speed-up at any age."],
  confirm: [
    { t: "Ask the Ouija board its age twice. A higher number the second time means Thaye.", def: true },
    { t: "Ouija age of 90 or more.", def: true },
    { t: "Speed drops each hunt and never builds with LOS.", def: true }
  ],
  ruleOut: ["Speed builds with LOS.", "A plain 1.7 m/s ghost in the very first hunt of the game."],
  extra: ["Known bugs: it can age from a player on the floor below, and its hunt threshold is 1% lower than intended.", "Moroi vs Thaye: a young Thaye stays at 2.75 m/s, a Moroi starts slower but keeps climbing with LOS."],
  speedTable: { title: "Times aged", cols: ["Ages", "Speed"], rows: [[0,2.75],[1,2.575],[2,2.4],[3,2.225],[4,2.05],[5,1.875],[6,1.7],[7,1.525],[8,1.35],[9,1.175],[10,1.0]] }
},
{
  id: "mimic", name: "The Mimic",
  evidence: ["spiritbox", "uv", "freezing"], fakeOrbs: true,
  speeds: [{ v: 1.7, label: "copies" }],
  los: true, losNote: "Copies whatever ghost it is mimicking.",
  sanity: { base: 50, min: 10, max: 100, note: "Copies the mimicked ghost" },
  tells: [
    "Always shows Ghost Orbs as an extra, fake evidence, even on 0 evidence.",
    "Copies a different ghost every 30 to 120s: behaviour, abilities, hunt speed and sanity, but never evidence."
  ],
  confirm: [
    { t: "On 0 evidence, check its favourite room for orbs on a video camera. Orbs mean Mimic.", def: true },
    { t: "Hunt behaviour changes wildly from hunt to hunt.", def: true }
  ],
  ruleOut: ["No Ghost Orbs in the favourite room."],
  extra: [
    "Its orbs stay in the favourite room and look identical to real orbs.",
    "It shows only its own evidence (UV, Spirit Box, Freezing plus orbs).",
    "Known bug: hunt visuals like blinking and Obake shapeshifts only display correctly for the host."
  ]
},
{
  id: "twins", name: "The Twins",
  evidence: ["emf", "spiritbox", "freezing"],
  speeds: [{ v: 1.5, label: "main twin" }, { v: 1.9, label: "far twin" }],
  los: true, losNote: "Builds LOS like a 1.7 m/s ghost, then adds or subtracts 0.2: max 2.61 or 3.01 m/s.",
  sanity: { base: 50, min: 50, max: 50 },
  tells: [
    "Hunts at either 1.5 or 1.9 m/s depending on which radius started it.",
    "Can make two interactions at once: one close (2.12m, 4.24m on large maps) and one far (8.48m, 16.97m)."
  ],
  behaviours: ["Motion sensors, salt and spirit box replies only happen at its real location."],
  confirm: [
    { t: "Hunt speed alternates between 1.5 and 1.9 (Obambo is very similar: 1.45 and 1.96).", def: false },
    { t: "Frequent interactions far from the ghost room.", def: false }
  ],
  ruleOut: ["A plain 1.7 m/s start."],
  extra: ["It is one ghost with two interaction ranges, not two ghosts.", "A quick double-interaction curve on the activity monitor can come from any ghost."]
},
{
  id: "wraith", name: "Wraith",
  evidence: ["emf", "spiritbox", "dots"],
  speeds: [{ v: 1.7, label: "base" }],
  los: true,
  sanity: { base: 50, min: 50, max: 50 },
  tells: [
    "Never touches salt, and Tier 3 salt does not slow it.",
    "Can teleport to a random player, leaving EMF 2 at their feet, then walks back to its room."
  ],
  confirm: [
    { t: "It walks through salt in an event or hunt without disturbing it.", def: true },
    { t: "Salt covering the whole laser of a Tier 1 or 2 motion sensor. The sensor fires but the salt is untouched.", def: true },
    { t: "EMF 2 at your feet with no visible interaction.", def: false }
  ],
  ruleOut: ["Salt disturbed in any way."],
  extra: ["It paths exactly like other ghosts in hunts; it does not see through walls or doors."]
},
{
  id: "yokai", name: "Yokai",
  evidence: ["spiritbox", "orbs", "dots"],
  speeds: [{ v: 1.7, label: "base" }],
  los: true,
  sanity: { base: 50, min: 50, max: 80, note: "Up to 80% if you talk in its room" },
  tells: [
    "In hunts it only hears voices and electronics within 2.5m.",
    "Talking in its room can make it hunt up to 80%.",
    "Starts a music box event at 2.5m (normally 5m) and closes it at 0.5m (normally 1m)."
  ],
  confirm: [
    { t: "In a hunt, talk or key global chat from a distance a normal ghost would hear. If it never comes, it is a Yokai.", def: true },
    { t: "Crouch holding a music box (standing on a Tier 3 crucifix is safest). If it lingers over the box before closing it, it is a Yokai. It must reach you within the 5s event.", def: true }
  ],
  ruleOut: ["It comes for you when you speak beyond 2.5m in a hunt."],
  extra: ["A ghost running straight to you once can be luck; repeat the hearing test."]
},
{
  id: "yurei", name: "Yurei",
  evidence: ["orbs", "freezing", "dots"],
  speeds: [{ v: 1.7, label: "base" }],
  los: true,
  sanity: { base: 50, min: 50, max: 50 },
  tells: [
    "The only ghost that can close or touch an exit door outside a hunt or event.",
    "Always fully opens or fully shuts doors outside hunts.",
    "Smudging traps it in its room for 90s, with no DOTS during that time."
  ],
  abilities: ["Slams a door to drain 15% from nearby players if its room has a door."],
  confirm: [],
  ruleOut: ["A door left partly open or shut by the ghost outside a hunt.", "With sensors or salt at the exits, it leaves its room within 90s of a smudge.", "It shows DOTS during the 90s after a smudge."],
  extra: [
    "v0.18.0.0 fixed a bug that let every ghost use the Yurei door ability, so exit-door tells are reliable again.",
    "v0.19.0.0 fixed delayed door-closing sounds that were often mistaken for a Yurei.",
    "Known bug: it can leave locker doors partly open, so only judge normal doors."
  ]
}
];

/* Names as the YouTube video's captions garbled them. */
window.VIDEO_NAMES = {
  gallu: "Gallow", dayan: "Dean", deogen: "Do, Dio", thaye: "Fay", raiju: "Rau, Rage you", moroi: "Maroy",
  myling: "Mileing, Mining", onryo: "Oreo, Orio", yurei: "Yuri", aswang: "Asang", goryo: "Gorio",
  kormos: "Cormos, Corn", jinn: "Jin, Gin", hantu: "Hanto, Hanu", obake: "Oake, Opaque",
  obambo: "Bambo", mare: "May, Mayor", poltergeist: "Py, Poly", yokai: "Yo-kai, Yoko", deildegast: "Dildos, Dildast"
};
