import type {
  ICategory,
  ISubCategory,
  IBanner,
  IProduct,
  IService,
  ISiteSettings,
  ICompanyProfile,
} from "./models";
import { navLinks, useCaseContent } from "./use-cases";

export const mockImg = {
  desk: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80",
  plc: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80",
  motor: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80",
  drive: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80",
  sensor: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1600&q=80",
  panel: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
  factory: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1600&q=80",
  bearing: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80",
  cable: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80",
  workshop: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=1600&q=80",
};

export const mockCategories: ICategory[] = [
  { _id: "cat-1", name: "Injection molding machine", slug: "injection-molding-machine", type: "product", order: 1, description: "Industrial plastic injection molding machinery and auxiliary equipment." },
  { _id: "cat-2", name: "PLC & HMI", slug: "plc-hmi", type: "product", order: 2, description: "Programmable logic controllers, HMI touch screens and complete automation sets." },
  { _id: "cat-3", name: "Servo System", slug: "servo-system", type: "product", order: 3, description: "High-precision servo drives, motors, pumps, encoders and accessories." },
  { _id: "cat-4", name: "Circuit boards/cards", slug: "circuit-boards-cards", type: "product", order: 4, description: "MMR, temperature, I/O, amplifier and specialized control boards." },
  { _id: "cat-5", name: "Blow molding machine (BMM)", slug: "blow-molding-machine-bmm", type: "product", order: 5, description: "Semi-auto PET, HDPE, and extrusion blow molding systems." },
  { _id: "cat-6", name: "Industrial chiller", slug: "industrial-chiller", type: "product", order: 6, description: "Water-cooled and air-cooled industrial refrigeration chillers." },
  { _id: "cat-7", name: "Crusher machine", slug: "crusher-machine", type: "product", order: 7, description: "Heavy-duty plastic granulators, shredders and crushing machinery." },
  { _id: "cat-8", name: "Mixer machine", slug: "mixer-machine", type: "product", order: 8, description: "Color mixers, vertical dryers and raw material mixing equipment." },
  { _id: "cat-9", name: "Printing and Packaging machine", slug: "printing-and-packaging-machine", type: "product", order: 9, description: "Heat seal, shrink wrap, hot stamping and pad printing machines." },
  { _id: "cat-10", name: "Technical Service", slug: "technical-service", type: "service", order: 10 },
];

export const mockSubCategories: ISubCategory[] = [
  // Injection molding machine (cat-1)
  { _id: "sub-1-1", name: "Horizontal Injection molding machine", slug: "horizontal-injection-molding-machine", category: "cat-1", order: 1 },
  { _id: "sub-1-2", name: "Vertical Injection molding machine", slug: "vertical-injection-molding-machine", category: "cat-1", order: 2 },
  { _id: "sub-1-3", name: "Twin Color injection molding machine", slug: "twin-color-injection-molding-machine", category: "cat-1", order: 3 },
  { _id: "sub-1-4", name: "Blow molding machine", slug: "blow-molding-machine", category: "cat-1", order: 4 },
  { _id: "sub-1-5", name: "Semi Auto PET blow molding machine", slug: "semi-auto-pet-blow-molding-machine", category: "cat-1", order: 5 },
  { _id: "sub-1-6", name: "Injection Blow molding machine", slug: "injection-blow-molding-machine", category: "cat-1", order: 6 },
  { _id: "sub-1-7", name: "HDPE blow molding machine", slug: "hdpe-blow-molding-machine", category: "cat-1", order: 7 },
  { _id: "sub-1-8", name: "Crusher machine", slug: "crusher-machine-sub", category: "cat-1", order: 8 },
  { _id: "sub-1-9", name: "Mixer machine", slug: "mixer-machine-sub", category: "cat-1", order: 9 },
  { _id: "sub-1-10", name: "Industrial chiller", slug: "industrial-chiller-sub", category: "cat-1", order: 10 },
  { _id: "sub-1-11", name: "Printing machine", slug: "printing-machine", category: "cat-1", order: 11 },
  { _id: "sub-1-12", name: "Packaging machine", slug: "packaging-machine", category: "cat-1", order: 12 },
  { _id: "sub-1-13", name: "Overhead crane", slug: "overhead-crane", category: "cat-1", order: 13 },
  { _id: "sub-1-14", name: "Air compressor", slug: "air-compressor", category: "cat-1", order: 14 },

  // PLC & HMI (cat-2)
  { _id: "sub-2-1", name: "Injection molding machine PLC", slug: "injection-molding-machine-plc", category: "cat-2", order: 1 },
  { _id: "sub-2-2", name: "Semi Auto PET blow controller", slug: "semi-auto-pet-blow-controller", category: "cat-2", order: 2 },
  { _id: "sub-2-3", name: "PLC full set", slug: "plc-full-set", category: "cat-2", order: 3 },
  { _id: "sub-2-4", name: "HMI full set", slug: "hmi-full-set", category: "cat-2", order: 4 },
  { _id: "sub-2-5", name: "TECH1 PLC set", slug: "tech1-plc-set", category: "cat-2", order: 5 },
  { _id: "sub-2-6", name: "TECH2 PLC set", slug: "tech2-plc-set", category: "cat-2", order: 6 },
  { _id: "sub-2-7", name: "AK580 PLC set", slug: "ak580-plc-set", category: "cat-2", order: 7 },
  { _id: "sub-2-8", name: "AK628 PLC set", slug: "ak628-plc-set", category: "cat-2", order: 8 },
  { _id: "sub-2-9", name: "AK668 PLC set", slug: "ak668-plc-set", category: "cat-2", order: 9 },
  { _id: "sub-2-10", name: "iTech PLC set", slug: "itech-plc-set", category: "cat-2", order: 10 },
  { _id: "sub-2-11", name: "Poncheson MS300 PLC set", slug: "poncheson-ms300-plc-set", category: "cat-2", order: 11 },
  { _id: "sub-2-12", name: "Poncheson MS500 PLC set", slug: "poncheson-ms500-plc-set", category: "cat-2", order: 12 },
  { _id: "sub-2-13", name: "Poncheson MS700 PLC set", slug: "poncheson-ms700-plc-set", category: "cat-2", order: 13 },
  { _id: "sub-2-14", name: "HAITIAN HMI", slug: "haitian-hmi", category: "cat-2", order: 14 },
  { _id: "sub-2-15", name: "MMI card", slug: "mmi-card", category: "cat-2", order: 15 },
  { _id: "sub-2-16", name: "Likui PLC", slug: "likui-plc", category: "cat-2", order: 16 },
  { _id: "sub-2-17", name: "Ai530Li", slug: "ai530li", category: "cat-2", order: 17 },
  { _id: "sub-2-18", name: "MI538Li", slug: "mi538li", category: "cat-2", order: 18 },
  { _id: "sub-2-19", name: "HERING 628", slug: "hering-628", category: "cat-2", order: 19 },
  { _id: "sub-2-20", name: "Siemens", slug: "siemens", category: "cat-2", order: 20 },
  { _id: "sub-2-21", name: "DELTA", slug: "delta", category: "cat-2", order: 21 },
  { _id: "sub-2-22", name: "MITSUBISHI", slug: "mitsubishi", category: "cat-2", order: 22 },
  { _id: "sub-2-23", name: "ALLEN BRADLY", slug: "allen-bradly", category: "cat-2", order: 23 },

  // Servo System (cat-3)
  { _id: "sub-3-1", name: "Servo Drive (INOVANCE, Hilectro, Techmation, HiTech, KEB)", slug: "servo-drive", category: "cat-3", order: 1 },
  { _id: "sub-3-2", name: "Servo motor", slug: "servo-motor", category: "cat-3", order: 2 },
  { _id: "sub-3-3", name: "Servo pump", slug: "servo-pump", category: "cat-3", order: 3 },
  { _id: "sub-3-4", name: "Encoder", slug: "encoder", category: "cat-3", order: 4 },
  { _id: "sub-3-5", name: "Breaking Resistor", slug: "breaking-resistor", category: "cat-3", order: 5 },
  { _id: "sub-3-6", name: "Encoder cable", slug: "encoder-cable", category: "cat-3", order: 6 },
  { _id: "sub-3-7", name: "Coupling items", slug: "coupling-items", category: "cat-3", order: 7 },
  { _id: "sub-3-8", name: "Pressure sensor", slug: "pressure-sensor", category: "cat-3", order: 8 },

  // Circuit boards/cards (cat-4)
  { _id: "sub-4-1", name: "MMR card (MMR 270, MMR 255)", slug: "mmr-card", category: "cat-4", order: 1 },
  { _id: "sub-4-2", name: "Temperature card", slug: "temperature-card", category: "cat-4", order: 2 },
  { _id: "sub-4-3", name: "Pressure & Flow control card", slug: "pressure-flow-control-card", category: "cat-4", order: 3 },
  { _id: "sub-4-4", name: "Thermo couple connection card", slug: "thermo-couple-connection-card", category: "cat-4", order: 4 },
  { _id: "sub-4-5", name: "I/O Card", slug: "io-card", category: "cat-4", order: 5 },
  { _id: "sub-4-6", name: "PLC I/O Amplifier card", slug: "plc-io-amplifier-card", category: "cat-4", order: 6 },
  { _id: "sub-4-7", name: "TECH1", slug: "tech1", category: "cat-4", order: 7 },
  { _id: "sub-4-8", name: "TECH2", slug: "tech2", category: "cat-4", order: 8 },
  { _id: "sub-4-9", name: "AK580", slug: "ak580", category: "cat-4", order: 9 },
  { _id: "sub-4-10", name: "AK668", slug: "ak668", category: "cat-4", order: 10 },
  { _id: "sub-4-11", name: "MS300", slug: "ms300", category: "cat-4", order: 11 },
  { _id: "sub-4-12", name: "MS500", slug: "ms500", category: "cat-4", order: 12 },
  { _id: "sub-4-13", name: "MS700", slug: "ms700", category: "cat-4", order: 13 },
  { _id: "sub-4-14", name: "Ai530Li", slug: "ai530li-card", category: "cat-4", order: 14 },
  { _id: "sub-4-15", name: "MI530Li", slug: "mi530li-card", category: "cat-4", order: 15 },
  { _id: "sub-4-16", name: "Ai580T6", slug: "ai580t6", category: "cat-4", order: 16 },
  { _id: "sub-4-17", name: "MI580T8", slug: "mi580t8", category: "cat-4", order: 17 },
  { _id: "sub-4-18", name: "Ai103", slug: "ai103", category: "cat-4", order: 18 },

  // Blow molding machine (BMM) (cat-5)
  { _id: "sub-5-1", name: "Semi Auto PET blowing machine", slug: "semi-auto-pet-blowing-machine", category: "cat-5", order: 1 },
  { _id: "sub-5-2", name: "HDPE blow molding machine", slug: "hdpe-blow-molding-machine-bmm", category: "cat-5", order: 2 },
  { _id: "sub-5-3", name: "Extrusion blowing machine for sheet", slug: "extrusion-blowing-machine-sheet", category: "cat-5", order: 3 },

  // Industrial chiller (cat-6)
  { _id: "sub-6-1", name: "Water cooled chiller", slug: "water-cooled-chiller", category: "cat-6", order: 1 },
  { _id: "sub-6-2", name: "Air cooled chiller", slug: "air-cooled-chiller", category: "cat-6", order: 2 },

  // Printing and Packaging machine (cat-9)
  { _id: "sub-9-1", name: "Heat seal printing machine", slug: "heat-seal-printing-machine", category: "cat-9", order: 1 },
  { _id: "sub-9-2", name: "Shrink wrapping machine", slug: "shrink-wrapping-machine", category: "cat-9", order: 2 },
  { _id: "sub-9-3", name: "Hot stamping machine", slug: "hot-stamping-machine", category: "cat-9", order: 3 },
  { _id: "sub-9-4", name: "PAD Printing machine", slug: "pad-printing-machine", category: "cat-9", order: 4 },
];

const catMap = Object.fromEntries(mockCategories.map((c) => [c.slug, c]));

export const mockBanners: IBanner[] = [
  {
    _id: "ban-1",
    title: "Industrial PLC & Automation Parts",
    subtitle: "Siemens, Delta, Mitsubishi and Omron controllers in stock for panel builders.",
    image: mockImg.plc,
    ctaLabel: "Browse PLC",
    ctaHref: "/products?category=plc",
    order: 1,
    active: true,
  },
  {
    _id: "ban-2",
    title: "Motors, Drives & Spare Parts",
    subtitle: "Matched 3-phase motors and VFDs for pumps, conveyors and workshop machines.",
    image: mockImg.motor,
    ctaLabel: "View motors",
    ctaHref: "/products?category=motors",
    order: 2,
    active: true,
  },
  {
    _id: "ban-3",
    title: "Technical Service You Can Call",
    subtitle: "EEE-backed part matching, panel support and substitution advice.",
    image: mockImg.workshop,
    ctaLabel: "Our services",
    ctaHref: "/services",
    order: 3,
    active: true,
  },
];

export const mockServices: IService[] = [
  {
    _id: "svc-1",
    title: "Industrial machineries",
    slug: "industrial-machineries",
    shortDescription: "Supply, installation and maintenance of heavy industrial machines.",
    description: "Complete sourcing, engineering and maintenance services for industrial machinery.",
    image: mockImg.factory,
    features: ["Machinery supply", "Commissioning", "Maintenance"],
    category: "cat-10",
    order: 1,
    featured: true,
    published: true,
  },
  {
    _id: "svc-2",
    title: "Machine spare parts",
    slug: "machine-spare-parts",
    shortDescription: "Genuine OEM and compatible spare parts for rapid machine recovery.",
    description: "Sourcing and supply of electrical, electronic, hydraulic and mechanical parts.",
    image: mockImg.workshop,
    features: ["OEM spares", "Cross-matching", "Express delivery"],
    category: "cat-10",
    order: 2,
    featured: true,
    published: true,
  },
  {
    _id: "svc-3",
    title: "Technical services",
    slug: "technical-services",
    shortDescription: "Professional EEE diagnosis, repairs and onsite troubleshooting.",
    description: "Expert engineering support for panel troubleshooting, card repair and maintenance.",
    image: mockImg.panel,
    features: ["Circuit diagnostics", "Emergency repair", "Panel overhaul"],
    category: "cat-10",
    order: 3,
    featured: true,
    published: true,
  },
  {
    _id: "svc-4",
    title: "Industrial Automation",
    slug: "industrial-automation",
    shortDescription: "PLC programming, SCADA integration, servo tuning and sensor retrofitting.",
    description: "Custom turnkey automation solutions for production lines and robotic processes.",
    image: mockImg.plc,
    features: ["PLC & HMI", "Motion control", "Sensor integration"],
    category: "cat-10",
    order: 4,
    featured: true,
    published: true,
  },
  {
    _id: "svc-5",
    title: "Factory Installation",
    slug: "factory-installation",
    shortDescription: "End-to-end electrical wiring, panel setup and machine line commissioning.",
    description: "Complete plant installation, power distribution and machine line integration.",
    image: mockImg.workshop,
    features: ["Plant wiring", "Line commissioning", "Safety compliance"],
    category: "cat-10",
    order: 5,
    featured: true,
    published: true,
  },
  {
    _id: "svc-6",
    title: "Robotics",
    slug: "robotics",
    shortDescription: "Robotic arm integration, pick-and-place automation and servo articulation.",
    description: "Modern robotic automation for injection molding part takeout, packaging and palletizing.",
    image: mockImg.drive,
    features: ["Articulated arms", "Pick & place", "Servo integration"],
    category: "cat-10",
    order: 6,
    featured: true,
    published: true,
  },
];

export interface IMockSpecialFeature {
  _id: string;
  name: string;
  slug: string;
  order: number;
  active: boolean;
}

export const mockSpecialFeatures: IMockSpecialFeature[] = [
  { _id: "feat-1", name: "Injection molding machine (IMM)", slug: "injection-molding-machine-imm", order: 1, active: true },
  { _id: "feat-2", name: "Blow molding machine (BMM)", slug: "blow-molding-machine-bmm", order: 2, active: true },
  { _id: "feat-3", name: "Crusher machine", slug: "crusher-machine", order: 3, active: true },
  { _id: "feat-4", name: "Mixer machine", slug: "mixer-machine", order: 4, active: true },
  { _id: "feat-5", name: "Industrial chiller", slug: "industrial-chiller", order: 5, active: true },
  { _id: "feat-6", name: "Robot", slug: "robot", order: 6, active: true },
  { _id: "feat-7", name: "Moulds", slug: "moulds", order: 7, active: true },
  { _id: "feat-8", name: "Servo system", slug: "servo-system", order: 8, active: true },
  { _id: "feat-9", name: "Auxiliary machineries", slug: "auxiliary-machineries", order: 9, active: true },
  { _id: "feat-10", name: "PLC & HMI", slug: "plc-hmi", order: 10, active: true },
  { _id: "feat-11", name: "Overhead crane", slug: "overhead-crane", order: 11, active: true },
  { _id: "feat-12", name: "Printing & packaging machineries", slug: "printing-packaging-machineries", order: 12, active: true },
  { _id: "feat-13", name: "Heating items", slug: "heating-items", order: 13, active: true },
  { _id: "feat-14", name: "Techmation parts", slug: "techmation-parts", order: 14, active: true },
  { _id: "feat-15", name: "INOVANCE items", slug: "inovance-items", order: 15, active: true },
  { _id: "feat-16", name: "Industrial Automation", slug: "industrial-automation-feature", order: 16, active: true },
  { _id: "feat-17", name: "Hydraulic and mechanical items", slug: "hydraulic-mechanical-items", order: 17, active: true },
  { _id: "feat-18", name: "Mould parts", slug: "mould-parts", order: 18, active: true },
  { _id: "feat-19", name: "Timer, counter, sensors etc", slug: "timer-counter-sensors", order: 19, active: true },
  { _id: "feat-20", name: "Semi Auto PET Blow", slug: "semi-auto-pet-blow", order: 20, active: true },
  { _id: "feat-21", name: "Cooling tower", slug: "cooling-tower", order: 21, active: true },
  { _id: "feat-22", name: "Air compressor", slug: "air-compressor", order: 22, active: true },
  { _id: "feat-23", name: "Screw & barrel", slug: "screw-barrel", order: 23, active: true },
];

export const mockProducts: IProduct[] = [
  {
    _id: "prd-1",
    name: "7-Inch HMI Touch Panel",
    slug: "hmi-7-inch",
    sku: "NES-HMI-7",
    brand: "Weintek / Delta class",
    category: "cat-2",
    subCategory: "sub-2-4",
    shortDescription: "7-inch industrial HMI with Ethernet and serial.",
    description:
      "The 7-inch HMI touch panel delivers reliable performance for industrial automation applications.\n\nIt features a high-resolution TFT display, fast processing, and multiple communication interfaces including Ethernet and RS-232/RS-485.\n\nIdeal for machine control, monitoring, and data management.",
    price: 18500,
    currency: "BDT",
    image: mockImg.plc,
    gallery: [
      mockImg.plc,
      mockImg.panel,
      mockImg.drive,
      mockImg.workshop,
    ],
    videoUrl: "https://www.youtube.com/watch?v=o-ZbgQ1q_ls",
    condition: "Weintek / Delta class as quoted",
    packing: "Carton",
    warranty: "As quoted",
    warrantyAndReturns:
      "12-month manufacturer warranty against manufacturing defects. Replacement provided for verified hardware faults within 7 days of delivery. Physical damage or incorrect supply voltage is excluded.",
    availabilityText: "In stock – confirm lead time",
    specs: ["7 inch TFT", "Ethernet 10/100", "RS232 / RS485", "IP65 Front Panel"],
    specTable: [
      { label: "Display Size", value: "7.0 inch TFT LCD" },
      { label: "Resolution", value: "800 x 480 pixels" },
      { label: "Interface", value: "Ethernet + RS-232 / RS-485" },
      { label: "Power Supply", value: "24 VDC (±15%)" },
      { label: "Protection", value: "IP65 Front Panel" },
      { label: "Memory", value: "128MB Flash / 128MB RAM" },
    ],
    relatedServices: ["svc-1"],
    inStock: true,
    featured: true,
    published: true,
    order: 1,
  },
  {
    _id: "prd-2",
    name: "Inductive Proximity Sensor M18",
    slug: "proximity-sensor-m18",
    sku: "NES-SNS-M18",
    brand: "Autonics / equivalent",
    category: "cat-3",
    subCategory: "sub-3-8",
    shortDescription: "M18 inductive proximity sensor for metal detection.",
    description: "Industrial inductive sensor for end-of-travel, counting and fixture detection on machines.",
    price: 950,
    currency: "BDT",
    image: mockImg.sensor,
    specs: ["M18", "NPN/PNP", "10–30 VDC", "IP67"],
    relatedServices: ["svc-4"],
    inStock: true,
    featured: true,
    published: true,
    order: 2,
  },
  {
    _id: "prd-3",
    name: "3-Phase Induction Motor 1.5 HP",
    slug: "induction-motor-1-5hp",
    sku: "NES-MTR-15",
    brand: "Generic IE2",
    category: "cat-3",
    subCategory: "sub-3-2",
    shortDescription: "Foot-mounted 1.5 HP motor for pumps and conveyors.",
    description: "Reliable three-phase induction motor for light industrial drives. Confirm frame and shaft before ordering.",
    price: 18500,
    currency: "BDT",
    image: mockImg.motor,
    specs: ["1.5 HP", "3-phase", "1400 RPM class", "IE2"],
    relatedServices: ["svc-2"],
    inStock: true,
    featured: true,
    published: true,
    order: 3,
  },
  {
    _id: "prd-4",
    name: "VFD Drive 2.2 kW",
    slug: "vfd-2-2kw",
    sku: "NES-VFD-22",
    brand: "Delta / INVT class",
    category: "cat-3",
    subCategory: "sub-3-1",
    shortDescription: "2.2 kW variable frequency drive for motor speed control.",
    description: "Compact VFD for soft start, speed control and energy savings on small three-phase motors.",
    price: 22000,
    currency: "BDT",
    image: mockImg.drive,
    specs: ["2.2 kW", "380–440V", "Modbus", "Overload protection"],
    relatedServices: ["svc-2"],
    inStock: true,
    featured: true,
    published: true,
    order: 4,
  },
  {
    _id: "prd-5",
    name: "Incremental Rotary Encoder 400 PPR",
    slug: "encoder-400ppr",
    sku: "NES-SNS-ENC",
    brand: "Autonics / equivalent",
    category: "cat-3",
    subCategory: "sub-3-4",
    shortDescription: "400 PPR encoder for speed and position feedback.",
    description: "Use with PLC high-speed counters or VFD pulse input for length and speed control.",
    price: 3800,
    currency: "BDT",
    image: mockImg.sensor,
    specs: ["400 PPR", "AB / ABZ", "5–24 VDC", "6 mm shaft"],
    relatedServices: ["svc-4"],
    inStock: true,
    featured: false,
    published: true,
    order: 5,
  },
  {
    _id: "prd-6",
    name: "Control Cable 1.5 mm² × 4C",
    slug: "control-cable-4c",
    sku: "NES-CBL-15-4",
    brand: "BRB / equivalent",
    category: "cat-3",
    subCategory: "sub-3-6",
    shortDescription: "Flexible 4-core control cable for panels and field I/O.",
    description: "Sold per meter. Suitable for 24 VDC I/O and 220 VAC control circuits.",
    price: 95,
    currency: "BDT",
    image: mockImg.workshop,
    specs: ["1.5 mm²", "4 core", "Flexible", "Per meter"],
    relatedServices: ["svc-5"],
    inStock: true,
    featured: false,
    published: true,
    order: 6,
  },
  {
    _id: "prd-7",
    name: "DIN Rail SMPS 24V 10A",
    slug: "smps-24v-10a",
    sku: "NES-PSU-2410",
    brand: "Mean Well class",
    category: "cat-4",
    subCategory: "sub-4-5",
    shortDescription: "24 VDC 10A DIN-rail power supply for PLC panels.",
    description: "Industrial SMPS for PLC, HMI, sensors and relays. Size with 20–30% headroom.",
    price: 4200,
    currency: "BDT",
    image: mockImg.drive,
    specs: ["24 VDC", "10A", "DIN rail", "Overload protection"],
    relatedServices: ["svc-3"],
    inStock: true,
    featured: false,
    published: true,
    order: 7,
  },
  {
    _id: "prd-8",
    name: "Deep Groove Ball Bearing 6205",
    slug: "bearing-6205",
    sku: "NES-BRG-6205",
    brand: "SKF / equivalent",
    category: "cat-3",
    subCategory: "sub-3-7",
    shortDescription: "6205 bearing for motors, pulleys and fans.",
    description: "Standard 6205 deep groove ball bearing. Sealed options for dusty workshops.",
    price: 350,
    currency: "BDT",
    image: mockImg.bearing,
    specs: ["6205", "25×52×15 mm", "2RS / ZZ"],
    relatedServices: ["svc-5"],
    inStock: true,
    featured: false,
    published: true,
    order: 8,
  },
  {
    _id: "prd-9",
    name: "AC Contactor 40A",
    slug: "contactor-40a",
    sku: "NES-CNT-40",
    brand: "Schneider / Chint class",
    category: "cat-4",
    subCategory: "sub-4-6",
    shortDescription: "40A contactor for larger motors and feeders.",
    description: "40A AC contactor for 5–10 HP class motors depending on utilization category.",
    price: 3200,
    currency: "BDT",
    image: mockImg.panel,
    specs: ["40A", "3-pole", "AC-3", "Aux kit optional"],
    relatedServices: ["svc-3"],
    inStock: true,
    featured: false,
    published: true,
    order: 9,
  },
  {
    _id: "prd-10",
    name: "Siemens S7-1200 CPU 1214C",
    slug: "siemens-s7-1200-cpu-1214c",
    sku: "NES-PLC-1214",
    brand: "Siemens",
    category: "cat-2",
    subCategory: "sub-2-20",
    shortDescription: "Compact PLC CPU for machine and process control panels.",
    description: "Siemens SIMATIC S7-1200 CPU 1214C for small to mid automation.",
    price: 48500,
    currency: "BDT",
    image: mockImg.plc,
    specs: ["CPU 1214C", "14 DI / 10 DO", "2 analog in", "Profinet"],
    relatedServices: ["svc-1"],
    inStock: true,
    featured: false,
    published: true,
    order: 10,
  },
  {
    _id: "prd-11",
    name: "Delta DVP-14SS2 PLC",
    slug: "delta-dvp-14ss2",
    sku: "NES-PLC-D14",
    brand: "Delta",
    category: "cat-2",
    subCategory: "sub-2-21",
    shortDescription: "Slim PLC for compact control cabinets and OEM machines.",
    description: "Delta DVP Slim series PLC — popular in Bangladesh workshops.",
    price: 12500,
    currency: "BDT",
    image: mockImg.panel,
    specs: ["14 points", "High-speed counters", "MODBUS", "Expansion ready"],
    relatedServices: ["svc-1"],
    inStock: true,
    featured: false,
    published: true,
    order: 11,
  },
  {
    _id: "prd-12",
    name: "Mitsubishi FX5U-32M",
    slug: "mitsubishi-fx5u-32m",
    sku: "NES-PLC-FX5",
    brand: "Mitsubishi",
    category: "cat-2",
    subCategory: "sub-2-22",
    shortDescription: "iQ-F series compact PLC with built-in Ethernet.",
    description: "Mitsubishi FX5U for OEMs who need Ethernet, motion and a clear upgrade path.",
    price: 52000,
    currency: "BDT",
    image: mockImg.plc,
    specs: ["32 I/O", "Ethernet", "SD card", "GX Works3"],
    relatedServices: ["svc-1"],
    inStock: true,
    featured: false,
    published: true,
    order: 12,
  },
  {
    _id: "prd-13",
    name: "Omron CP1E-N20DR-A",
    slug: "omron-cp1e-n20",
    sku: "NES-PLC-CP1E",
    brand: "Omron",
    category: "cat-2",
    subCategory: "sub-2-3",
    shortDescription: "Entry Omron PLC for simple sequential machines.",
    description: "CP1E is a practical choice for small machines and student projects.",
    price: 9800,
    currency: "BDT",
    image: mockImg.panel,
    specs: ["20 I/O", "Relay outputs", "USB programming", "CX-Programmer"],
    relatedServices: ["svc-1"],
    inStock: true,
    featured: false,
    published: true,
    order: 13,
  },
  {
    _id: "prd-14",
    name: "3-Phase Induction Motor 3 HP",
    slug: "induction-motor-3hp",
    sku: "NES-MTR-30",
    brand: "Generic IE2",
    category: "cat-3",
    subCategory: "sub-3-2",
    shortDescription: "3 HP industrial motor for fans, mixers and machine tools.",
    description: "Standard 3 HP three-phase motor. Pair with a matching VFD.",
    price: 26800,
    currency: "BDT",
    image: mockImg.motor,
    specs: ["3 HP", "3-phase", "IE2", "Foot / flange options"],
    relatedServices: ["svc-2"],
    inStock: true,
    featured: false,
    published: true,
    order: 14,
  },
  {
    _id: "prd-15",
    name: "VFD Drive 5.5 kW",
    slug: "vfd-5-5kw",
    sku: "NES-VFD-55",
    brand: "Delta / INVT class",
    category: "cat-3",
    subCategory: "sub-3-1",
    shortDescription: "5.5 kW VFD for pumps, fans and conveyor lines.",
    description: "Mid-range VFD with PID and multi-speed control.",
    price: 38500,
    currency: "BDT",
    image: mockImg.drive,
    specs: ["5.5 kW", "3-phase in/out", "PID", "Brake chopper ready"],
    relatedServices: ["svc-2"],
    inStock: true,
    featured: false,
    published: true,
    order: 15,
  },
  {
    _id: "prd-16",
    name: "Photoelectric Sensor Kit",
    slug: "photoelectric-sensor-kit",
    sku: "NES-SNS-PE",
    brand: "Autonics / equivalent",
    category: "cat-3",
    subCategory: "sub-3-8",
    shortDescription: "Through-beam and diffuse photoelectric sensors.",
    description: "Useful for packaging lines, counting and presence detection.",
    price: 2200,
    currency: "BDT",
    image: mockImg.sensor,
    specs: ["Diffuse / through-beam", "12–24 VDC", "Adjustable sensitivity"],
    relatedServices: ["svc-4"],
    inStock: true,
    featured: false,
    published: true,
    order: 16,
  },
  {
    _id: "prd-17",
    name: "Horizontal Injection Molding Machine 150T",
    slug: "horizontal-injection-molding-machine-150t",
    sku: "NES-IMM-150",
    brand: "Haitian / Bole class",
    category: "cat-1",
    subCategory: "sub-1-1",
    shortDescription: "150-ton precision horizontal plastic injection molding machine.",
    description: "High performance servo-hydraulic plastic injection molding machine suitable for industrial manufacturing.",
    price: 1850000,
    currency: "BDT",
    image: mockImg.factory,
    specs: ["150 Ton clamping", "Servo pump", "Techmation controller"],
    relatedServices: ["svc-1", "svc-2"],
    inStock: true,
    featured: false,
    published: true,
    order: 17,
  },
  {
    _id: "prd-18",
    name: "Semi Auto PET Blow Molding Machine",
    slug: "semi-auto-pet-blow-molding-machine-2cav",
    sku: "NES-BMM-PET2",
    brand: "Nur Engineering Series",
    category: "cat-5",
    subCategory: "sub-5-1",
    shortDescription: "2-cavity semi-automatic PET bottle stretch blow molding machine.",
    description: "Reliable PET stretch blow molding unit with infrared pre-heating oven.",
    price: 750000,
    currency: "BDT",
    image: mockImg.factory,
    specs: ["2 Cavity", "Up to 2L bottles", "Infrared heating"],
    relatedServices: ["svc-1"],
    inStock: true,
    featured: false,
    published: true,
    order: 18,
  },
  {
    _id: "prd-19",
    name: "5HP Industrial Water Cooled Chiller",
    slug: "5hp-water-cooled-chiller",
    sku: "NES-CHL-5HP",
    brand: "Nur Engineering Series",
    category: "cat-6",
    subCategory: "sub-6-1",
    shortDescription: "5 HP high-efficiency water-cooled industrial refrigeration chiller.",
    description: "Designed for molding machines, hydraulic cooling and industrial process lines.",
    price: 280000,
    currency: "BDT",
    image: mockImg.workshop,
    specs: ["5 HP", "R410A / R22", "Shell & tube condenser"],
    relatedServices: ["svc-2"],
    inStock: true,
    featured: false,
    published: true,
    order: 19,
  },
  {
    _id: "prd-20",
    name: "Heavy Duty Plastic Crusher 10 HP",
    slug: "plastic-crusher-10hp",
    sku: "NES-CRS-10HP",
    brand: "Nur Engineering Series",
    category: "cat-7",
    subCategory: "sub-1-8",
    shortDescription: "10 HP heavy-duty plastic granulator and crusher machine.",
    description: "Crushes scrap plastic, runners and molding rejects with alloy steel blades.",
    price: 320000,
    currency: "BDT",
    image: mockImg.factory,
    specs: ["10 HP motor", "Alloy steel blades", "Safety interlock"],
    relatedServices: ["svc-2"],
    inStock: true,
    featured: false,
    published: true,
    order: 20,
  },
  {
    _id: "prd-21",
    name: "Vertical Raw Material Mixer 100KG",
    slug: "vertical-mixer-100kg",
    sku: "NES-MIX-100",
    brand: "Nur Engineering Series",
    category: "cat-8",
    subCategory: "sub-1-9",
    shortDescription: "100 kg stainless steel vertical color and granule mixer.",
    description: "Uniform granule and masterbatch mixing for plastic injection and extrusion.",
    price: 180000,
    currency: "BDT",
    image: mockImg.workshop,
    specs: ["100 kg capacity", "Stainless steel", "Timer control"],
    relatedServices: ["svc-2"],
    inStock: true,
    featured: false,
    published: true,
    order: 21,
  },
  {
    _id: "prd-22",
    name: "Continuous Heat Seal Printing Machine",
    slug: "continuous-heat-seal-printing-machine",
    sku: "NES-PRN-HS",
    brand: "Nur Engineering Series",
    category: "cat-9",
    subCategory: "sub-9-1",
    shortDescription: "High-speed continuous heat sealing and date printing machine.",
    description: "Automatic packaging line heat sealer with integrated batch code printer.",
    price: 145000,
    currency: "BDT",
    image: mockImg.panel,
    specs: ["Continuous belt", "Temperature control", "Date coder"],
    relatedServices: ["svc-5"],
    inStock: true,
    featured: false,
    published: true,
    order: 22,
  },
];

export interface IMockBlogCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
}

export interface IMockBlogPost {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  category: { _id: string; name: string; slug: string };
  tags: string[];
  author: string;
  readTime: string;
  featured: boolean;
  status: "draft" | "published";
  createdAt: string;
}

export const mockBlogCategories: IMockBlogCategory[] = [
  { _id: "bcat-1", name: "PLC & Automation", slug: "plc-automation", order: 1 },
  { _id: "bcat-2", name: "VFD & Drives", slug: "vfd-drives", order: 2 },
  { _id: "bcat-3", name: "HMI & Displays", slug: "hmi-displays", order: 3 },
  { _id: "bcat-4", name: "Sensors & Detection", slug: "sensors-detection", order: 4 },
  { _id: "bcat-5", name: "Motors & Maintenance", slug: "motors-maintenance", order: 5 },
  { _id: "bcat-6", name: "Switchgear & Relays", slug: "switchgear-relays", order: 6 },
];

export const mockBlogPosts: IMockBlogPost[] = [
  {
    _id: "blog-1",
    title: "Guide to Selecting the Right PLC for Industrial Automation in Bangladesh",
    slug: "guide-to-selecting-plc-industrial-automation",
    summary:
      "A practical comparison of Siemens S7-1200, Delta DVP, and Mitsubishi FX series controllers: evaluating digital/analog I/O counts, relay vs. transistor switching, and communication protocols.",
    content: `## Choosing the Optimal PLC Architecture for Factory Automation

When modernizing or constructing a machine control system in Bangladesh, selecting the correct Programmable Logic Controller (PLC) determines both the machine's reliability and its lifetime maintenance cost.

### 1. I/O Capacity and Signal Types
Begin by creating a comprehensive spreadsheet of all physical field devices:
- **Digital Inputs (DI):** Emergency stop buttons, proximity switches, pushbuttons, optical sensors, and thermal trip contacts (typically 24 VDC sink/source).
- **Digital Outputs (DO):** Solenoid valves, auxiliary contactor coils, status pilot lamps, and signaling beacons.
- **Analog Inputs (AI):** 4–20 mA pressure transmitters, PT100 temperature sensors, and 0–10 V speed feedback signals.
- **Analog Outputs (AO):** Speed reference signals to Variable Frequency Drives (VFDs) or proportional valve controllers.

Always reserve a **20% to 25% spare I/O margin** for future sensors, bypass buttons, or mechanical upgrades.

### 2. Transistor vs. Relay Output Modules
- **Relay Outputs:** Best suited for switching alternating current (AC) loads up to 2A, such as 220V solenoid coils or contactor pilots. However, their mechanical contacts wear out under rapid switching cycles.
- **Transistor (Sink/Source) Outputs:** Essential when driving high-speed pulse outputs (e.g., servo/stepper motor pulse trains) or fast solid-state relays (SSRs). Lifetime is essentially unlimited compared to mechanical relays.

### 3. Communication Protocols & Networking
Modern Bangladeshi industrial setups require communication between the PLC, HMIs, inverters, and central SCADA systems:
- **Modbus RTU (RS-485):** Highly cost-effective and supported by virtually all brands (Delta, Inovance, Siemens, Omron) for reading VFD parameters, energy meters, and temperature controllers over two-wire daisy chains.
- **Profinet / Ethernet/IP:** Industrial Ethernet protocols that simplify wiring and provide high bandwidth for decentralized I/O racks and high-speed multi-axis synchronization.

### 4. Brand Availability & Spare Parts Support in Dhaka
For long-term peace of mind, prioritize controllers with readily available replacement CPU modules, expansion blocks, and local programming expertise. At **Nur Engineering Solution**, we stock and support Siemens SIMATIC S7-1200, Delta DVP-ES2/SS2 series, and compatible expansion units for rapid same-day dispatch.`,
    coverImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80",
    category: { _id: "bcat-1", name: "PLC & Automation", slug: "plc-automation" },
    tags: ["PLC", "Siemens", "Delta", "Automation", "Factory Control"],
    author: "Engr. Nuruzzaman, Lead EEE Specialist",
    readTime: "6 min read",
    featured: true,
    status: "published",
    createdAt: "2026-08-25T08:00:00.000Z",
  },
  {
    _id: "blog-2",
    title: "VFD Parameter Optimization: Maximizing Energy Efficiency in Industrial Pumps & Fans",
    slug: "vfd-parameter-optimization-pumps-fans",
    summary:
      "How Variable Frequency Drives cut electrical bills by 30-50% on centrifugal loads. Key parameter tuning for acceleration ramps, torque boost, PID loop feedback, and braking protection.",
    content: `## Why VFDs Transform Centrifugal Pump and Fan Economics

Centrifugal pumps, blower fans, and cooling tower exhausts obey Affinity Laws: fluid flow is directly proportional to impeller speed, while **power consumption varies with the cube of the speed (P ∝ N³)**. 

Operating a pump at 80% speed requires roughly half (51%) the electrical power of full-speed operation with a mechanical throttling valve.

### Essential Parameter Groups to Configure on Commissioning

#### 1. Motor Nameplate Matching (Group 01)
Never run a new inverter with factory default motor constants. Enter exact nameplate ratings:
- Rated motor kilowatt (kW) or horsepower (HP)
- Nominal voltage (e.g., 380V / 400V 3-phase)
- Full Load Amps (FLA)
- Base frequency (50 Hz) and rated RPM

Perform an offline or rotational **auto-tuning routine** so the drive accurately models stator resistance ($R_s$) and leakage inductance.

#### 2. Acceleration and Deceleration Ramps
- **Centrifugal Pumps:** Set acceleration ramp between 8.0s to 15.0s to prevent water hammer surges and mechanical pipe stress. Deceleration should use a gentle ramp with DC injection or coast-to-stop depending on check-valve dynamics.
- **High-Inertia Heavy Fans:** Use S-curve acceleration profile (15.0s to 30.0s) to prevent overcurrent trips ($OC$) on motor starting.

#### 3. PID Closed-Loop Pressure Control
By wiring a 4–20 mA pressure transducer (0–10 bar) into the analog input ($AI1$) and setting target pressure setpoints via digital keypad or HMI, the drive automatically modulates motor RPM to maintain rock-solid line pressure regardless of factory demand fluctuations.

Nur Engineering Solution provides complete VFD supply, matched panel enclosures, reactor chokes, and on-site tuning across Narayanganj, Gazipur, and Dhaka industrial belts.`,
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80",
    category: { _id: "bcat-2", name: "VFD & Drives", slug: "vfd-drives" },
    tags: ["VFD", "Inverters", "Energy Savings", "Pumps", "Drives"],
    author: "Nur Engineering Technical Team",
    readTime: "5 min read",
    featured: true,
    status: "published",
    createdAt: "2026-08-20T10:30:00.000Z",
  },
  {
    _id: "blog-3",
    title: "Connecting Industrial Touchscreen HMIs to Legacy PLCs via RS-485 Modbus",
    slug: "connecting-industrial-touchscreen-hmis-rs485-modbus",
    summary:
      "A step-by-step technical guide to integrating 7-inch and 10-inch color touch panels with older machines: baud rate matching, register mapping, alarm logging, and noise shielding.",
    content: `## Upgrading Legacy Operator Controls to Modern Touchscreen HMIs

Many operational machines in textile spinning, garment finishing, and plastic extrusion still rely on pushbuttons, analog dials, and segment LED displays. Adding a modern color Human-Machine Interface (HMI) immediately improves operator productivity, recipe management, and fault troubleshooting.

### 1. Physical Hardware Connection
- **RS-485 Differential Pair (D+ / D-):** Use twisted-pair shielded cable (Belden 9841 or equivalent). Connect terminal $A$ to $D+$ and terminal $B$ to $D-$.
- **Grounding and Shielding:** Ground the cable shield at **one end only** (usually the main panel grounding busbar) to prevent damaging ground loops.
- **Termination Resistor:** If the cable run exceeds 20 meters, engage the $120\Omega$ termination switch on the last device on the bus.

### 2. Matching Communication Parameters
Ensure identical settings across both the PLC communication port and HMI driver configuration:
- **Protocol:** Modbus RTU (Master on HMI, Slave on PLC)
- **Baud Rate:** 9600 bps or 19200 bps
- **Data Bits / Parity / Stop Bits:** 8, None/Even, 1 Stop bit
- **Station ID:** Unique address (e.g., PLC = Station 1, Temperature controller = Station 2)

### 3. Screen Design Best Practices
- **High-Contrast Alarm Banners:** Place active fault indicators (Motor Trip, Thermal Overload, Low Pressure) at the top in bright amber/red.
- **User Permission Levels:** Restrict calibration and timer settings behind a supervisor password.
- **Trend Charts:** Log temperature and speed curves directly to USB memory or internal flash storage.

Nur Engineering Solution supplies Weintek, Delta, and Siemens touch displays with full screen programming and backup assistance.`,
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
    category: { _id: "bcat-3", name: "HMI & Displays", slug: "hmi-displays" },
    tags: ["HMI", "Modbus", "Touchscreen", "Weintek", "Panel Building"],
    author: "Engr. Nuruzzaman",
    readTime: "7 min read",
    featured: false,
    status: "published",
    createdAt: "2026-08-15T14:00:00.000Z",
  },
  {
    _id: "blog-4",
    title: "Industrial Sensor Wiring & Troubleshooting: NPN vs. PNP and Optical Alignment",
    slug: "industrial-sensor-wiring-troubleshooting-npn-pnp",
    summary:
      "Clear wiring diagrams and fault resolution for inductive proximity sensors, photoelectric beams, and rotary encoders on high-speed packaging conveyors.",
    content: `## Demystifying Sensor Output Polarities in Industrial Machinery

One of the most frequent wiring issues in factory maintenance is confusing **NPN (Current Sinking)** and **PNP (Current Sourcing)** sensor outputs.

### Understanding NPN vs. PNP

- **PNP Sensor (Sourcing):** When the sensor detects a target, it connects the signal wire ($Black$) to positive supply ($+24\text{ VDC}$). European PLCs (Siemens, ABB, Schneider) typically standardize on PNP sinking inputs.
- **NPN Sensor (Sinking):** When activated, it pulls the signal wire ($Black$) to ground ($0\text{ VDC}$). Japanese and Asian machinery (Mitsubishi, Omron, Delta) frequently employ NPN sinking circuitry.

### Standard Wire Color Coding (IEC 60947-5-2)
- **Brown ($BN$):** $+24\text{ VDC}$ Power Supply
- **Blue ($BU$):** $0\text{ VDC}$ Common Ground
- **Black ($BK$):** Normally Open ($NO$) Signal Output
- **White ($WH$):** Normally Closed ($NC$) Signal Output (on 4-wire sensors)

### Common Field Failure Modes and Fixes
1. **Target Sensing Distance Drift:** Inductive proximity sensors have a rated sensing distance ($S_n$) calculated for mild steel. If detecting aluminum, brass, or stainless steel, apply correction reduction factors ($0.4\times$ to $0.7\times$).
2. **Optical Sensor Dust Fouling:** In cement, flour, or spinning mills, optical lenses accumulate airborne lint. Choose polarized retro-reflective or diffuse sensors with built-in stability status LEDs ($Green = Stable$, $Orange = Output$).
3. **Inductive Spikes from Nearby Coils:** Always route 24V sensor cables in a separate duct from 400V inverter and motor power cables.`,
    coverImage: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1600&q=80",
    category: { _id: "bcat-4", name: "Sensors & Detection", slug: "sensors-detection" },
    tags: ["Sensors", "Proximity", "Photoelectric", "Wiring", "Maintenance"],
    author: "Nur Engineering Technical Desk",
    readTime: "5 min read",
    featured: false,
    status: "published",
    createdAt: "2026-08-10T09:15:00.000Z",
  },
  {
    _id: "blog-5",
    title: "Three-Phase Induction Motor Maintenance: Preventing Bearing Wear and Winding Failure",
    slug: "three-phase-induction-motor-maintenance-guide",
    summary:
      "A preventative maintenance checklist for industrial motors: Megger insulation testing, vibration monitoring, lubrication intervals, and proper cooling fan airflow.",
    content: `## Extending the Lifespan of Factory 3-Phase Motors

Electric motors are the core workhorses of industrial manufacturing. More than 80% of premature motor failures result from **bearing degradation** or **stator winding insulation breakdown** due to heat and moisture.

### 1. Insulation Resistance Testing (Megger)
Before energizing a motor that has been sitting idle or exposed to high humidity:
- Disconnect supply cables and inverter leads.
- Apply a 500V or 1000V DC test voltage between phase windings ($U, V, W$) and motor ground frame.
- **Acceptance Rule:** Insulation resistance should exceed $1\text{ M}\Omega$ per kilovolt plus $1\text{ M}\Omega$. A healthy dry motor should typically read $>50\text{ M}\Omega$.

### 2. Bearing Inspection and Greasing
- **Over-greasing Hazard:** Adding too much grease forces excess lubricant into the winding cavity and creates friction churning, causing bearing temperatures to spike.
- Follow the manufacturer's recommended re-lubrication intervals using high-quality lithium-complex or polyurea grease suitable for industrial operating temperatures.
- Check for unusual axial play or high-frequency whistling during operation using an acoustic probe or vibration pen.

### 3. Cooling Fan and Cowl Clearance
Dust and cotton fluff clogging the motor's rear cooling fan cover cause internal stator temperatures to escalate rapidly. For every $10^\circ\text{C}$ increase above maximum rated insulation class temperature, **winding insulation lifespan is halved**.

Nur Engineering Solution provides three-phase motor replacement, rewinding inspection, and genuine SKF/NSK bearings for industrial plants.`,
    coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80",
    category: { _id: "bcat-5", name: "Motors & Maintenance", slug: "motors-maintenance" },
    tags: ["Motors", "Bearings", "Maintenance", "Insulation", "Pumps"],
    author: "Engr. Nuruzzaman",
    readTime: "6 min read",
    featured: false,
    status: "published",
    createdAt: "2026-08-05T11:45:00.000Z",
  },
  {
    _id: "blog-6",
    title: "Co-ordinating Contactors, Overload Relays, and Circuit Breakers in Motor Control Centers",
    slug: "coordinating-contactors-overload-relays-mcc",
    summary:
      "Type 1 vs. Type 2 co-ordination standards for industrial starter panels. Selecting AC-3 contactor ratings, bimetallic thermal settings, and short-circuit protection.",
    content: `## Designing Resilient Motor Starters in Control Panels

A reliable motor starter panel must handle both routine operational duty (starting and stopping high-inertia loads) and protect personnel and equipment during catastrophic fault conditions (short circuits, locked rotor, or single-phasing).

### 1. Sizing Contactors for AC-3 Duty
Never size an AC contactor based on its pure resistive thermal rating (AC-1). Squirrel-cage induction motors pull 6 to 8 times their rated current upon starting. Always select contactors rated for **AC-3 operational duty** matching or exceeding the motor's full-load running amps at 400V.

### 2. Thermal Overload Relay Calibration
- Set the thermal overload adjustment dial precisely to the **motor's rated Full Load Amps (FLA)** shown on the nameplate.
- For motors starting heavy inertia loads (crushers, ball mills), ensure the trip class ($10\text{A}$, $10$, or $20$) allows sufficient startup time without nuisance tripping.
- Utilize differential phase-loss protection mechanisms to rapidly disconnect the motor if one line fuse blows.

### 3. Short-Circuit Protection: Type 1 vs. Type 2 Co-ordination (IEC 60947-4-1)
- **Type 1 Co-ordination:** Under short-circuit conditions, the contactor or overload relay may suffer internal damage, requiring inspection or replacement before restoring service.
- **Type 2 Co-ordination:** Requires that under short circuit, no danger to operators occurs and the starter remains fully operational without component replacement (only contact welding may be easily separated).

Nur Engineering Solution stocks genuine Schneider, Chint, and Siemens contactors, auxiliary blocks, and thermal overloads ready for panel builders.`,
    coverImage: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1600&q=80",
    category: { _id: "bcat-6", name: "Switchgear & Relays", slug: "switchgear-relays" },
    tags: ["Contactors", "Relays", "Circuit Breakers", "MCC", "Switchgear"],
    author: "Nur Engineering Technical Desk",
    readTime: "5 min read",
    featured: false,
    status: "published",
    createdAt: "2026-08-01T08:30:00.000Z",
  },
];

