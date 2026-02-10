# Orbital Greed — Coding Plan

> **2D Space Risk-Reward Strategy Game**
> Stack: Phaser 3 + Vite + TypeScript + Capacitor
> Dev: Solo | Target: Playable MVP in 10 days

---

## Game Concept (1-Pager)

**Pitch:** You're a scavenger pilot traveling between planets. Each planet has resources to harvest — but the longer you stay, the more its automated defenses target you. Leave too early and you earn nothing. Stay too late and you die. Greed is your enemy.

**Core Loop:**
```
Select Planet → Travel → Stay & Collect → Defenses Increase → Leave or Die → Upgrade → Repeat
```

**Win Condition:** Accumulate enough credits to buy the Hyperdrive and escape the system.
**Lose Condition:** Ship health reaches 0.

**Design Pillars:**
- Every second on a planet is a decision
- Risk scales non-linearly (safe early, deadly fast)
- Upgrades create "one more run" addiction

---

## Decisions Lock

| Decision | Answer |
|----------|--------|
| View | Top-down 2D |
| Controls | Mouse click + Touch tap |
| Art style | Geometric shapes (circles, triangles, rects) |
| Resolution | 800x600, ScaleManager.FIT |
| Physics | No physics engine (tween-based movement) |
| State management | Singleton GameState object |
| Font | Phaser built-in bitmap text or system font |

---

## Phase Checklist

### Phase 1 — Project Setup
- [ ] Vite + Phaser running at localhost:3000
- [ ] Scene switching: Boot → Menu → Game
- [ ] GameState singleton works
- [ ] index.html shows game canvas

### Phase 2 — Core Gameplay Loop
- [ ] Click planet → ship tweens to planet
- [ ] HarvestScene: timer ticks every second
- [ ] Credits accumulate visibly
- [ ] Damage escalates after grace period
- [ ] Health decreases, death triggers GameOver
- [ ] Leave button returns to map with credits
- [ ] THE GAME FEELS TENSE

### Phase 3 — Systems & Economy
- [ ] Upgrade shop works (buy armor, engine, shield)
- [ ] Upgrades affect gameplay (less damage, less fuel, longer grace)
- [ ] Planet generation creates varied risk/reward
- [ ] Economy feels balanced
- [ ] Hyperdrive purchasable as win condition

### Phase 4 — UI & Juice
- [ ] Risk meter with color gradient
- [ ] Warning overlay flashes
- [ ] Screen shake on damage
- [ ] Background color shifts with danger
- [ ] Floating number pop-ups
- [ ] Player FEELS the danger visually

### Phase 5 — Persistence & Balance
- [ ] Game saves between sessions
- [ ] Menu shows "Continue" if save exists
- [ ] Numbers are tuned and fun
- [ ] Full game loop: start → play → die/win → restart

### Phase 6 — Polish & MVP Lock
- [ ] Menu screen looks decent
- [ ] Game over screen shows stats
- [ ] Tutorial helps new players
- [ ] Starfield adds atmosphere
- [ ] NO NEW FEATURES

### Phase 7 — Mobile / Capacitor
- [ ] Runs on Android emulator
- [ ] Touch controls work
- [ ] Performance acceptable

---

## Key Math Reference

### Defense Damage Curve
```
damage(t) = BASE_DAMAGE x ESCALATION^(t - GRACE) x PLANET_MULT

Where:
  t = seconds stayed
  GRACE = 3 seconds (0 damage)
  BASE_DAMAGE = 2
  ESCALATION = 1.18
  PLANET_MULT = 0.8 + (risk x 0.4)
```

### Reward Per Second
```
reward(risk) = BASE_REWARD x (1 + risk x REWARD_MULT_FACTOR)

Risk 1: ~7 credits/sec
Risk 3: ~15 credits/sec
Risk 5: ~25 credits/sec
```

### Optimal Stay Times (100 HP, no armor)

| Risk | Safe Time | Max Reward Before Death | Sweet Spot |
|------|-----------|------------------------|------------|
| 1    | ~18s      | ~126 credits           | Leave at 15s |
| 2    | ~15s      | ~150 credits           | Leave at 12s |
| 3    | ~13s      | ~180 credits           | Leave at 10s |
| 4    | ~11s      | ~200 credits           | Leave at 8s  |
| 5    | ~9s       | ~210 credits           | Leave at 7s  |

### Upgrade Costs
```
cost(level) = 200 x 1.8^level

Level 0->1: 200
Level 1->2: 360
Level 2->3: 648
Level 3->4: 1166
Level 4->5: 2099
```

---

## Rules During Development

1. No new features mid-phase
2. Placeholder art is OK (shapes > sprites)
3. Mechanics > Visuals
4. Finish > Perfection
5. No premature optimization
6. Test the feel every phase
7. No scope creep (write ideas in a FUTURE.md)
