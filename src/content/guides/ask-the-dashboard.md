---
title: Ask the dashboard
description: What the adhd surface answers, what a light means, and how to make a honeypot observable.
order: 11
updated: 2026-11-15
tags: guides, dashboard, mcp
seeds: starter, lab-operator
---

# Ask the dashboard

The dashboard is an MCP server that answers questions about the lab: what is running,
what it costs, what has been poked. Everything below is one `POST /mcp` with a JSON-RPC
body — no SDK, no client library.

You need: the endpoint (default `127.0.0.1:PORT`) and `curl`.

## 1. Ask what it can do

```sh
curl -s http://127.0.0.1:PORT/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

The answer is the surface: status, lights, isotope identity, peers, and — on a lab
build — the routing and proxy tools. A tool list is also an **exposure** statement: if
it includes a tool that runs a credentialed CLI, then reaching the endpoint means
reaching that credential.

## 2. Read the three useful answers

```sh
# what it sees
tools/call adhd.status        # instance, isotope, tick, lights, peers, spec_fidelity
tools/call adhd.lights.list   # one row per observed light, with status
tools/call adhd.isotope.status # role, trust rung, tick
```

`adhd.status.tick` advances once a second and is the cheapest liveness signal the
surface has: a tick that does not move is a stuck process, and a tick that jumped is a
restart.

## 3. Understand a light

A light is a *thing observed*, not a health verdict: a red light means something
tripped it, and the `source` says what kind of thing it was. A `security/honeypot_triggered`
light carries the caller and the accumulated distance in its details; a target light
carries the last check's message.

That distinction matters when you alert on lights: alerting on "any red light" makes
every decoy contact an incident, and alerting on none makes the decoys decoration.

## 4. Make a honeypot observable

Honeypots are registered through the cluster join, per decoy, with a sensitivity —
the accumulated 42i distance at which contacts become an alert:

```sh
curl -s http://127.0.0.1:PORT/mcp -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{
        "name":"adhd.cluster.join",
        "arguments":{"name":"demo","honeypot-tools":[
          {"name":"red.decoy.deprecated_api","sensitivity":16}]}}}'
```

Then ring it once and read the log:

```
WARN honeypot tool triggered via tools/call
     tool=red.decoy.deprecated_api caller_ip=127.0.0.1:PORT
     distance_42i=16 threshold_42i=16 fired=true
```

Two things to know before relying on it:

- a contact costs 16 per `tools/call` and 32 for a direct method call, per caller
  address — so a threshold above 16 tolerates one knock and fires on the second;
- **the alert has nowhere to go unless the instance has a `smoke_alarm` endpoint**. With
  none configured the trigger is a log line and a local light, which is a detection
  that stops at the process.

## 5. Decide what you are protecting

A dashboard that answers as the operator is a control surface. Before exposing one,
answer: is it bound to loopback, does it require a capability, and does the process run
as a uid whose files you would hand over? The measured answer for an unguarded instance
is in [/isotopes/piccalilli](/isotopes/piccalilli).

## Where this goes next

- Watching it from an alarm: [/guides/find-the-alarm](/guides/find-the-alarm)
- The rotation arithmetic: [/guides/price-a-rotation](/guides/price-a-rotation)
