export type UseCaseContent = {
  slug: string;
  title: string;
  industry: string;
  summary: string;
  problem: string;
  approach: string;
  outcome: string;
  image: string;
  audience: string[];
  stats: { label: string; value: string; note: string }[];
  steps: { title: string; body: string }[];
  bom: { item: string; why: string; categorySlug: string }[];
  sendUs: string[];
  relatedServiceSlugs: string[];
  order: number;
  featured: boolean;
};

/**
 * Application notes for Nur Engineering Solution.
 * Written as practical EEE desk guidance for Bangladesh SMEs — not fabricated client ROI.
 * Industry figures (VFD energy range, typical machine topologies) come from
 * published automation practice in textile/RMG, packaging, pumps/fans, and panel work.
 */
export const useCaseContent: UseCaseContent[] = [
  {
    slug: "machine-downtime-spare-parts",
    title: "Keep the machine running",
    industry: "Workshops & factories",
    summary:
      "When a motor, contactor, sensor or bearing fails, the job is not “buy any spare” — it is match rating, fit and duty so the line starts again the same day.",
    problem:
      "Most unplanned stops in small Bangladeshi workshops are not new-machine problems. A nameplate is faded, the original brand is gone, or the store sold a look-alike that does not fit the shaft, coil voltage or sensing distance. Hours are lost on trial parts. The operator needs a working equivalent, not a catalogue screenshot.",
    approach:
      "We treat spare supply as an engineering match. Send a photo, nameplate, part number or the failed unit. We cross-check kW/HP, voltage, frame, I/O type (NPN/PNP), coil voltage and mounting, then quote OEM or a documented compatible. Where a 1:1 part is unavailable, we state the trade-off before you buy.",
    outcome:
      "A single, specified replacement — motor, VFD, PLC module, sensor or mechanical wear item — with a clear “in stock / made to order” note, instead of three wrong parts from the local market.",
    image:
      "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=1600&q=80",
    audience: [
      "Repair workshops",
      "Small factories",
      "Maintenance desks",
      "Machine owners",
    ],
    stats: [
      {
        label: "What we match",
        value: "Fit + rating",
        note: "Not just the printed name on the old part",
      },
      {
        label: "Typical ask",
        value: "Photo + FLA",
        note: "Nameplate, coil voltage or sensing distance",
      },
      {
        label: "Supply mode",
        value: "Quote first",
        note: "Stock check before you commit",
      },
    ],
    steps: [
      {
        title: "Identify",
        body: "Photo of the failed part, nameplate, and the machine it sits on (pump, conveyor, CNC, panel).",
      },
      {
        title: "Cross-reference",
        body: "We check electrical rating, mechanical dimensions, I/O type and environment (dust, IP, 24 VDC vs 220 VAC coil).",
      },
      {
        title: "Quote options",
        body: "OEM if available; otherwise a compatible with the differences written down — not hidden in the invoice.",
      },
    ],
    bom: [
      { item: "Motors", why: "Burnt windings, seized bearings, wrong frame replacements", categorySlug: "motors" },
      { item: "Contactors & overloads", why: "Welded contacts, wrong coil voltage, DOL starter rebuilds", categorySlug: "contactors" },
      { item: "Sensors", why: "Failed proximity / photoelectric on jigs and conveyors", categorySlug: "sensors" },
      { item: "Bearings", why: "6200-series wear items that stop motors and pulleys", categorySlug: "bearings" },
    ],
    sendUs: [
      "Clear photo of the part and nameplate",
      "Machine type (pump, fan, conveyor, CNC, panel)",
      "Voltage, kW/HP or FLA if readable",
      "How many units and how soon you need them",
    ],
    relatedServiceSlugs: ["spare-parts-sourcing", "motor-drive-matching"],
    order: 1,
    featured: true,
  },
  {
    slug: "conveyor-packaging-automation",
    title: "Conveyor & packaging control",
    industry: "Packaging & material handling",
    summary:
      "A packaging or conveyor line is a small automation system: PLC as the sequencer, sensors as the eyes, VFD as the muscle, HMI as the operator window.",
    problem:
      "Food, plastic, carton and light assembly shops in Bangladesh often run conveyors on a DOL starter and a handful of relays. The belt slams on, products pile up, and there is no interlock when a box is missing. Adding “a PLC” without an I/O list, sensor type and drive size creates a drawer of unused modules.",
    approach:
      "We size the line as a loop: what the sensor must see, what the PLC must count or time, and what speed the motor actually needs. Proximity and photoelectric sensors handle presence and counting. A compact PLC (Delta, Siemens S7-1200, Mitsubishi FX, Omron CP1E) sequences start, stop, jam and reject. A VFD gives soft start so the belt does not jerk product. An HMI is optional until the sequence is stable.",
    outcome:
      "A parts kit that matches the machine — not a generic “automation bundle”. You get an I/O-minded quote: DI/DO count, sensor output type, motor kW and protection devices.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80",
    audience: [
      "Packaging workshops",
      "Light assembly",
      "Warehouse conveyors",
      "OEM machine builders",
    ],
    stats: [
      {
        label: "Control brain",
        value: "Compact PLC",
        note: "Delta / Siemens / Mitsubishi / Omron class",
      },
      {
        label: "Field input",
        value: "Sensors",
        note: "M18 inductive, photoelectric, encoder",
      },
      {
        label: "Motion",
        value: "VFD + motor",
        note: "Soft start, speed, jam response",
      },
    ],
    steps: [
      {
        title: "Map the sequence",
        body: "Infeed → sense → index/run → outfeed or reject. Write what happens if a box is missing.",
      },
      {
        title: "Count I/O",
        body: "Each sensor, start/stop, overload trip and VFD run/fault is a point. We size the PLC from that list, not from a brochure.",
      },
      {
        title: "Match the drive",
        body: "Motor kW, supply (1-ph/3-ph) and whether you need speed pot, brake or simple on/off with ramp.",
      },
    ],
    bom: [
      { item: "PLC", why: "Sequence, timers, counters, interlocks", categorySlug: "plc" },
      { item: "Sensors", why: "Presence, counting, end-of-travel", categorySlug: "sensors" },
      { item: "VFD / drives", why: "Belt speed and soft start", categorySlug: "drives" },
      { item: "HMI", why: "Operator start, recipe, fault text", categorySlug: "hmi" },
    ],
    sendUs: [
      "Short description of the machine cycle",
      "Motor kW and how it is started today",
      "How many sensors you already have (or photos)",
      "Whether you need only parts, or parts + first-run support",
    ],
    relatedServiceSlugs: [
      "plc-programming-support",
      "sensor-automation-fit",
      "motor-drive-matching",
    ],
    order: 2,
    featured: true,
  },
  {
    slug: "pump-fan-vfd-retrofit",
    title: "Pump, fan & compressor VFDs",
    industry: "Utilities & process motors",
    summary:
      "Pumps and fans rarely need full speed all day. A VFD replaces throttling valves and DOL slamming — cutting energy and mechanical shock.",
    problem:
      "Across Bangladesh, process water, cooling towers, AHUs, compressors and irrigation pumps are still started DOL. The motor takes inrush, pipes hammer, and flow is wasted through a half-closed valve. Textile and factory utility studies in this market commonly report large motor-energy reductions once speed follows demand instead of running at 50 Hz forever.",
    approach:
      "We pair motor and drive: kW, FLA, 380–440 V class, and whether the load is variable-torque (pump/fan) or constant-torque (conveyor/compressor). Soft ramp protects couplings and belts. PID is useful on pressure or temperature loops; a simple speed pot is enough for many workshops. We also check protection — MCB/MCCB, overload, and a 24 V supply if a PLC later closes the loop.",
    outcome:
      "A specified VFD + motor option (or VFD-only retrofit on a healthy motor) with commissioning notes: motor nameplate, cable size, and what not to do (long unterminated motor cables, missing earth, bypassing thermal protection).",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80",
    audience: [
      "Factory utilities",
      "Water & irrigation",
      "HVAC rooms",
      "Textile dye / wash pumps",
    ],
    stats: [
      {
        label: "Industry range",
        value: "20–40%",
        note: "Published motor-energy savings on pumps/fans when VFDs replace throttling or idle-full-speed running — not a promise for every site",
      },
      {
        label: "Mechanical gain",
        value: "Soft start",
        note: "Less belt slap, coupling shock and water hammer",
      },
      {
        label: "Typical sizes here",
        value: "0.75–5.5 kW",
        note: "Workshop and SME utility motors; larger drives sourced on request",
      },
    ],
    steps: [
      {
        title: "Read the motor",
        body: "kW/HP, FLA, voltage, rpm, connection (star/delta). A photo of the nameplate is enough to start.",
      },
      {
        title: "Name the load",
        body: "Pump, fan, compressor or conveyor — this decides V/F vs vector and whether you need a braking resistor.",
      },
      {
        title: "Fit protection",
        body: "Input breaker, motor cable, earth, and keep the motor thermal path intact. VFD is not a substitute for a missing overload on every duty.",
      },
    ],
    bom: [
      { item: "VFD / drives", why: "Speed, ramp, PID, energy at part load", categorySlug: "drives" },
      { item: "Motors", why: "Replacement when windings or bearings are gone", categorySlug: "motors" },
      { item: "Breakers", why: "Input protection sized to drive, not to hope", categorySlug: "breakers" },
      { item: "Cables", why: "Motor and control cores; screened cable on longer runs", categorySlug: "cables" },
    ],
    sendUs: [
      "Motor nameplate photo (kW, FLA, V, rpm)",
      "Application: pump / fan / compressor / other",
      "Supply: 1-phase or 3-phase at the panel",
      "Do you need pressure/flow control or only speed?",
    ],
    relatedServiceSlugs: ["motor-drive-matching", "control-panel-parts"],
    order: 3,
    featured: true,
  },
  {
    slug: "control-panel-kits",
    title: "Control panel kits",
    industry: "Panel builders & OEMs",
    summary:
      "A panel is a bill of materials: protection, switching, 24 V power, PLC/HMI and terminals — pulled as one kit so nothing is missing on assembly day.",
    problem:
      "Panel shops and factory electricians in Dhaka and around the country often buy a contactor here, an MCB there, and a power supply of unknown rating. Coil voltages mix (220 VAC next to 24 VDC). The PLC arrives without enough DI, or the SMPS is undersized once sensors and relays are added. Assembly stops for a missing auxiliary contact.",
    approach:
      "We quote a kit from a one-line description or a photo of the existing panel: incoming protection, DOL or reversing starter, thermal overload, 24 VDC DIN SMPS with headroom, PLC/HMI if specified, and control cable. Coil voltage is a first-class field — we do not assume 220 VAC. For motor starters we match AC-3 current, not just “25A looks close”.",
    outcome:
      "A coherent starter or PLC panel kit with a short wiring intent: what is power, what is 24 V, what is field I/O. You still do the build; we stop the parts scavenger hunt.",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
    audience: [
      "Panel builders",
      "Factory electricians",
      "OEM machine makers",
      "Maintenance contractors",
    ],
    stats: [
      {
        label: "Starter class",
        value: "DOL / reverse",
        note: "Contactor + overload + MCB as a set",
      },
      {
        label: "Control power",
        value: "24 VDC SMPS",
        note: "Size with 20–30% headroom for PLC + sensors",
      },
      {
        label: "Logic option",
        value: "Relay or PLC",
        note: "Timers first; PLC when the sequence grows",
      },
    ],
    steps: [
      {
        title: "Incoming & motor",
        body: "Breaker rating, motor FLA, utilisation category. This sets MCB/MCCB and contactor size.",
      },
      {
        title: "Coil & auxiliaries",
        body: "220 VAC vs 24 VDC coils, NO/NC aux, overload 1NO+1NC for interlocking.",
      },
      {
        title: "Brain and power",
        body: "If a PLC is in the panel, count I/O and size the 24 V rail. HMI only if operators need it on day one.",
      },
    ],
    bom: [
      { item: "Contactors", why: "Switching the motor; coil voltage must match the circuit", categorySlug: "contactors" },
      { item: "Relays", why: "Overload, timer, interlocking before a PLC is justified", categorySlug: "relays" },
      { item: "Circuit breakers", why: "Incoming and branch protection", categorySlug: "breakers" },
      { item: "Power supplies", why: "24 V for PLC, sensors and relay coils", categorySlug: "power-supplies" },
    ],
    sendUs: [
      "Motor kW / FLA and starter type (DOL, star-delta, VFD)",
      "Coil voltage you want (220 VAC or 24 VDC)",
      "Photo of the existing panel if this is a rebuild",
      "PLC/HMI yes or no, and rough I/O count",
    ],
    relatedServiceSlugs: ["control-panel-parts", "plc-programming-support"],
    order: 4,
    featured: true,
  },
  {
    slug: "textile-rmg-utility-drives",
    title: "Textile & RMG utilities",
    industry: "Textile · garments · dyeing",
    summary:
      "Bangladesh’s largest industrial load is textile and RMG. The useful EEE work for a parts desk is often utilities: pumps, fans, humidification and small process lines — not a full mill DCS.",
    problem:
      "Spinning, dyeing, washing and garment finishing run motors around the clock. DOL start on dye pumps and AHU fans wastes energy and stresses mechanics. Humidity and water systems are where VFDs pay back fastest. Many factories also need a compact PLC on a local skid (chemical dosing, compact conveyor, packing) without waiting for a turnkey SI.",
    approach:
      "We stay in the layer this desk can own: specify VFDs for variable-torque utility motors, replace failed pumps motors, supply sensors for tank/level and machine presence, and kit small PLC panels for auxiliary machines. Industry sources in Bangladesh commonly cite roughly 20–40% motor electricity reduction on correctly applied pump/fan VFDs; we treat that as a design range to discuss, then size from your nameplate — not from a brochure.",
    outcome:
      "Utility motors and small process skids that are specified, protected and spare-able. You are not buying a fake “digital mill transformation”; you are buying the parts that keep dye pumps, exhaust fans and packing belts under control.",
    image:
      "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1600&q=80",
    audience: [
      "Dyeing & washing",
      "Spinning utilities",
      "Garment finishing",
      "In-house maintenance",
    ],
    stats: [
      {
        label: "Where VFDs win",
        value: "Pumps & fans",
        note: "Dye liquor, water, AHU, humidification, exhaust",
      },
      {
        label: "Soft-start effect",
        value: "Less shock",
        note: "Used on winding/process machines to cut mechanical snatch",
      },
      {
        label: "Our scope",
        value: "Parts + match",
        note: "Not mill-wide SCADA; skid and utility scale",
      },
    ],
    steps: [
      {
        title: "Pick the motor family",
        body: "Utility pump/fan first — highest hours, clearest VFD case. Process machines second.",
      },
      {
        title: "Stabilise supply realities",
        body: "Note voltage swing and earthing. Drives need a sane incoming breaker and motor cable, not only a low price.",
      },
      {
        title: "Keep spares honest",
        body: "Same frame motors, same sensor series, documented coil voltages so the night shift can replace without guesswork.",
      },
    ],
    bom: [
      { item: "VFD / drives", why: "Utility energy and process speed", categorySlug: "drives" },
      { item: "Motors", why: "Failed pump/fan motors on long duty", categorySlug: "motors" },
      { item: "PLC", why: "Local skids: dosing, compact packing, interlocks", categorySlug: "plc" },
      { item: "Sensors", why: "Level, presence, speed feedback", categorySlug: "sensors" },
    ],
    sendUs: [
      "Which line: dye pump, AHU, compressor, packing, other",
      "Motor nameplate photos and how many units",
      "Existing drive brand if this is a replacement",
      "Whether maintenance or a contractor will install",
    ],
    relatedServiceSlugs: ["motor-drive-matching", "spare-parts-sourcing"],
    order: 5,
    featured: true,
  },
  {
    slug: "eee-lab-training-benches",
    title: "EEE lab & training benches",
    industry: "Universities · polytechnics · makers",
    summary:
      "A teaching bench should use the same class of PLC, motor, sensor and protection you will see in a real panel — just smaller, safer and documented.",
    problem:
      "Student projects and department labs often mix toy sensors with industrial contactors, or buy a PLC with no 24 V rail, no overload, and no way to show a VFD running a real motor. The experiment becomes a wiring accident. Instructors need a kit that demonstrates DOL vs VFD, NPN vs PNP, and a short ladder sequence without requiring a factory budget.",
    approach:
      "We kit benches around a compact PLC, 24 V SMPS, a small three-phase or well-protected motor, optional VFD, M18 sensors, contactor + overload, and HMI if the course needs an operator screen. Specs are written as learning outcomes: “student can size an overload from FLA”, not as marketing. Same supply desk as the factory catalog — so a graduate can reorder the industrial version later.",
    outcome:
      "A lab-safe parts list with clear voltages, a suggested I/O map, and commercial parts that survive more than one semester.",
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80",
    audience: [
      "University EEE labs",
      "Polytechnic workshops",
      "Student projects",
      "Training centres",
    ],
    stats: [
      {
        label: "Teaching stack",
        value: "PLC + 24 V",
        note: "SMPS, sensors, contactor, optional VFD",
      },
      {
        label: "Safety first",
        value: "Protection in kit",
        note: "MCB, overload, documented voltages",
      },
      {
        label: "Reuse path",
        value: "Industrial SKUs",
        note: "Same catalogue as factory customers",
      },
    ],
    steps: [
      {
        title: "Define the experiment",
        body: "DOL starter, VFD speed pot, sensor counting, or a mini conveyor. One clear outcome per bench.",
      },
      {
        title: "Lock the voltages",
        body: "24 VDC control recommended for student I/O. Power side stays behind protection and supervision.",
      },
      {
        title: "Document I/O",
        body: "A one-page map: which terminal is which sensor, which coil, which drive digital input.",
      },
    ],
    bom: [
      { item: "PLC", why: "Ladder/structured intro on hardware used in industry", categorySlug: "plc" },
      { item: "Sensors", why: "NPN/PNP and real sensing distance, not jumper wires only", categorySlug: "sensors" },
      { item: "Motors & drives", why: "Show DOL vs VFD on a small machine", categorySlug: "motors" },
      { item: "HMI", why: "Operator screen for senior design projects", categorySlug: "hmi" },
    ],
    sendUs: [
      "Course or project goal (one paragraph)",
      "Supply available in the lab (1-ph / 3-ph)",
      "How many identical benches",
      "Must-have brands for the syllabus, if any",
    ],
    relatedServiceSlugs: [
      "plc-programming-support",
      "sensor-automation-fit",
      "control-panel-parts",
    ],
    order: 6,
    featured: true,
  },
];

export const navLinks = [
  { href: "/", label: "Home", order: 1 },
  { href: "/products", label: "Products", order: 2 },
  { href: "/use-cases", label: "Our Services", order: 3 },
  { href: "/services", label: "Services", order: 4 },
  { href: "/about", label: "About", order: 5 },
  { href: "/contact", label: "Contact", order: 6 },
  { href: "/blog", label: "Blog", order: 7 },
];
