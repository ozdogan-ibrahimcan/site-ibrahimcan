export interface ProjectHighlight {
  label: string;
  value: string;
}

export interface ProjectSection {
  heading: string;
  body: string; // markdown-like plain text, paragraphs separated by \n\n
  bullets?: string[];
}

/** One-line summaries for homepage case-study cards (Problem → Approach → Outcome) */
export interface ProjectCardSummary {
  problem: string;
  approach: string;
  outcome: string;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  tags: string[];
  role: string;
  duration: string;
  highlights: ProjectHighlight[];
  sections: ProjectSection[];
  /** Optional: used on homepage Featured Projects for case-study style cards */
  cardSummary?: ProjectCardSummary;
}

export const projects: Project[] = [
  {
    slug: 'plc-mes-traceability',
    title: 'PLC–MES Traceability Pipeline',
    tagline:
      'End-to-end VIN and production-event tracking across a multi-PLC shopfloor, with buffered, validated data delivery into the MES.',
    tags: ['PLC', 'MES', 'SQL', 'Node-RED', 'MQTT', 'Python'],
    role: 'Lead Software & Integration Engineer',
    duration: '~4 months',
    highlights: [
      { label: 'PLCs integrated', value: '6+' },
      { label: 'Events/shift', value: '~12 000' },
      { label: 'Data loss target', value: '0 events' },
      { label: 'Avg. latency', value: '< 2 s' },
    ],
    sections: [
      {
        heading: 'Context & challenge',
        body:
          'A large automotive assembly plant needed full production traceability — every VIN had to be linked to the exact PLC events (tightening results, leak tests, vision checks) that occurred during its build. The legacy approach relied on manual CSV exports and periodic database inserts, which created gaps, duplicates, and audit failures.\n\nThe MES vendor required a structured SQL insert contract: specific table schemas, mandatory fields, and strict ordering. Any malformed record would be rejected and lost. At the same time, the PLC layer had no guaranteed delivery — if the middleware crashed or the network hiccupped, events simply disappeared.',
      },
      {
        heading: 'Approach',
        body:
          'The solution was built as a lightweight Node-RED edge middleware running on an industrial PC in the cell. The architecture has three logical layers:',
        bullets: [
          'Acquisition — S7 communication nodes poll each PLC on a 500 ms cycle, capturing relevant DB registers and event flags. All raw data is timestamped and written to a local SQLite buffer before any downstream processing.',
          'Transformation — a set of processing nodes validates mandatory fields, maps PLC data types to MES schema types, and enriches records with station metadata (line, cell, shift). Malformed records are quarantined and logged for review.',
          'Delivery — validated records are batched and sent to the MES SQL endpoint via a Python microservice that wraps the vendor API. The service retries on transient errors and confirms ACKs before clearing records from the buffer, guaranteeing exactly-once delivery.',
        ],
      },
      {
        heading: 'Key decisions',
        body:
          'Local buffering was the most important design choice. By persisting every raw event to SQLite before forwarding, the system survives MES downtime, network outages, or middleware restarts without losing production data. The buffer acts as a write-ahead log — forward progress is only marked after the MES confirms receipt.\n\nPython was chosen for the delivery microservice because the MES vendor provided a Python SDK, and wrapping it in a small FastAPI service allowed independent scaling and easier debugging than trying to handle retries inside Node-RED flows.',
      },
      {
        heading: 'Outcome',
        body:
          'After go-live, traceability coverage reached 100 % of in-scope stations. The monthly audit that previously took two days to reconcile was eliminated. Zero data-loss incidents were recorded in the first three months of production operation. The buffered architecture also proved its value during a planned MES maintenance window — roughly 4 000 events queued cleanly and flushed in order once the MES came back online.',
      },
    ],
    cardSummary: {
      problem: 'Traceability gaps and audit failures from manual CSV/DB inserts; PLC layer had no guaranteed delivery.',
      approach: 'Node-RED edge middleware with SQLite buffer, validation layer, and Python delivery service with retries.',
      outcome: '100% traceability, zero data loss in 3 months; audit reconciliation eliminated.',
    },
  },
  {
    slug: 'scada-upgrade-modernization',
    title: 'SCADA Upgrade & Modernization',
    tagline:
      'Full migration and modernization of a legacy WinCC installation: new RBAC model, unified alarm strategy, and a zero-downtime cutover plan.',
    tags: ['WinCC', 'TIA Portal', 'RBAC', 'PROFINET', 'OPC UA'],
    role: 'Automation Software Engineer',
    duration: '~6 months',
    highlights: [
      { label: 'Screens migrated', value: '80+' },
      { label: 'Alarm groups', value: '14 → 6' },
      { label: 'User roles defined', value: '5' },
      { label: 'Cutover downtime', value: '< 2 h' },
    ],
    sections: [
      {
        heading: 'Context & challenge',
        body:
          'An automotive body-shop SCADA installation had grown organically over eight years. The result was a WinCC project with inconsistent screen layouts, a flat "admin / operator" permission model, an alarm flood of ~300 alarms/hour during normal operation, and no documented cutover procedure. Compliance requirements demanded an audit-ready system with role-based access, alarm acknowledgement trails, and a tested rollback path.',
      },
      {
        heading: 'Approach',
        body:
          'The project was divided into four parallel tracks, each with its own review gate:',
        bullets: [
          'Screen audit & standardisation — every existing screen was catalogued against a new UX template: consistent colour palette (ISA-101 conventions), standardised navigation, and responsive layout for both control room and mobile operator panels.',
          'RBAC design — five roles were defined (Viewer, Operator, Maintenance, Supervisor, Admin), each mapped to a precise set of write permissions on tags, set-points, and manual overrides. The model was implemented using WinCC user groups and backed up to an Active Directory integration for SSO.',
          'Alarm rationalisation — existing alarms were classified by consequence (safety, quality, availability). Nuisance alarms with < 5 % acknowledgement rate were either suppressed, converted to events, or re-engineered at PLC level. The result reduced active alarm volume by 60 %.',
          'Cutover planning — a documented "run-in parallel" strategy was designed: the new SCADA ran read-only in shadow mode against the live OPC UA server for two weeks, discrepancies were resolved, then a 90-minute planned cutover window was executed during a weekend shutdown.',
        ],
      },
      {
        heading: 'Key decisions',
        body:
          'Choosing OPC UA as the primary communication layer (replacing legacy WinCC S7 channel) was a deliberate long-term investment. It added implementation effort upfront but made the SCADA server vendor-agnostic and opened the data to downstream consumers (MES, historian) without proprietary protocol coupling.\n\nThe shadow-mode run-in period was essential. It surfaced a class of tag-mapping errors that would have caused incorrect readings on the new system — catching them before cutover rather than during.',
      },
      {
        heading: 'Outcome',
        body:
          'The cutover completed in 88 minutes with no production impact. Post-migration alarm rate dropped from ~300 to ~120 alarms/hour during steady-state operation. The first external compliance audit passed with zero major findings on the RBAC and alarm management chapters. Maintenance teams reported significantly faster fault diagnosis due to cleaner alarm grouping and consistent screen layouts.',
      },
    ],
    cardSummary: {
      problem: 'Legacy WinCC with inconsistent UX, flat permissions, and ~300 alarms/hour with no documented cutover plan.',
      approach: 'Screen standardization, RBAC design, alarm rationalization, and shadow-mode cutover with run-in period.',
      outcome: 'Cutover in 88 min; alarm rate down 60%; compliance passed with zero major findings; faster fault diagnosis.',
    },
  },
  {
    slug: 'industrial-network-troubleshooting',
    title: 'Industrial Network Troubleshooting',
    tagline:
      'Root-cause analysis and permanent fix for intermittent communication losses across a PROFINET ring topology in a high-EMI press shop.',
    tags: ['PROFINET', 'SCALANCE', 'TCP/IP', 'Diagnostics', 'TIA Portal'],
    role: 'Automation & Network Engineer',
    duration: '~3 weeks (investigation) + 2-month validation',
    highlights: [
      { label: 'Affected PLCs', value: '4' },
      { label: 'Avg. fault frequency', value: 'Daily' },
      { label: 'Root causes found', value: '3' },
      { label: 'Faults after fix', value: '0 in 60 days' },
    ],
    sections: [
      {
        heading: 'Context & challenge',
        body:
          'A press shop running four S7-1500 PLCs interconnected over a PROFINET MRP (Media Redundancy Protocol) ring via SCALANCE X switches experienced daily communication faults. Each fault caused a line stop of 3–15 minutes while operators acknowledged alarms and restarted affected programs. Maintenance had replaced cables and switches multiple times without resolving the issue. The faults were intermittent — they did not follow a predictable schedule — which made diagnosis difficult.',
      },
      {
        heading: 'Approach',
        body:
          'Rather than replacing hardware again, the investigation started from data collection. Three parallel sources were set up:',
        bullets: [
          'SCALANCE diagnostic logs — port statistics (CRC errors, late collisions, port resets) were captured continuously via SNMP and visualised in a simple Python dashboard to correlate fault events with switch-port anomalies.',
          'PLC diagnostic buffer — TIA Portal diagnostic buffers on all four CPUs were exported at each fault event using automated scripts, building a timeline of which device dropped off the ring first and when.',
          'Network baseline capture — a Wireshark capture on the ring manager port over three days established a baseline for frame sizes, cycle times, and LLDP topology advertisements.',
        ],
      },
      {
        heading: 'Root causes found',
        body:
          'Data analysis identified three independent contributing factors:',
        bullets: [
          'EMI-induced CRC errors on a 40 m cable segment running alongside an unshielded servo drive power cable. The segment was re-routed in a separate cable duct and replaced with shielded Cat 6A.',
          'MRP ring manager misconfiguration — two switches had both been configured as manager, creating split-brain events during ring healing. One was reconfigured to client mode.',
          'Incorrect port speed/duplex negotiation on one SCALANCE uplink. Auto-negotiation was disabled in favour of fixed 100 Mbps / full duplex on all inter-switch links, eliminating a class of transient half-duplex collisions.',
        ],
      },
      {
        heading: 'Outcome',
        body:
          'After all three fixes were applied, the press shop ran for 60 days without a single PROFINET fault. The SNMP dashboard developed during the investigation was kept in place as a permanent monitoring layer, feeding alerts to the maintenance team before errors escalate to line stops.\n\nThe case also led to the site creating a standard PROFINET commissioning checklist — covering cable routing, MRP role assignment, and speed/duplex configuration — that is now applied to all new installations.',
      },
    ],
    cardSummary: {
      problem: 'Intermittent comms drops in PROFINET ring causing daily 3–15 min line stops; root cause unknown.',
      approach: 'SCALANCE diagnostics, PLC buffer exports, Wireshark baseline; cable reroute, MRP fix, fixed speed/duplex.',
      outcome: 'Zero faults in 60 days; SNMP monitoring kept; site-wide PROFINET commissioning checklist adopted.',
    },
  },
];
