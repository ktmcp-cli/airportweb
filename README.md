> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# Airport Web CLI

Production-ready CLI for the Airport Web API. Search airports, airlines, and routes directly from your terminal.

## Installation

```bash
npm install -g @ktmcp-cli/airportweb
```

## Configuration

No authentication required — the Airport Web API is public.

```bash
airportweb config list
```

## Usage

### Airports

```bash
# Search airports by name or city
airportweb airports search "London"
airportweb airports search "JFK"

# Get airport by IATA code
airportweb airports get JFK
airportweb airports get LHR

# List airports
airportweb airports list
airportweb airports list --limit 20

# List airports by country
airportweb airports by-country US
airportweb airports by-country DE
```

### Airlines

```bash
# List airlines
airportweb airlines list
airportweb airlines list --limit 30

# Get airline by IATA code
airportweb airlines get AA
airportweb airlines get BA

# Search airlines
airportweb airlines search "Delta"
airportweb airlines search "Lufthansa"
```

### Routes

```bash
# Get routes from an airport
airportweb routes get --from JFK

# Get routes to an airport
airportweb routes get --to LHR

# Get routes between airports
airportweb routes get --from JFK --to LHR

# Search routes with filters
airportweb routes search --from JFK --airline AA
airportweb routes search --from LAX --to SFO
```

### JSON Output

All commands support `--json` for machine-readable output:

```bash
airportweb airports get JFK --json
airportweb airports search "London" --json | jq '.[].iata_code'
airportweb routes get --from JFK --json
```

## Examples

```bash
# Find all airports in Germany
airportweb airports by-country DE

# Search for Delta airlines
airportweb airlines search "Delta" --json

# Get all routes from LAX
airportweb routes get --from LAX --json | jq '.[].arr_iata' | sort | uniq
```

## License

MIT
