# B68: Cargo recovery marker

Safeguarded cargo is mechanically distinct but visually identical to ordinary hearts. Assign each emergency drop a stable group id and draw one compact cyan recovery marker at its live centroid. While shields are below two it reads `SAFE ×N`; afterward it reads `RECOVER ×N · Ns` using the group's longest remaining heart lifetime. Multiple emergencies produce separate markers, and each marker updates as hearts are collected or expire. Do not merge entities, change physics, extend lifetime, alter collection priority, or add DOM overlays.

Validate stable and separate group ids, centroid/count/timer updates, collection cleanup, empty groups, pause, reset, and draw-state isolation. Inspect the actual canvas at desktop and mobile sizes. Playtest question: does the single marker make the dropped cache findable without recreating heart clutter?
