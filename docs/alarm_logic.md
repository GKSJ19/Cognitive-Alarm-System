# Alarm Logic Design

## Overview

The Alarm Logic module controls the overall alarm workflow.

## Workflow

1. Alarm triggers at the scheduled time.
2. The Challenge Engine generates a cognitive challenge.
3. The user attempts the challenge.
4. If the answer is correct, the alarm stops.
5. If the answer is incorrect, the alarm continues to ring.
6. The user must keep attempting until a correct answer is provided.

## Components

- Alarm Trigger
- Challenge Engine
- Answer Validation
- Alarm Controller