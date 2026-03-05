---
title: "What is Node-RED? Node-RED in Industrial Use"
description: "What is Node-RED, how does it work, and why is it used in industrial automation and IIoT projects? A short introduction and use cases."
pubDate: "2026-03-05"
heroImageUrl: "/images/node-red-hero.jpg"
---

Node-RED is a flow-based programming tool. It is often used for rapid prototyping and connectivity in IoT and industrial data integration projects. This post summarises what Node-RED is, how it works, and where it is used in industry.

## What is Node-RED?

Node-RED is an open-source tool developed by IBM and running on Node.js. In a browser-based editor you design flows visually using “nodes” and “wires”, so you can collect, transform, and send data with little or no code.

Basic components:

- **Input nodes:** Get data from sources such as MQTT, HTTP, OPC UA, Modbus, and serial ports.
- **Processing nodes:** Filter and merge data, convert to JSON, or customise with simple JavaScript.
- **Output nodes:** Send data to databases, MQTT, REST APIs, or SCADA/MES systems.

With this structure, sensor data, PLC signals, or web requests can be combined in a single flow and sent to target systems.

## Where is it used in industry?

In industrial settings, Node-RED is typically used in these roles:

1. **Edge / gateway layer:** Collects data from PLCs, sensors, or counters on the shop floor and forwards it to upper layers (SCADA, MES, cloud) via MQTT, OPC UA, or HTTP.
2. **Prototyping and PoC:** Provides an ideal environment to connect a new sensor, protocol, or API quickly and answer “does it work?”.
3. **Small automations:** Lightweight logic such as simple timers, threshold checks, alarm collection, or reporting can be implemented as Node-RED flows.
4. **Data transformation:** Acts as a bridge between different protocols (e.g. Modbus ↔ MQTT, OPC UA ↔ REST) so existing equipment can talk to new systems.

In real projects, Node-RED is commonly run on Raspberry Pi, industrial PCs, or in Docker containers as a thin software layer in the field.

## Summary

Node-RED is a strong option for fast integration and prototyping in industrial IoT and automation. Thanks to its visual flow editor, both developers and field engineers can design and test data flows. Future posts will cover example flows (MQTT, OPC UA, Modbus) and best practices.
