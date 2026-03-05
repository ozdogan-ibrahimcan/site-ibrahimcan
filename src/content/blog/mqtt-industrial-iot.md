---
title: "MQTT in Industrial IoT: Patterns, Pitfalls, and Best Practices"
description: "A practical look at MQTT architecture for industrial data — broker setup, topic design, QoS levels, retained messages, and the mistakes that cause data loss in production."
pubDate: "2026-01-15"
category: "IIoT & Data Pipelines"
whoIsItFor: "Automation engineers / Embedded / IIoT"
---

MQTT is everywhere in industrial IoT. It is lightweight, works well over unreliable networks, and is supported by virtually every platform from microcontrollers to cloud services. But "lightweight" does not mean simple — a poorly designed MQTT architecture causes data loss, security holes, and systems that are hard to debug. This post covers the patterns that work and the pitfalls to avoid.

## What MQTT is (and is not)

MQTT is a **publish/subscribe messaging protocol** designed for constrained devices and high-latency or unreliable networks. Key characteristics:

- **Broker-mediated** — publishers and subscribers never connect directly; all messages flow through a broker (Mosquitto, EMQX, HiveMQ, AWS IoT Core, etc.)
- **Topic-based routing** — messages are addressed to topic strings like `plant/line1/cell3/temperature`; subscribers use wildcards (`+` single-level, `#` multi-level) to match topics
- **Minimal overhead** — the fixed header is 2 bytes; a small sensor message can fit in under 20 bytes total
- **Persistent sessions** — a client can reconnect and receive messages it missed while offline (within broker limits)

What MQTT is **not**: it is not a data model. MQTT carries bytes; it says nothing about what those bytes mean. This is both its flexibility and its biggest operational challenge.

## Topic design: the most important decision

Topic structure is the one thing you cannot easily change after deployment without coordinating all publishers and subscribers. A flat, ad-hoc naming scheme becomes unmaintainable fast.

A well-designed industrial topic hierarchy follows a consistent pattern from broad to specific:

```
{site}/{area}/{line}/{cell}/{device}/{data-type}
```

Example:
```
fabrika1/boya/line2/robot3/welding/current
fabrika1/boya/line2/robot3/welding/status
fabrika1/boya/line2/robot3/diagnostics/temp
```

Rules that help in practice:

- **All lowercase, hyphens not underscores** — consistent, easy to grep and filter
- **No spaces or special characters** in topic names
- **Separate telemetry from commands** — use `…/data/…` for sensor readings and `…/cmd/…` for commands; never mix directions on the same topic
- **Avoid deep hierarchies** — 5–6 levels is usually the maximum before it becomes unreadable; flatten where possible
- **Reserve a `$SYS` namespace** — MQTT brokers publish broker statistics under `$SYS/#`; don't accidentally collide with it

## QoS levels

MQTT has three Quality of Service levels:

| Level | Name | Guarantee | Use case |
|-------|------|-----------|----------|
| 0 | At most once | Fire and forget, no retry | High-frequency telemetry where some loss is acceptable (temperature, vibration) |
| 1 | At least once | Delivered, but may duplicate | Most industrial data — alarms, KPIs, traceability events |
| 2 | Exactly once | Delivered exactly once, highest overhead | Financial or safety-critical counts, batch records |

The common mistake is using QoS 0 everywhere because "it's faster" and then being surprised when events are dropped during broker restarts or network hiccups. For anything that matters — production counts, alarm events, traceability records — use QoS 1 at minimum and design your consumer to be idempotent (handle duplicates gracefully).

## Retained messages

A retained message is the last value published on a topic, stored by the broker and immediately sent to any new subscriber. This is extremely useful for current-state data:

- Machine status (running / idle / fault)
- Last-known sensor value
- Configuration parameters

Without retained messages, a dashboard that restarts has to wait for the next publish cycle to know the current state. With retention, it receives the latest value instantly on subscribe.

However, retained messages also cause confusion: if a device is decommissioned, its retained message stays on the broker indefinitely. Always publish a retained message with an empty payload (`null`) to clear it when a device goes offline.

## Last Will and Testament (LWT)

LWT is a message the broker publishes automatically if a client disconnects ungracefully (network cut, power loss, crash). Configure it when the client connects:

```python
client.will_set(
    topic="fabrika1/boya/line2/robot3/status",
    payload='{"state": "offline", "ts": null}',
    qos=1,
    retain=True,
)
```

Without LWT, a dead device looks identical to a healthy one that hasn't published recently. With LWT, downstream systems and dashboards immediately see the `offline` state and can trigger alerts.

## Broker sizing and persistence

The broker is a single point of failure in an MQTT architecture. In industrial deployments:

- **Run the broker on a reliable host** — not a shared development server; ideally on the edge gateway or a dedicated VM with UPS-backed power
- **Enable persistence** — EMQX and Mosquitto both support disk-backed message queues; without persistence, in-flight QoS 1/2 messages are lost on restart
- **Monitor `$SYS/#`** — broker metrics (connected clients, messages/second, dropped messages) should feed into your monitoring system (Grafana, Zabbix, etc.)
- **Limit retained message size** — a common misconfiguration is publishing large JSON blobs as retained messages; keep retained payloads small (< 1 KB)

## Payload format: JSON vs binary

JSON is the pragmatic choice for most industrial MQTT payloads: human-readable, easy to parse in Node-RED/Python, and supported by every downstream tool.

A minimal well-structured JSON payload:

```json
{
  "ts": "2026-01-15T08:34:12.541Z",
  "v": 42.7,
  "q": "good",
  "unit": "°C"
}
```

Key fields to always include:

- **`ts`** — ISO 8601 timestamp from the source device, not the broker receive time (network latency makes broker timestamps unreliable for ordering)
- **`v`** — the value
- **`q`** — quality flag (`good`, `bad`, `uncertain`) mirroring OPC UA conventions
- **`unit`** — optional but invaluable when consumers are diverse

For high-frequency vibration or waveform data (thousands of samples/second), JSON overhead matters and a binary format like Apache Avro or Protocol Buffers is worth the complexity.

## Security: the part everyone skips in the lab and regrets in production

Default MQTT broker configurations have **no authentication and no encryption**. Acceptable in an isolated lab; a serious risk on any network that touches the internet or a corporate WAN.

Minimum production security checklist:

- [ ] TLS on port 8883 (not plain TCP on 1883)
- [ ] Username/password authentication per client, or client certificates
- [ ] ACLs — each client can only publish/subscribe to its own topics; a field device should not be able to subscribe to command topics for other devices
- [ ] Disable anonymous access on the broker

EMQX and HiveMQ have decent built-in ACL systems. For Mosquitto, the `mosquitto_passwd` and ACL file approach works but does not scale to hundreds of devices — consider a plugin or a dedicated auth backend.

## Summary

MQTT is a powerful tool when used correctly. The patterns that matter most in production: invest in topic design upfront, use QoS 1 for anything important, configure LWT for every device, enable broker persistence, and never skip security. Future posts will cover MQTT bridging (connecting two brokers, or bridging MQTT to OPC UA), the Sparkplug B specification for structured industrial MQTT payloads, and a complete Node-RED to MQTT to TimescaleDB pipeline walkthrough.
