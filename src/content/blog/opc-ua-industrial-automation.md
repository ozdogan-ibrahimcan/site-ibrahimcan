---
title: "OPC UA: The Backbone of Industrial Data Communication"
description: "What OPC UA is, how its information model works, and why it has become the standard for secure, vendor-neutral data exchange in modern industrial environments."
pubDate: "2026-02-20"
category: "IIoT & Data Pipelines"
whoIsItFor: "Automation engineers / Controls / OT"
---

OPC UA (OPC Unified Architecture) is the de-facto standard for machine-to-machine and machine-to-cloud communication in industrial automation. Unlike its predecessor OPC Classic — which was tightly coupled to Windows COM/DCOM — OPC UA is platform-independent, secure by design, and built around a rich information model. This post explains what OPC UA is, how it works, and where it fits in a real industrial architecture.

## A bit of history

OPC Classic (DA, HDA, A&E) solved the original problem: getting process data from a PLC into a SCADA on a Windows PC. It worked, but it depended on DCOM, which made it fragile across networks and impossible to run on Linux or embedded devices.

OPC UA, released in 2008 and now governed by the OPC Foundation, kept the data model ideas of OPC Classic and rebuilt everything else. The result is a stack that runs on anything from a Raspberry Pi to an enterprise server, communicates over standard TCP/IP, and carries its own security layer.

## The information model

The core idea in OPC UA is the **address space**: a structured graph of nodes that describes not just values, but the meaning, relationships, and metadata behind those values. A node can be:

- **Variable** — a data point with a value, data type, timestamp, and quality flag (e.g. a conveyor speed setpoint)
- **Object** — a logical grouping, like a machine or a production line
- **Method** — a callable function, like triggering a reset or starting a recipe
- **DataType / ReferenceType** — definitions that make the model self-describing

This means an OPC UA client can browse a server and discover what data exists, what unit it's in, what its normal range is, and how it relates to other nodes — without any out-of-band configuration. For system integrators, this is a significant reduction in manual mapping work.

## Transport and security

OPC UA supports multiple transport bindings:

- **TCP binary (opc.tcp://)** — the standard choice for PLC-to-SCADA and PLC-to-edge communication. Low overhead, high performance.
- **HTTPS** — used when crossing firewalls or integrating with web services.
- **WebSockets (OPC UA over WebSocket)** — increasingly used for browser-based dashboards and MQTT-bridged architectures.

Security is not optional — it is built into the protocol. Every connection establishes a security channel with configurable security policy (None / Sign / Sign & Encrypt) and uses X.509 certificates for mutual authentication. In practice, industrial projects often start with `None` for lab work and switch to `Sign & Encrypt` before going live.

## Where OPC UA fits in a real architecture

In a typical IIoT stack, OPC UA occupies the **edge-to-MES/SCADA layer**:

1. **PLC → OPC UA Server** — most modern PLCs (Siemens S7-1500, Rockwell ControlLogix, Beckhoff TwinCAT, etc.) expose a built-in OPC UA server. You configure which tags are published and at what sampling interval.
2. **OPC UA Client (Edge / Middleware)** — a Node-RED flow, Python script, or purpose-built gateway subscribes to the server's address space using **Subscriptions and MonitoredItems**. Instead of polling, the server pushes changes only when values change or exceed a deadband — efficient and low-latency.
3. **SCADA / MES / Historian** — the higher-level system connects as another OPC UA client, or the edge middleware translates to MQTT/REST/SQL before passing data upward.

## Subscriptions vs. polling

One of the most misunderstood aspects of OPC UA is the difference between subscriptions and polling. Many first-time integrations simply read tags in a loop — this works but wastes bandwidth and CPU.

The correct approach is **subscriptions with MonitoredItems**:

- Create a Subscription with a `publishingInterval` (e.g. 500 ms)
- Add MonitoredItems to the subscription, each with a `samplingInterval` and optional `deadbandValue`
- The server samples the item at the sampling rate and only queues a notification if the value changed beyond the deadband
- The client receives a batch of changed values at the publishing interval

This dramatically reduces traffic on busy shopfloors and is essential when monitoring hundreds of tags across multiple PLCs simultaneously.

## Companion specifications

OPC UA's real power comes from **companion specifications**: industry-specific information models built on top of the base standard. Examples include:

- **OPC UA for Machinery** (VDMA) — standardises how machine state, energy consumption, and identification are exposed
- **OPC UA for PackML** — state machine model for packaging machines
- **ISA-95 / OPC UA for MES** — integrates the UA address space with ISA-95 manufacturing operations data

When a machine supports a companion spec, any compliant MES or SCADA can connect to it without custom mapping — the goal of plug-and-produce integration.

## Summary

OPC UA is not just another protocol — it is an information modelling framework with transport, security, and semantics built in. For anyone building shopfloor-to-cloud architectures today, it is the most robust foundation available. Future posts will cover practical OPC UA server configuration on Siemens S7-1500 (TIA Portal), building a Node-RED OPC UA client, and bridging OPC UA to MQTT for cloud connectivity.
