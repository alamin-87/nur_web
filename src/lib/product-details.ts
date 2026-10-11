export type ProductDetailExtra = {
  overview: string;
  features: string[];
  applications: string[];
  specTable: { label: string; value: string }[];
  included: string[];
  notes: string[];
  sendUs: string[];
  warranty: string;
  condition: string;
  packing: string;
  relatedUseCaseSlugs: string[];
};

export const productDetails: Record<string, ProductDetailExtra> = {
  "siemens-s7-1200-cpu-1214c": {
    overview:
      "SIMATIC S7-1200 CPU 1214C is a compact machine controller for packaging, conveyors, small process skids and teaching benches. It combines digital I/O, analog inputs and Profinet on one CPU so a panel builder does not need a separate communication card for most SME jobs. Confirm the exact 1214C variant (DC/DC/DC vs AC/relay) against your supply and output type before ordering.",
    features: [
      "On-board digital inputs and outputs for a complete small machine",
      "Analog inputs for pressure, level or speed feedback without a first expansion card",
      "Profinet for HMI, programming and drive communication",
      "Works with TIA Portal; suitable as a step-up from relay logic or brick PLCs",
    ],
    applications: [
      "Conveyor start/stop, jam and counting",
      "Packaging and light assembly sequences",
      "Pump skids with analog pressure",
      "University / polytechnic automation benches",
    ],
    specTable: [
      { label: "Series", value: "Siemens SIMATIC S7-1200" },
      { label: "CPU class", value: "CPU 1214C" },
      { label: "Digital I/O (typical)", value: "14 DI / 10 DO — confirm variant" },
      { label: "Analog", value: "2 analog inputs (typical 1214C)" },
      { label: "Network", value: "Profinet" },
      { label: "Programming", value: "TIA Portal" },
      { label: "Supply", value: "Confirm DC or AC CPU variant" },
      { label: "Mounting", value: "DIN rail, control panel" },
    ],
    included: ["CPU unit", "Documentation note / pin intent on request"],
    notes: [
      "Order the CPU by supply and output type (transistor vs relay), not by the family name alone.",
      "Count every sensor, pushbutton, overload trip and VFD digital I/O before you decide this CPU is enough.",
      "24 VDC sensors need a sized DIN SMPS; the CPU is not the 24 V rail.",
    ],
    sendUs: [
      "Existing CPU order number if this is a replacement",
      "Supply available in the panel (24 VDC / 220 VAC)",
      "Approximate DI/DO and analog count",
      "HMI brand if already selected",
    ],
    warranty: "Supplier warranty as quoted — typically 12 months on new sealed units",
    condition: "New / equivalent class — confirm OEM vs compatible when quoting",
    packing: "Anti-static bag, inner box",
    relatedUseCaseSlugs: [
      "conveyor-packaging-automation",
      "control-panel-kits",
      "eee-lab-training-benches",
    ],
  },
  "delta-dvp-14ss2": {
    overview:
      "Delta DVP Slim 14SS2 is a cost-effective brick PLC used widely in Bangladesh OEM machines and workshop retrofits. High-speed counters and MODBUS make it practical for small conveyors, packing and student benches where Siemens pricing is not required. Expansion modules can be added if the first 14 points are not enough.",
    features: [
      "Slim body for shallow cabinets",
      "High-speed counters for encoders and fast sensors",
      "MODBUS for VFD and third-party devices",
      "WPLSoft / ISPSoft programming path",
    ],
    applications: [
      "Small packaging machines",
      "Workshop conveyor logic",
      "VFD run/fault interlocking",
      "Lab PLC courses",
    ],
    specTable: [
      { label: "Series", value: "Delta DVP Slim (SS2)" },
      { label: "I/O", value: "14 points (confirm DI/DO split)" },
      { label: "Expansion", value: "Right-side DVP modules" },
      { label: "Counters", value: "High-speed counter inputs" },
      { label: "Comms", value: "RS-232 / RS-485 MODBUS class" },
      { label: "Supply", value: "24 VDC typical for SS2 — confirm" },
      { label: "Software", value: "WPLSoft / ISPSoft" },
    ],
    included: ["PLC body", "Programming port as per variant"],
    notes: [
      "SS2 is 24 VDC class on most lots — do not assume 220 VAC like some DVP-ES models.",
      "Leave spare I/O; adding one extra sensor later is cheaper than a second CPU.",
    ],
    sendUs: [
      "Photo of the existing Delta CPU if replacing",
      "24 V or 220 V supply in the panel",
      "Need for analog or extra I/O",
    ],
    warranty: "As quoted, typically 12 months new",
    condition: "New Delta or equivalent class as stated on quote",
    packing: "Manufacturer carton",
    relatedUseCaseSlugs: [
      "conveyor-packaging-automation",
      "eee-lab-training-benches",
    ],
  },
  "mitsubishi-fx5u-32m": {
    overview:
      "FX5U-32M sits in Mitsubishi’s iQ-F compact range: Ethernet on the CPU, more memory than FX3, and a path into GX Works3. It suits OEMs who already standardise on Mitsubishi, or plants replacing FX3U that now need Ethernet to an HMI or SCADA island. Motion and analog still need the right expansion — do not assume 32 I/O covers servo axes.",
    features: [
      "Built-in Ethernet",
      "32 I/O base (confirm sink/source and relay/transistor)",
      "SD card slot on typical FX5U CPUs",
      "GX Works3 engineering",
    ],
    applications: [
      "OEM machines with Ethernet HMI",
      "FX3 upgrade projects",
      "Packaging lines needing extra comms",
      "Teaching labs that specify Mitsubishi",
    ],
    specTable: [
      { label: "Series", value: "Mitsubishi MELSEC iQ-F FX5U" },
      { label: "Base I/O", value: "32 points" },
      { label: "Network", value: "Ethernet" },
      { label: "Storage", value: "SD card (typical FX5U)" },
      { label: "Software", value: "GX Works3" },
      { label: "Supply", value: "Confirm AC or DC CPU type" },
    ],
    included: ["CPU", "Terminal block as per variant"],
    notes: [
      "Match the suffix (MR/MT/ES) for relay vs transistor and supply.",
      "Ethernet does not replace a motion module if you need interpolated axes.",
    ],
    sendUs: [
      "Exact FX5U order code if known",
      "Existing FX3 model being replaced",
      "HMI / VFD brands to talk to",
    ],
    warranty: "As quoted on new sealed stock",
    condition: "New Mitsubishi class unless quote says compatible",
    packing: "Original-style carton",
    relatedUseCaseSlugs: [
      "conveyor-packaging-automation",
      "control-panel-kits",
    ],
  },
  "omron-cp1e-n20": {
    overview:
      "CP1E-N20DR-A is an entry Omron PLC for sequential machines that still think in relays: 20 I/O, relay outputs, USB programming. It is a common replacement when a small machine has outgrown timers but does not need Profinet. Confirm AC supply and relay outputs before mixing with 24 V transistor field devices.",
    features: [
      "Relay outputs for 220 VAC coils and small loads",
      "USB programming on N-type CP1E",
      "CX-Programmer software path",
      "Simple replacement for aging relay panels",
    ],
    applications: [
      "Small sequential machines",
      "Student first PLC projects",
      "Timer-to-PLC upgrades",
      "Light OEM equipment",
    ],
    specTable: [
      { label: "Series", value: "Omron CP1E" },
      { label: "Model class", value: "N20DR-A" },
      { label: "I/O", value: "20 points" },
      { label: "Outputs", value: "Relay" },
      { label: "Programming", value: "USB, CX-Programmer" },
      { label: "Supply", value: "AC (DR-A class) — confirm" },
    ],
    included: ["CPU", "Input/output terminals"],
    notes: [
      "Relay outputs are not for high-speed PWM or fine pulse trains.",
      "Use interposing relays if field loads exceed the CPU contact rating.",
    ],
    sendUs: ["Photo of existing CP1 / CPM if replacing", "Load type on each output"],
    warranty: "As quoted",
    condition: "New / equivalent",
    packing: "Carton",
    relatedUseCaseSlugs: ["eee-lab-training-benches", "control-panel-kits"],
  },
  "induction-motor-1-5hp": {
    overview:
      "A 1.5 HP (≈1.1 kW) three-phase induction motor for pumps, small conveyors and workshop machines. Foot-mounted IE2-class frames are the usual stock. Shaft diameter, keyway, B3 vs B5 flange and voltage (380–415 V) must match the old machine — horsepower alone is not a fit.",
    features: [
      "Three-phase industrial duty",
      "IE2 efficiency class on typical lots",
      "Foot mount (B3); flange options on request",
      "Pairs with a 1.5–2.2 kW VFD for soft start",
    ],
    applications: [
      "Water and process pumps",
      "Light conveyors",
      "Fans and blowers in this kW class",
      "Machine-tool auxiliaries",
    ],
    specTable: [
      { label: "Power", value: "1.5 HP / ≈1.1 kW" },
      { label: "Supply", value: "3-phase, 380–415 V class" },
      { label: "Speed class", value: "4-pole ≈1400 rpm (50 Hz)" },
      { label: "Efficiency", value: "IE2 typical" },
      { label: "Mounting", value: "Foot (B3); confirm flange" },
      { label: "Insulation / IP", value: "Confirm lot (typically IP55 class)" },
      { label: "Starting", value: "DOL, star-delta or VFD" },
    ],
    included: ["Motor", "Nameplate", "Shaft key where supplied"],
    notes: [
      "Send a photo of the old nameplate and shaft. Frame (e.g. 90L) matters more than brand.",
      "For pumps and fans, a VFD of at least motor kW is the usual pairing.",
      "Check rotation before coupling; swap two phases to reverse.",
    ],
    sendUs: [
      "Nameplate photo (kW, A, V, rpm, frame)",
      "Shaft diameter / coupling photo",
      "Foot or flange, and how it is started today",
    ],
    warranty: "As quoted, typically 6–12 months on new motors",
    condition: "New IE2 class unless stated reconditioned",
    packing: "Wooden crate or carton by size",
    relatedUseCaseSlugs: [
      "machine-downtime-spare-parts",
      "pump-fan-vfd-retrofit",
      "textile-rmg-utility-drives",
    ],
  },
  "induction-motor-3hp": {
    overview:
      "3 HP (≈2.2 kW) three-phase motor for fans, mixers, larger workshop pumps and light machine tools. Same matching rules as 1.5 HP: frame, shaft, mounting and FLA first. A 2.2–3.7 kW VFD is the usual electronic start if DOL inrush is a problem.",
    features: [
      "2.2 kW class industrial motor",
      "IE2 typical",
      "Foot / flange options",
      "Suitable for VFD duty when insulation and cooling allow",
    ],
    applications: ["Mixers", "Larger pumps", "Workshop fans", "Light machine drives"],
    specTable: [
      { label: "Power", value: "3 HP / ≈2.2 kW" },
      { label: "Supply", value: "3-phase 380–415 V" },
      { label: "Poles / speed", value: "Confirm 2-pole or 4-pole from nameplate" },
      { label: "Mounting", value: "B3 / B5 on request" },
      { label: "Protection pairing", value: "Contactor + overload or VFD" },
    ],
    included: ["Motor", "Nameplate"],
    notes: [
      "Overload relay must be set to actual FLA, not to horsepower folklore.",
      "Long-duty textile fans may need a confirmed TEFC / IP rating.",
    ],
    sendUs: ["Nameplate", "Application (fan/pump/mixer)", "DOL or VFD"],
    warranty: "As quoted",
    condition: "New unless quoted otherwise",
    packing: "Crate / carton",
    relatedUseCaseSlugs: ["pump-fan-vfd-retrofit", "textile-rmg-utility-drives"],
  },
  "vfd-2-2kw": {
    overview:
      "2.2 kW, 380–440 V class VFD for small three-phase motors: pumps, fans, conveyors and machine spindles in the 2–3 HP band. Soft ramp cuts mechanical shock; Modbus covers PLC speed/run on many workshop panels. Size from motor FLA, not from horsepower rounded up twice.",
    features: [
      "Soft start / stop ramps",
      "V/F control; vector on many lots — confirm",
      "Modbus RTU on typical compact drives",
      "Electronic overload and stall protection",
    ],
    applications: [
      "1.5–2.2 kW pumps and fans",
      "Small conveyors",
      "Workshop machine speed pots",
      "Energy reduction vs throttling valves",
    ],
    specTable: [
      { label: "Power", value: "2.2 kW" },
      { label: "Mains", value: "3-phase 380–440 V class" },
      { label: "Output", value: "3-phase to motor" },
      { label: "Control", value: "Digital I/O, analog speed, Modbus" },
      { label: "Protection", value: "Overcurrent, overvoltage, overload" },
      { label: "Enclosure", value: "IP20 typical — panel mount" },
    ],
    included: ["Drive", "Basic parameter note on request"],
    notes: [
      "Input breaker is sized to the drive, with a proper earth.",
      "Motor cable length: keep short; use screened cable on longer runs.",
      "Do not bypass the motor thermal path entirely.",
      "Industry literature often cites 20–40% energy reduction on pumps/fans when speed follows load — site result depends on duty.",
    ],
    sendUs: [
      "Motor nameplate (kW, FLA, V)",
      "1-ph or 3-ph available at the panel",
      "Pump / fan / conveyor / other",
      "Need for PID or only a speed pot",
    ],
    warranty: "As quoted, typically 12 months",
    condition: "New Delta / INVT class as stated",
    packing: "Carton with foam",
    relatedUseCaseSlugs: [
      "pump-fan-vfd-retrofit",
      "textile-rmg-utility-drives",
      "conveyor-packaging-automation",
    ],
  },
  "vfd-5-5kw": {
    overview:
      "5.5 kW VFD for mid-size pumps, AHU fans and conveyor lines. PID is useful on pressure or temperature loops; a brake chopper is relevant on high-inertia or fast-stop loads. Confirm motor FLA and whether the supply is truly three-phase at this current.",
    features: [
      "PID process control",
      "Multi-speed terminals",
      "Brake chopper ready on typical mid frames",
      "Modbus / digital control",
    ],
    applications: ["Process pumps", "AHU / exhaust", "Heavier conveyors", "Compressors (duty check)"],
    specTable: [
      { label: "Power", value: "5.5 kW" },
      { label: "Input / output", value: "3-phase in / 3-phase out" },
      { label: "Control", value: "PID, multi-speed, analog" },
      { label: "Brake", value: "Chopper ready — resistor extra" },
    ],
    included: ["Drive"],
    notes: [
      "Constant-torque loads (some mixers, conveyors) need a drive rated for that duty, not only pump curves.",
      "Harmonics and EMC: keep motor cables dressed and earthed.",
    ],
    sendUs: ["FLA and kW", "Duty cycle", "Need for braking resistor"],
    warranty: "As quoted",
    condition: "New class as quoted",
    packing: "Carton",
    relatedUseCaseSlugs: ["pump-fan-vfd-retrofit", "textile-rmg-utility-drives"],
  },
  "proximity-sensor-m18": {
    overview:
      "M18 inductive proximity sensor for metal targets: end-of-travel, fixture present, and simple counting on steel parts. Choose NPN or PNP to match the PLC input type. 10–30 VDC, IP67 housings are the workshop standard. Sensing distance is typically a few millimetres flush — do not expect it to see plastic cartons.",
    features: [
      "M18 threaded barrel",
      "NPN or PNP output (state on order)",
      "10–30 VDC",
      "IP67 class housing on typical lots",
    ],
    applications: [
      "Cylinder / slide end positions",
      "Metal part present on a jig",
      "Gear or cam counting (with care)",
      "Lab sensor experiments",
    ],
    specTable: [
      { label: "Size", value: "M18" },
      { label: "Type", value: "Inductive, metal only" },
      { label: "Output", value: "NPN or PNP, NO/NC" },
      { label: "Supply", value: "10–30 VDC" },
      { label: "Ingress", value: "IP67 typical" },
      { label: "Connection", value: "Cable or M12 — confirm lot" },
    ],
    included: ["Sensor", "Nuts"],
    notes: [
      "Inductive sensors ignore cardboard, plastic and liquid — use photoelectric there.",
      "Shielded vs unshielded changes sensing distance and flush mounting.",
    ],
    sendUs: ["NPN or PNP required", "NO or NC", "Cable or connector", "Photo of the old sensor"],
    warranty: "As quoted",
    condition: "New Autonics / equivalent class",
    packing: "Bag / box",
    relatedUseCaseSlugs: [
      "conveyor-packaging-automation",
      "machine-downtime-spare-parts",
      "eee-lab-training-benches",
    ],
  },
  "photoelectric-sensor-kit": {
    overview:
      "Diffuse and through-beam photoelectric sensors for presence and counting where the target is not metal: cartons, bottles, film, people-on-a-line (with safety rules). Adjustable sensitivity helps with colour and dust, but dirty lenses still fail — plan wiping in packaging rooms.",
    features: [
      "Diffuse and through-beam options in the kit class",
      "12–24 VDC",
      "Sensitivity adjust",
      "Visible alignment on many lots",
    ],
    applications: ["Carton counting", "Fill/pack presence", "Label gap (selected models)", "Non-metal jigs"],
    specTable: [
      { label: "Modes", value: "Diffuse / through-beam" },
      { label: "Supply", value: "12–24 VDC" },
      { label: "Output", value: "NPN/PNP — confirm" },
      { label: "Range", value: "Depends on mode; state target distance" },
    ],
    included: ["Sensor pair or diffuse unit as quoted", "Brackets if in lot"],
    notes: [
      "Through-beam needs a clear line of sight and a reflector or emitter/receiver pair.",
      "Do not use a standard PE sensor as a safety light curtain.",
    ],
    sendUs: ["Target material and distance", "Dust / water on site", "PLC input type"],
    warranty: "As quoted",
    condition: "New equivalent class",
    packing: "Box",
    relatedUseCaseSlugs: ["conveyor-packaging-automation", "eee-lab-training-benches"],
  },
  "contactor-25a": {
    overview:
      "25 A three-pole AC contactor for DOL starters and panel feeders in the small-motor range. Coil voltage is a first-class choice: 220 VAC and 24 VDC are both common in Bangladesh panels and must not be mixed. Aux contacts provide interlocking to PLCs and overload relays.",
    features: [
      "3-pole power switching",
      "Auxiliary contacts",
      "Coil 220 VAC or 24 VDC on request",
      "DIN / standard mounting",
    ],
    applications: ["DOL starters", "Heater / feeder switching (check AC-1/AC-3)", "Reversing pairs"],
    specTable: [
      { label: "Current class", value: "25 A" },
      { label: "Poles", value: "3" },
      { label: "Utilisation", value: "AC-3 motor duty — confirm kW" },
      { label: "Coil", value: "220 VAC / 24 VDC" },
      { label: "Aux", value: "1NO+1NC typical; extra kits available" },
    ],
    included: ["Contactor"],
    notes: [
      "AC-3 rating vs motor kW depends on voltage; 25 A is not automatically “10 HP”.",
      "Pair with a thermal overload set to FLA.",
    ],
    sendUs: ["Motor kW and FLA", "Coil voltage", "Reversing or single DOL"],
    warranty: "As quoted",
    condition: "Schneider / Chint class as quoted",
    packing: "Box",
    relatedUseCaseSlugs: ["control-panel-kits", "machine-downtime-spare-parts"],
  },
  "contactor-40a": {
    overview:
      "40 A three-pole contactor for larger motors and feeders. Same coil-voltage discipline as 25 A. Check AC-3 tables for the actual kW at 400 V; utilisation category matters more than the number printed on the shop shelf.",
    features: ["40 A class", "3-pole", "AC-3 motor duty", "Optional aux kit"],
    applications: ["5–10 HP class motors (verify table)", "Larger DOL", "Feeder switching"],
    specTable: [
      { label: "Current class", value: "40 A" },
      { label: "Poles", value: "3" },
      { label: "Utilisation", value: "AC-3" },
      { label: "Coil", value: "State 220 VAC or 24 VDC" },
    ],
    included: ["Contactor"],
    notes: ["For frequent jogging, check mechanical/electrical endurance, not only amps."],
    sendUs: ["kW, FLA, starts per hour", "Coil voltage"],
    warranty: "As quoted",
    condition: "New class as quoted",
    packing: "Box",
    relatedUseCaseSlugs: ["control-panel-kits"],
  },
  "thermal-overload-relay": {
    overview:
      "Thermal overload relay mounts under a matching contactor and trips on prolonged overcurrent. Set the dial to motor FLA from the nameplate. 1NO+1NC contacts stop the coil and tell a PLC the motor is in fault. Manual vs auto reset is a site safety choice — auto reset on an unattended pump can restart a jammed machine.",
    features: ["Adjustable FLA window", "1NO+1NC", "Manual / auto reset", "Direct contactor mount on matching frames"],
    applications: ["DOL / reversing starters", "Pump protection", "Workshop motors"],
    specTable: [
      { label: "Function", value: "Thermal overload" },
      { label: "Range", value: "Select window around motor FLA" },
      { label: "Contacts", value: "1NO + 1NC typical" },
      { label: "Reset", value: "Manual or auto" },
    ],
    included: ["Overload relay"],
    notes: [
      "The range must cover FLA; a 1–1.6 A unit will not protect a 9 A motor.",
      "VFD-driven motors often use the drive overload; a second thermal may still be specified by some plants.",
    ],
    sendUs: ["Motor FLA", "Contactor brand/frame to mount under"],
    warranty: "As quoted",
    condition: "Matching class to the contactor",
    packing: "Box",
    relatedUseCaseSlugs: ["control-panel-kits", "machine-downtime-spare-parts"],
  },
  "timer-relay": {
    overview:
      "Multi-mode DIN timer (on-delay, off-delay, cyclic) for machines that still run on relay logic. 8-pin or 11-pin bases are not interchangeable — match the socket. Useful before a PLC is justified, and as a hardwired safety delay even when a PLC exists.",
    features: ["Multi-mode", "Wide time range 0.1 s–10 h class", "DIN rail", "8-pin / 11-pin"],
    applications: ["Star-delta transition (with care)", "Dwell timers", "Simple sequences", "Lab demos"],
    specTable: [
      { label: "Range", value: "0.1 s to 10 h class (multi-range)" },
      { label: "Modes", value: "On-delay, off-delay, cyclic (typical)" },
      { label: "Mount", value: "DIN + octal/11-pin base" },
      { label: "Coil / supply", value: "Confirm 24 VDC or 220 VAC" },
    ],
    included: ["Timer", "Base if quoted"],
    notes: ["Star-delta timers need the correct sequence and overlap; a random on-delay is not a star-delta kit."],
    sendUs: ["8-pin or 11-pin", "Supply voltage", "Function required"],
    warranty: "As quoted",
    condition: "Omron / equivalent class",
    packing: "Box",
    relatedUseCaseSlugs: ["control-panel-kits", "eee-lab-training-benches"],
  },
  "mcb-32a-3p": {
    overview:
      "32 A three-pole C-curve MCB for motor and distribution feeders in control panels. Breaking capacity (e.g. 6 kA) must suit the prospective fault at the board. C-curve is the usual workshop choice; D-curve is for high inrush motors — do not mix them by accident.",
    features: ["32 A", "3P", "C-curve typical", "6 kA class typical"],
    applications: ["Panel incoming on small boards", "Motor feeder (check inrush)", "Three-phase loads"],
    specTable: [
      { label: "Rating", value: "32 A" },
      { label: "Poles", value: "3" },
      { label: "Curve", value: "C (D on request)" },
      { label: "Icu class", value: "6 kA typical — confirm" },
      { label: "Standard", value: "IEC 60898 / 60947 class as marked" },
    ],
    included: ["MCB"],
    notes: ["VFD input protection may need manufacturer guidance; a random MCB can nuisance-trip on capacitors."],
    sendUs: ["Load type", "C or D curve", "Board brand if matching busbar"],
    warranty: "As quoted",
    condition: "Schneider / Chint class",
    packing: "Box",
    relatedUseCaseSlugs: ["control-panel-kits"],
  },
  "hmi-7-inch": {
    overview:
      "7-inch industrial HMI for PLC visualisation: start/stop, recipes, fault text. Ethernet plus RS-232/485 covers Delta, Siemens S7-1200, Mitsubishi FX and many Modbus devices. IP65 on the front only — the cut-out and rear of the panel still see workshop dust unless sealed.",
    features: [
      "7-inch touch",
      "Ethernet",
      "RS-232 / RS-485",
      "IP65 front typical",
    ],
    applications: ["Machine operator panel", "Recipe select", "Alarm display", "Student HMI labs"],
    specTable: [
      { label: "Size", value: "7 inch" },
      { label: "Network", value: "Ethernet" },
      { label: "Serial", value: "RS-232 / RS-485" },
      { label: "Front IP", value: "IP65 typical" },
      { label: "PLC drivers", value: "Delta, Siemens, Mitsubishi, Modbus class" },
    ],
    included: ["HMI", "Panel clamps"],
    notes: [
      "Confirm cut-out dimensions before punching the door.",
      "24 VDC supply with headroom; do not starve the HMI from a tiny SMPS shared with too many relays.",
    ],
    sendUs: ["PLC brand and CPU", "Ethernet or serial", "Door cut-out if replacing"],
    warranty: "As quoted",
    condition: "Weintek / Delta class as quoted",
    packing: "Carton",
    relatedUseCaseSlugs: ["conveyor-packaging-automation", "control-panel-kits"],
  },
  "smps-24v-10a": {
    overview:
      "24 VDC 10 A DIN-rail SMPS for PLC, HMI, sensors and 24 V coils. Size with 20–30% headroom: a 10 A unit is not 10 A of “forever” if the panel also dumps inrush from many relays. Overload and overvoltage protection are standard on industrial lots.",
    features: ["24 VDC", "10 A", "DIN rail", "Overload / OVP typical"],
    applications: ["PLC panels", "Sensor rails", "24 V contactor coils", "Lab benches"],
    specTable: [
      { label: "Output", value: "24 VDC, 10 A (240 W class)" },
      { label: "Input", value: "Universal AC typical 100–240 V — confirm" },
      { label: "Mount", value: "DIN rail" },
      { label: "Protection", value: "Overload, overvoltage" },
    ],
    included: ["SMPS"],
    notes: [
      "Add loads: PLC + HMI + sensors + 24 V coils, then apply headroom.",
      "Separate 24 V from 400 V motor wiring physically.",
    ],
    sendUs: ["List of 24 V loads or a photo of the rail", "Input mains"],
    warranty: "As quoted; Mean Well class often longer — confirm lot",
    condition: "Mean Well / equivalent industrial",
    packing: "Box",
    relatedUseCaseSlugs: ["control-panel-kits", "eee-lab-training-benches"],
  },
  "bearing-6205": {
    overview:
      "6205 deep-groove ball bearing, 25 × 52 × 15 mm, the common motor and pulley size in small machines. 2RS (contact seals) for dusty workshops; ZZ (metal shields) where speed and lower drag matter. Match the old bearing’s suffix, not only “6205”.",
    features: ["6205 size", "25×52×15 mm", "2RS or ZZ", "Motor / fan / pulley duty"],
    applications: ["Electric motors", "Pulleys", "Fans", "Light gearboxes"],
    specTable: [
      { label: "ISO", value: "6205" },
      { label: "Dimensions", value: "25 × 52 × 15 mm" },
      { label: "Seals", value: "2RS / ZZ on request" },
      { label: "Clearance", value: "C3 on request for hot motors" },
    ],
    included: ["Bearing"],
    notes: ["C3 clearance is often used on electric motors; standard C0 may run hot. State duty."],
    sendUs: ["2RS or ZZ", "C3 or standard", "How many", "Photo of the old bearing"],
    warranty: "As quoted",
    condition: "SKF / equivalent grade as quoted — grades differ, price follows",
    packing: "Industrial wrap",
    relatedUseCaseSlugs: ["machine-downtime-spare-parts"],
  },
  "control-cable-4c": {
    overview:
      "Flexible 1.5 mm² four-core control cable, sold per metre, for 24 VDC I/O and 220 VAC control circuits. Not a substitute for screened motor cable on long VFD runs. Colour cores help panel wiremen; confirm YY / CY / SY if you need braid screen.",
    features: ["1.5 mm²", "4 core", "Flexible", "Per metre"],
    applications: ["Panel to field I/O", "Pushbutton stations", "24 V sensor drops", "Coil circuits"],
    specTable: [
      { label: "Section", value: "1.5 mm²" },
      { label: "Cores", value: "4" },
      { label: "Sale unit", value: "Per metre (cut length)" },
      { label: "Voltage class", value: "Control 300/500 V typical — confirm" },
    ],
    included: ["Cable, cut length"],
    notes: ["For VFD motor leads, ask for screened cable separately.", "Minimum order length may apply."],
    sendUs: ["Length in metres", "Need for screen (CY/SY)", "Indoor / outdoor"],
    warranty: "Manufacturing defect as quoted",
    condition: "BRB / equivalent",
    packing: "Coil / drum",
    relatedUseCaseSlugs: ["control-panel-kits", "machine-downtime-spare-parts"],
  },
  "encoder-400ppr": {
    overview:
      "400 PPR incremental encoder for speed and position: PLC high-speed counters, length cutting, and VFD pulse input. AB or ABZ quadrature; 5–24 VDC; typical 6 mm shaft. Coupling alignment matters more than PPR bragging rights — a crushed coupling looks like a bad encoder.",
    features: ["400 PPR", "A/B or A/B/Z", "5–24 VDC", "6 mm shaft typical"],
    applications: ["Length measure", "Speed feedback", "Simple positioning", "Lab motion"],
    specTable: [
      { label: "Resolution", value: "400 PPR" },
      { label: "Signals", value: "AB / ABZ line driver or totem — confirm" },
      { label: "Supply", value: "5–24 VDC" },
      { label: "Shaft", value: "6 mm typical" },
      { label: "Body", value: "Confirm diameter (often 38–50 mm)" },
    ],
    included: ["Encoder", "Note on wiring colours on request"],
    notes: [
      "Match NPN/PNP or line-driver to the PLC high-speed input spec.",
      "Use a flexible coupling; do not hard-set a misaligned shaft.",
    ],
    sendUs: ["PLC high-speed input type", "Shaft diameter", "PPR required", "Cable length"],
    warranty: "As quoted",
    condition: "Autonics / equivalent",
    packing: "Box",
    relatedUseCaseSlugs: ["conveyor-packaging-automation", "eee-lab-training-benches"],
  },
};

export function getProductDetail(slug: string): ProductDetailExtra | null {
  return productDetails[slug] ?? null;
}
