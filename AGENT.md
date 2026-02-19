# AGENT.md — Airport Web CLI for AI Agents

This document explains how to use the Airport Web CLI as an AI agent.

## Overview

The `airportweb` CLI provides access to the Airport Web API. No authentication is required — it is a public API.

## All Commands

### Config

```bash
airportweb config get <key>
airportweb config set <key> <value>
airportweb config list
```

### Airports

```bash
# Search airports
airportweb airports search "London"
airportweb airports search "JFK"

# Get specific airport
airportweb airports get JFK
airportweb airports get LHR

# List airports
airportweb airports list
airportweb airports list --limit 100

# By country code
airportweb airports by-country US
airportweb airports by-country GB
```

### Airlines

```bash
# List airlines
airportweb airlines list

# Get specific airline
airportweb airlines get AA
airportweb airlines get BA

# Search airlines
airportweb airlines search "American"
```

### Routes

```bash
# Get routes
airportweb routes get --from JFK
airportweb routes get --to LHR
airportweb routes get --from JFK --to LHR

# Search routes with filters
airportweb routes search --from JFK --airline AA
airportweb routes search --from LAX --to SFO
```

## JSON Output

All commands support `--json`:

```bash
airportweb airports get JFK --json
airportweb airlines list --json
airportweb routes get --from JFK --json
```

## Error Handling

The CLI exits with code 1 on error and prints to stderr.
