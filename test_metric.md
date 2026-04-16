# Before recursive stage 4

BASIC TEST TIME: 402756ms, for 5000 iterations
Average 80.551ms per iteration

Content Metrics:
  Total characters parsed: 683368
  Average characters per effect: 136.7
  Average sentences per effect: 1.28

Throughput:
  1.70 characters/ms
  0.016 sentences/ms
  0.5894ms per character

Phase Metrics:
  Phase 1: avg 0.203ms, variance 0.174ms, min (non 0) 1.000ms, max 5.000ms (5000 samples),
  Phase 2: avg 0.283ms, variance 0.233ms, min (non 0) 1.000ms, max 7.000ms (5000 samples),
  Phase 3: avg 0.471ms, variance 0.358ms, min (non 0) 1.000ms, max 13.000ms (5000 samples),
  Phase 4: avg 80.549ms, variance 58763.342ms, min (non 0) 1.000ms, max 2986.000ms (5000 samples)

# After recursive stage 4

BASIC TEST TIME: 467747ms, for 5000 iterations
Average 93.549ms per iteration

Content Metrics:
  Total characters parsed: 688318
  Average characters per effect: 137.7
  Average sentences per effect: 1.28

Throughput:
  1.47 characters/ms
  0.014 sentences/ms
  0.6796ms per character

Phase Metrics:
  Phase 1: avg 0.204ms, variance 0.168ms, min (non 0) 1.000ms, max 4.000ms (5000 samples),
  Phase 2: avg 0.297ms, variance 0.231ms, min (non 0) 1.000ms, max 5.000ms (5000 samples),
  Phase 3: avg 0.480ms, variance 0.334ms, min (non 0) 1.000ms, max 13.000ms (5000 samples),
  Phase 4: avg 93.548ms, variance 75307.891ms, min (non 0) 1.000ms, max 2888.000ms (5000 samples),

this is not much worse lmao?

# Seeded, before recursive:

BASIC TEST TIME: 556729ms, for 5000 iterations
Average 111.346ms per iteration

Content Metrics:
  Total characters parsed: 690376
  Average characters per effect: 138.1
  Average sentences per effect: 2.69
  Average targets per effect: 5.69
  Total sentences parsed: 13442

  Total targets parsed: 28457

Throughput:
  1.24 characters/ms
  0.024 sentences/ms
  0.051 targets/ms
  0.8064ms per character

Phase Metrics:
  Phase 1: avg 0.949ms, variance 4.313ms, min (non 0) 1.000ms, max 92.000ms (5000 samples),
  Phase 2: avg 1.315ms, variance 7.458ms, min (non 0) 1.000ms, max 129.000ms (5000 samples),
  Phase 3: avg 2.210ms, variance 18.984ms, min (non 0) 1.000ms, max 208.000ms (5000 samples),
  Phase 4: avg 111.335ms, variance 122906.598ms, min (non 0) 1.000ms, max 7908.000ms (5000 samples),

# After keyword fix + include early stop:

BASIC TEST TIME: 101968ms, for 5000 iterations
Average 20.394ms per iteration

Content Metrics:
  Total characters parsed: 699625
  Average characters per effect: 139.9
  Average sentences per effect: 2.68
  Average targets per effect: 0.00
  Total sentences parsed: 13402
  Total targets parsed: 0

Throughput:
  6.86 characters/ms
  0.131 sentences/ms
  0.000 targets/ms
  0.1457ms per character

Phase Metrics:
  Phase 1: avg 0.205ms, variance 0.171ms, min (non 0) 1.000ms, max 5.000ms (5000 samples),
  Phase 2: avg 0.286ms, variance 0.225ms, min (non 0) 1.000ms, max 7.000ms (5000 samples),
  Phase 3: avg 0.471ms, variance 0.338ms, min (non 0) 1.000ms, max 17.000ms (5000 samples),
  Phase 4: avg 20.392ms, variance 2415.622ms, min (non 0) 1.000ms, max 443.000ms (5000 samples),