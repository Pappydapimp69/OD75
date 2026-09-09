# B81 — Independent impact ducking (loop 5/50)

Problem: the sound engine remembers its deepest historical duck factor. After one boss roar lowers music to 62%, later shield hits also duck to 62% instead of their intended 78%, flattening the combat mix over time.

ZaneGPT design lens: isolate the hidden state leak rather than adding another layer. Each new duck begins from a recovered factor when the previous envelope has ended. Overlapping events keep the deeper attenuation and extend the window. Music moves down quickly (0.018-second time constant) and returns more gently (0.11 seconds), with the recovery scheduled on AudioContext time.

Unchanged: compositions, instruments, Mix levels, SFX synthesis, compressor, master volume, voice limits, mute behavior, gameplay and controls.

Acceptance: a completed deep duck cannot contaminate the next lighter event; overlapping weaker events cannot lift a deeper active duck; overlap extends recovery; attack and release targets use AudioContext time; scheduler smoothing does not continuously reschedule an unchanged envelope; invalid factors and durations remain bounded.

Playtest: do damage and boss cues cut through clearly without making the soundtrack audibly pump?
