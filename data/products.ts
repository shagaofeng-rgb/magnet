export type Product = {
  slug: string;
  name: string;
  category: string;
  image: string;
  summary: string;
  keywords: string[];
  features: string[];
  principle: string;
  specs: { label: string; value: string }[];
  applications: string[];
  installation: string;
  customization: string[];
  faqs: { question: string; answer: string }[];
};

export const products: Product[] = [
  {
    slug: "automatic-cleaning-magnetic-separators-for-iron-scrap-waste",
    name: "Automatic Cleaning Magnetic Separators for Iron Scrap Waste",
    category: "Permanent Magnet Series",
    image: "/images/source-products/automatic-cleaning-magnetic-separators-for-iron-scrap-waste.webp",
    summary: "The Permanent Magnet Suspension Separator is developed based on high-intensity permanent magnetic technology. Compared with ordinary suspended magnets, this model adds an automatic iron-discharge system, enabling continuous operation and significantly reducing manual cleaning frequency.",
    keywords: ["permanent magnetic separator","iron removal equipment","automatic cleaning magnetic separators for iron scrap waste"],
    features: [
          "Permanent magnetic system with stable attraction",
          "Designed for industrial iron removal and equipment protection",
          "Suitable for conveyor or material-flow applications",
          "Custom sizing according to material and installation conditions",
          "Low daily maintenance requirements"
    ],
    principle: "Permanent magnets create a stable magnetic field. Ferrous contaminants are attracted and separated from the material stream while non-magnetic material continues through the process.",
    specs: [
          {
                "label": "Product range",
                "value": "Permanent magnetic separation equipment"
          },
          {
                "label": "Selection data",
                "value": "Material, belt width, layer height, installation position, and iron contamination level"
          },
          {
                "label": "Cleaning method",
                "value": "Manual or automatic depending on product structure"
          },
          {
                "label": "Customization",
                "value": "Magnetic strength, size, frame, and installation method"
          }
    ],
    applications: [
          "Mining",
          "Recycling",
          "Aggregate Processing",
          "Cement",
          "Bulk Material Handling"
    ],
    installation: "Installed above conveyors, near discharge points, or in material flow paths according to site layout.",
    customization: [
          "Magnetic strength",
          "Working size",
          "Installation frame",
          "Cleaning method",
          "Material contact surface"
    ],
    faqs: [
          {
                "question": "How do I choose the right Automatic Cleaning Magnetic Separators for Iron Scrap Waste?",
                "answer": "Please share material type, belt width or flow path, layer height, installation space, target impurity size, and cleaning requirements. We will suggest a practical configuration."
          },
          {
                "question": "Can this product be customized?",
                "answer": "Yes. Size, magnetic strength, mounting structure, and related configuration can be adjusted according to your working conditions."
          }
    ]
  },
  {
    slug: "suspended-permanent-magnetic-separator",
    name: "Suspended Permanent Magnetic Separator",
    category: "Permanent Magnet Series",
    image: "/images/source-products/suspended-permanent-magnetic-separator.webp",
    summary: "Suspended Permanent Magnetic Separator is part of COWIN MAGNET's permanent magnetic separation range for removing tramp iron from conveyed or flowing materials in industrial production lines.",
    keywords: ["permanent magnetic separator","iron removal equipment","suspended permanent magnetic separator"],
    features: [
          "Permanent magnetic system with stable attraction",
          "Designed for industrial iron removal and equipment protection",
          "Suitable for conveyor or material-flow applications",
          "Custom sizing according to material and installation conditions",
          "Low daily maintenance requirements"
    ],
    principle: "Permanent magnets create a stable magnetic field. Ferrous contaminants are attracted and separated from the material stream while non-magnetic material continues through the process.",
    specs: [
          {
                "label": "Product range",
                "value": "Permanent magnetic separation equipment"
          },
          {
                "label": "Selection data",
                "value": "Material, belt width, layer height, installation position, and iron contamination level"
          },
          {
                "label": "Cleaning method",
                "value": "Manual or automatic depending on product structure"
          },
          {
                "label": "Customization",
                "value": "Magnetic strength, size, frame, and installation method"
          }
    ],
    applications: [
          "Mining",
          "Recycling",
          "Aggregate Processing",
          "Cement",
          "Bulk Material Handling"
    ],
    installation: "Installed above conveyors, near discharge points, or in material flow paths according to site layout.",
    customization: [
          "Magnetic strength",
          "Working size",
          "Installation frame",
          "Cleaning method",
          "Material contact surface"
    ],
    faqs: [
          {
                "question": "How do I choose the right Suspended Permanent Magnetic Separator?",
                "answer": "Please share material type, belt width or flow path, layer height, installation space, target impurity size, and cleaning requirements. We will suggest a practical configuration."
          },
          {
                "question": "Can this product be customized?",
                "answer": "Yes. Size, magnetic strength, mounting structure, and related configuration can be adjusted according to your working conditions."
          }
    ]
  },
  {
    slug: "suspended-electromagnetic-conveyor-belt-separator",
    name: "Suspended Electromagnetic Conveyor Belt Separator",
    category: "Electromagnetic Series",
    image: "/images/source-products/suspended-electromagnetic-conveyor-belt-separator.webp",
    summary: "The Suspended Electromagnetic Conveyor Belt Separator operates by generating a strong electromagnetic field through an energized electromagnetic coil system. When bulk materials pass beneath the separator on the conveyor belt, ferrous contaminants such as iron scraps, steel fragments, bolts, nails, rebars, and tramp iron are attracted upward by the magnetic field.",
    keywords: ["electromagnetic separator","electromagnetic lifting magnet","suspended electromagnetic conveyor belt separator"],
    features: [
          "Strong electromagnetic field for demanding working conditions",
          "Suitable for heavy-duty industrial use",
          "Custom voltage, control, and installation options",
          "Designed for continuous production environments",
          "Selection support based on material and site conditions"
    ],
    principle: "An energized coil generates a magnetic field. When ferrous material enters the magnetic zone, it is attracted, lifted, held, or separated according to the product design.",
    specs: [
          {
                "label": "Product range",
                "value": "Electromagnetic separation and lifting equipment"
          },
          {
                "label": "Power/control",
                "value": "Configured according to project voltage and control requirements"
          },
          {
                "label": "Working condition",
                "value": "Selected by material load, duty cycle, and installation environment"
          },
          {
                "label": "Customization",
                "value": "Magnetic force, cooling/control system, frame, and suspension height"
          }
    ],
    applications: [
          "Mining",
          "Steel & Metallurgy",
          "Recycling",
          "Cement",
          "Coal & Power Plants"
    ],
    installation: "Installed above conveyor systems, in lifting stations, or in other industrial layouts according to the product type.",
    customization: [
          "Magnetic force",
          "Voltage",
          "Control cabinet",
          "Cooling method",
          "Mounting frame"
    ],
    faqs: [
          {
                "question": "How do I choose the right Suspended Electromagnetic Conveyor Belt Separator?",
                "answer": "Please share material type, belt width or flow path, layer height, installation space, target impurity size, and cleaning requirements. We will suggest a practical configuration."
          },
          {
                "question": "Can this product be customized?",
                "answer": "Yes. Size, magnetic strength, mounting structure, and related configuration can be adjusted according to your working conditions."
          }
    ]
  },
  {
    slug: "round-electromagnetic-lifting-magnet",
    name: "Round Electromagnetic Lifting Magnet",
    category: "Electromagnetic Series",
    image: "/images/source-products/round-electromagnetic-lifting-magnet.webp",
    summary: "When energized, the electromagnetic coil generates a strong magnetic field beneath the separator. As conveyed material passes under the magnetic separator, ferrous contaminants are attracted and lifted from the material stream.",
    keywords: ["electromagnetic separator","electromagnetic lifting magnet","round electromagnetic lifting magnet"],
    features: [
          "Strong electromagnetic field for demanding working conditions",
          "Suitable for heavy-duty industrial use",
          "Custom voltage, control, and installation options",
          "Designed for continuous production environments",
          "Selection support based on material and site conditions"
    ],
    principle: "An energized coil generates a magnetic field. When ferrous material enters the magnetic zone, it is attracted, lifted, held, or separated according to the product design.",
    specs: [
          {
                "label": "Product range",
                "value": "Electromagnetic separation and lifting equipment"
          },
          {
                "label": "Power/control",
                "value": "Configured according to project voltage and control requirements"
          },
          {
                "label": "Working condition",
                "value": "Selected by material load, duty cycle, and installation environment"
          },
          {
                "label": "Customization",
                "value": "Magnetic force, cooling/control system, frame, and suspension height"
          }
    ],
    applications: [
          "Mining",
          "Steel & Metallurgy",
          "Recycling",
          "Cement",
          "Coal & Power Plants"
    ],
    installation: "Installed above conveyor systems, in lifting stations, or in other industrial layouts according to the product type.",
    customization: [
          "Magnetic force",
          "Voltage",
          "Control cabinet",
          "Cooling method",
          "Mounting frame"
    ],
    faqs: [
          {
                "question": "How do I choose the right Round Electromagnetic Lifting Magnet?",
                "answer": "Please share material type, belt width or flow path, layer height, installation space, target impurity size, and cleaning requirements. We will suggest a practical configuration."
          },
          {
                "question": "Can this product be customized?",
                "answer": "Yes. Size, magnetic strength, mounting structure, and related configuration can be adjusted according to your working conditions."
          }
    ]
  },
  {
    slug: "strong-6000-16000-gauss-iron-absorbing-permanent-filter-bar-magnetic-neodymium-m",
    name: "Strong 6000-16000 Gauss Iron Absorbing Permanent Filter Bar Magnetic Neodymium Magnet Rod",
    category: "Magnetic Rollers & Magnetic Bars",
    image: "/images/source-products/strong-6000-16000-gauss-iron-absorbing-permanent-filter-bar-magnetic-neodymium-m.webp",
    summary: "The magnetic rod uses high-performance rare earth permanent magnet materials internally. Through special magnetic circuit design, a high-intensity magnetic field is formed on the surface of the magnetic rod.",
    keywords: ["magnetic bar","magnetic rod","magnetic roller","strong 6000-16000 gauss iron absorbing permanent filter bar magnetic neodymium magnet rod"],
    features: [
          "High magnetic surface strength options",
          "Stainless steel shell options for corrosion resistance",
          "Custom length, diameter, and end design",
          "Suitable for magnetic grates, drawers, and filtration assemblies",
          "Useful for fine ferrous impurity control"
    ],
    principle: "As material passes near the magnetic surface, ferrous impurities are attracted and held on the magnetic bar, rod, or roller surface for later cleaning.",
    specs: [
          {
                "label": "Product range",
                "value": "Magnetic bars, rods, rollers, and related assemblies"
          },
          {
                "label": "Surface field",
                "value": "Customizable according to material and impurity requirements"
          },
          {
                "label": "Material",
                "value": "Stainless steel shell with permanent magnet core options"
          },
          {
                "label": "Customization",
                "value": "Length, diameter, gauss level, end structure, and working temperature"
          }
    ],
    applications: [
          "Food-Adjacent Processing",
          "Plastics",
          "Chemical Powders",
          "Recycling",
          "Mineral Processing"
    ],
    installation: "Mounted inside hoppers, chutes, grates, drawers, or custom material-flow equipment.",
    customization: [
          "Length",
          "Diameter",
          "Gauss level",
          "End thread",
          "Working temperature"
    ],
    faqs: [
          {
                "question": "How do I choose the right Strong 6000-16000 Gauss Iron Absorbing Permanent Filter Bar Magnetic Neodymium Magnet Rod?",
                "answer": "Please share material type, belt width or flow path, layer height, installation space, target impurity size, and cleaning requirements. We will suggest a practical configuration."
          },
          {
                "question": "Can this product be customized?",
                "answer": "Yes. Size, magnetic strength, mounting structure, and related configuration can be adjusted according to your working conditions."
          }
    ]
  },
  {
    slug: "prl4-1200a-mobile-solar-powered-lighthouse",
    name: "PRL4-1200A Mobile solar-powered lighthouse",
    category: "Mobile Solar Light Towers",
    image: "/images/source-products/prl4-1200a-mobile-solar-powered-lighthouse.webp",
    summary: "Photovoltaic panels: Utilizing 350W-575W monocrystalline silicon photovoltaic panels, these panels feature high conversion efficiency and are shading-resistant, dust-resistant, and fire-resistant.",
    keywords: ["mobile solar light tower","solar-powered lighthouse","prl4-1200a mobile solar-powered lighthouse"],
    features: [
          "Mobile lighting support for outdoor sites",
          "Solar power generation with energy storage",
          "LED lighting system for night work and temporary operations",
          "Suitable for remote or off-grid locations",
          "Configuration can be matched to project lighting requirements"
    ],
    principle: "Solar panels charge the battery system through a controller, then the stored energy powers LED lighting for site illumination during night or low-light operation.",
    specs: [
          {
                "label": "Product type",
                "value": "Mobile solar-powered light tower"
          },
          {
                "label": "Power source",
                "value": "Solar photovoltaic panel with battery storage"
          },
          {
                "label": "Lighting",
                "value": "LED light system, model dependent"
          },
          {
                "label": "Customization",
                "value": "Panel power, battery capacity, mast height, and lamp configuration"
          }
    ],
    applications: [
          "Mining Sites",
          "Construction Sites",
          "Emergency Lighting",
          "Remote Work Areas",
          "Road & Utility Projects"
    ],
    installation: "Deployed as a mobile lighting unit and positioned according to site illumination needs.",
    customization: [
          "Solar panel power",
          "Battery capacity",
          "LED lamp quantity",
          "Mast height",
          "Trailer or mobile frame"
    ],
    faqs: [
          {
                "question": "What information is needed to quote PRL4-1200A Mobile solar-powered lighthouse?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  },
  {
    slug: "prl3-900b-mobile-solar-powered-lighthouse",
    name: "PRL3-900B Mobile solar-powered lighthouse",
    category: "Mobile Solar Light Towers",
    image: "/images/source-products/prl3-900b-mobile-solar-powered-lighthouse.webp",
    summary: "Photovoltaic panels: Utilizing 350W-575W monocrystalline silicon photovoltaic panels, these panels feature high conversion efficiency and are shading-resistant, dust-resistant, and fire-resistant.",
    keywords: ["mobile solar light tower","solar-powered lighthouse","prl3-900b mobile solar-powered lighthouse"],
    features: [
          "Mobile lighting support for outdoor sites",
          "Solar power generation with energy storage",
          "LED lighting system for night work and temporary operations",
          "Suitable for remote or off-grid locations",
          "Configuration can be matched to project lighting requirements"
    ],
    principle: "Solar panels charge the battery system through a controller, then the stored energy powers LED lighting for site illumination during night or low-light operation.",
    specs: [
          {
                "label": "Product type",
                "value": "Mobile solar-powered light tower"
          },
          {
                "label": "Power source",
                "value": "Solar photovoltaic panel with battery storage"
          },
          {
                "label": "Lighting",
                "value": "LED light system, model dependent"
          },
          {
                "label": "Customization",
                "value": "Panel power, battery capacity, mast height, and lamp configuration"
          }
    ],
    applications: [
          "Mining Sites",
          "Construction Sites",
          "Emergency Lighting",
          "Remote Work Areas",
          "Road & Utility Projects"
    ],
    installation: "Deployed as a mobile lighting unit and positioned according to site illumination needs.",
    customization: [
          "Solar panel power",
          "Battery capacity",
          "LED lamp quantity",
          "Mast height",
          "Trailer or mobile frame"
    ],
    faqs: [
          {
                "question": "What information is needed to quote PRL3-900B Mobile solar-powered lighthouse?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  },
  {
    slug: "prl3-900a-mobile-solar-powered-lighthouse",
    name: "PRL3-900A Mobile solar-powered lighthouse",
    category: "Mobile Solar Light Towers",
    image: "/images/source-products/prl3-900a-mobile-solar-powered-lighthouse.webp",
    summary: "Photovoltaic panels: Utilizing 350W-575W monocrystalline silicon photovoltaic panels, these panels feature high conversion efficiency and are shading-resistant, dust-resistant, and fire-resistant.",
    keywords: ["mobile solar light tower","solar-powered lighthouse","prl3-900a mobile solar-powered lighthouse"],
    features: [
          "Mobile lighting support for outdoor sites",
          "Solar power generation with energy storage",
          "LED lighting system for night work and temporary operations",
          "Suitable for remote or off-grid locations",
          "Configuration can be matched to project lighting requirements"
    ],
    principle: "Solar panels charge the battery system through a controller, then the stored energy powers LED lighting for site illumination during night or low-light operation.",
    specs: [
          {
                "label": "Product type",
                "value": "Mobile solar-powered light tower"
          },
          {
                "label": "Power source",
                "value": "Solar photovoltaic panel with battery storage"
          },
          {
                "label": "Lighting",
                "value": "LED light system, model dependent"
          },
          {
                "label": "Customization",
                "value": "Panel power, battery capacity, mast height, and lamp configuration"
          }
    ],
    applications: [
          "Mining Sites",
          "Construction Sites",
          "Emergency Lighting",
          "Remote Work Areas",
          "Road & Utility Projects"
    ],
    installation: "Deployed as a mobile lighting unit and positioned according to site illumination needs.",
    customization: [
          "Solar panel power",
          "Battery capacity",
          "LED lamp quantity",
          "Mast height",
          "Trailer or mobile frame"
    ],
    faqs: [
          {
                "question": "What information is needed to quote PRL3-900A Mobile solar-powered lighthouse?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  },
  {
    slug: "prlg10-12cy-portable-air-compressor",
    name: "PRLG10-12CY Portable Air-compressor",
    category: "Portable Air Compressors",
    image: "/images/source-products/prlg10-12cy-portable-air-compressor.webp",
    summary: "PRLG10-12CY Portable Air-compressor is a portable air compressor product for mining, construction, drilling, and other industrial air-supply applications where mobility and reliable output are required.",
    keywords: ["portable air compressor","mine air compressor","prlg10-12cy portable air-compressor"],
    features: [
          "Portable structure for site movement",
          "Designed for industrial air supply applications",
          "Suitable for mining and construction support",
          "Model selection based on pressure and air delivery requirements",
          "Quote support for matching compressor type to working conditions"
    ],
    principle: "The compressor draws in air, compresses it through the compression system, and supplies pressurized air to pneumatic tools or industrial site equipment.",
    specs: [
          {
                "label": "Product type",
                "value": "Portable or mobile air compressor"
          },
          {
                "label": "Model selection",
                "value": "Based on air delivery, pressure, engine/motor type, and site environment"
          },
          {
                "label": "Application",
                "value": "Mining, drilling, construction, and industrial air supply"
          },
          {
                "label": "Customization",
                "value": "Color, configuration, power system, and accessory options"
          }
    ],
    applications: [
          "Mining",
          "Construction",
          "Drilling",
          "Industrial Maintenance",
          "Remote Work Sites"
    ],
    installation: "Used as a mobile air-supply unit and connected to compatible pneumatic equipment according to site requirements.",
    customization: [
          "Model configuration",
          "Color",
          "Power system",
          "Air delivery requirement",
          "Accessory package"
    ],
    faqs: [
          {
                "question": "What information is needed to quote PRLG10-12CY Portable Air-compressor?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  },
  {
    slug: "prlg10-8cy-mobile-portable-compression",
    name: "PRLG10-8CY Mobile Portable Compression",
    category: "Portable Air Compressors",
    image: "/images/source-products/prlg10-8cy-mobile-portable-compression.webp",
    summary: "PRLG10-8CY Mobile Portable Compression is a portable air compressor product for mining, construction, drilling, and other industrial air-supply applications where mobility and reliable output are required.",
    keywords: ["portable air compressor","mine air compressor","prlg10-8cy mobile portable compression"],
    features: [
          "Portable structure for site movement",
          "Designed for industrial air supply applications",
          "Suitable for mining and construction support",
          "Model selection based on pressure and air delivery requirements",
          "Quote support for matching compressor type to working conditions"
    ],
    principle: "The compressor draws in air, compresses it through the compression system, and supplies pressurized air to pneumatic tools or industrial site equipment.",
    specs: [
          {
                "label": "Product type",
                "value": "Portable or mobile air compressor"
          },
          {
                "label": "Model selection",
                "value": "Based on air delivery, pressure, engine/motor type, and site environment"
          },
          {
                "label": "Application",
                "value": "Mining, drilling, construction, and industrial air supply"
          },
          {
                "label": "Customization",
                "value": "Color, configuration, power system, and accessory options"
          }
    ],
    applications: [
          "Mining",
          "Construction",
          "Drilling",
          "Industrial Maintenance",
          "Remote Work Sites"
    ],
    installation: "Used as a mobile air-supply unit and connected to compatible pneumatic equipment according to site requirements.",
    customization: [
          "Model configuration",
          "Color",
          "Power system",
          "Air delivery requirement",
          "Accessory package"
    ],
    faqs: [
          {
                "question": "What information is needed to quote PRLG10-8CY Mobile Portable Compression?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  },
  {
    slug: "prlg8-8cy-screw-air-compression",
    name: "PRLG8-8CY Screw air compression",
    category: "Portable Air Compressors",
    image: "/images/source-products/prlg8-8cy-screw-air-compression.webp",
    summary: "PRLG8-8CY Screw air compression is a portable air compressor product for mining, construction, drilling, and other industrial air-supply applications where mobility and reliable output are required.",
    keywords: ["portable air compressor","mine air compressor","prlg8-8cy screw air compression"],
    features: [
          "Portable structure for site movement",
          "Designed for industrial air supply applications",
          "Suitable for mining and construction support",
          "Model selection based on pressure and air delivery requirements",
          "Quote support for matching compressor type to working conditions"
    ],
    principle: "The compressor draws in air, compresses it through the compression system, and supplies pressurized air to pneumatic tools or industrial site equipment.",
    specs: [
          {
                "label": "Product type",
                "value": "Portable or mobile air compressor"
          },
          {
                "label": "Model selection",
                "value": "Based on air delivery, pressure, engine/motor type, and site environment"
          },
          {
                "label": "Application",
                "value": "Mining, drilling, construction, and industrial air supply"
          },
          {
                "label": "Customization",
                "value": "Color, configuration, power system, and accessory options"
          }
    ],
    applications: [
          "Mining",
          "Construction",
          "Drilling",
          "Industrial Maintenance",
          "Remote Work Sites"
    ],
    installation: "Used as a mobile air-supply unit and connected to compatible pneumatic equipment according to site requirements.",
    customization: [
          "Model configuration",
          "Color",
          "Power system",
          "Air delivery requirement",
          "Accessory package"
    ],
    faqs: [
          {
                "question": "What information is needed to quote PRLG8-8CY Screw air compression?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  },
  {
    slug: "prlg7-8cy-screw-air-compression",
    name: "PRLG7-8CY Screw air compression",
    category: "Portable Air Compressors",
    image: "/images/source-products/prlg7-8cy-screw-air-compression.webp",
    summary: "PRLG7-8CY Screw air compression is a portable air compressor product for mining, construction, drilling, and other industrial air-supply applications where mobility and reliable output are required.",
    keywords: ["portable air compressor","mine air compressor","prlg7-8cy screw air compression"],
    features: [
          "Portable structure for site movement",
          "Designed for industrial air supply applications",
          "Suitable for mining and construction support",
          "Model selection based on pressure and air delivery requirements",
          "Quote support for matching compressor type to working conditions"
    ],
    principle: "The compressor draws in air, compresses it through the compression system, and supplies pressurized air to pneumatic tools or industrial site equipment.",
    specs: [
          {
                "label": "Product type",
                "value": "Portable or mobile air compressor"
          },
          {
                "label": "Model selection",
                "value": "Based on air delivery, pressure, engine/motor type, and site environment"
          },
          {
                "label": "Application",
                "value": "Mining, drilling, construction, and industrial air supply"
          },
          {
                "label": "Customization",
                "value": "Color, configuration, power system, and accessory options"
          }
    ],
    applications: [
          "Mining",
          "Construction",
          "Drilling",
          "Industrial Maintenance",
          "Remote Work Sites"
    ],
    installation: "Used as a mobile air-supply unit and connected to compatible pneumatic equipment according to site requirements.",
    customization: [
          "Model configuration",
          "Color",
          "Power system",
          "Air delivery requirement",
          "Accessory package"
    ],
    faqs: [
          {
                "question": "What information is needed to quote PRLG7-8CY Screw air compression?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  },
  {
    slug: "prlg6-8cy-screw-type-two-stage-compression",
    name: "PRLG6-8CY Screw type two-stage compression",
    category: "Portable Air Compressors",
    image: "/images/source-products/prlg6-8cy-screw-type-two-stage-compression.webp",
    summary: "PRLG6-8CY Screw type two-stage compression is a portable air compressor product for mining, construction, drilling, and other industrial air-supply applications where mobility and reliable output are required.",
    keywords: ["portable air compressor","mine air compressor","prlg6-8cy screw type two-stage compression"],
    features: [
          "Portable structure for site movement",
          "Designed for industrial air supply applications",
          "Suitable for mining and construction support",
          "Model selection based on pressure and air delivery requirements",
          "Quote support for matching compressor type to working conditions"
    ],
    principle: "The compressor draws in air, compresses it through the compression system, and supplies pressurized air to pneumatic tools or industrial site equipment.",
    specs: [
          {
                "label": "Product type",
                "value": "Portable or mobile air compressor"
          },
          {
                "label": "Model selection",
                "value": "Based on air delivery, pressure, engine/motor type, and site environment"
          },
          {
                "label": "Application",
                "value": "Mining, drilling, construction, and industrial air supply"
          },
          {
                "label": "Customization",
                "value": "Color, configuration, power system, and accessory options"
          }
    ],
    applications: [
          "Mining",
          "Construction",
          "Drilling",
          "Industrial Maintenance",
          "Remote Work Sites"
    ],
    installation: "Used as a mobile air-supply unit and connected to compatible pneumatic equipment according to site requirements.",
    customization: [
          "Model configuration",
          "Color",
          "Power system",
          "Air delivery requirement",
          "Accessory package"
    ],
    faqs: [
          {
                "question": "What information is needed to quote PRLG6-8CY Screw type two-stage compression?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  },
  {
    slug: "prlg5-8cy-screw-air-compressor",
    name: "PRLG5-8CY Screw Air Compressor",
    category: "Portable Air Compressors",
    image: "/images/source-products/prlg5-8cy-screw-air-compressor.webp",
    summary: "PRLG5-8CY Screw Air Compressor is a portable air compressor product for mining, construction, drilling, and other industrial air-supply applications where mobility and reliable output are required.",
    keywords: ["portable air compressor","mine air compressor","prlg5-8cy screw air compressor"],
    features: [
          "Portable structure for site movement",
          "Designed for industrial air supply applications",
          "Suitable for mining and construction support",
          "Model selection based on pressure and air delivery requirements",
          "Quote support for matching compressor type to working conditions"
    ],
    principle: "The compressor draws in air, compresses it through the compression system, and supplies pressurized air to pneumatic tools or industrial site equipment.",
    specs: [
          {
                "label": "Product type",
                "value": "Portable or mobile air compressor"
          },
          {
                "label": "Model selection",
                "value": "Based on air delivery, pressure, engine/motor type, and site environment"
          },
          {
                "label": "Application",
                "value": "Mining, drilling, construction, and industrial air supply"
          },
          {
                "label": "Customization",
                "value": "Color, configuration, power system, and accessory options"
          }
    ],
    applications: [
          "Mining",
          "Construction",
          "Drilling",
          "Industrial Maintenance",
          "Remote Work Sites"
    ],
    installation: "Used as a mobile air-supply unit and connected to compatible pneumatic equipment according to site requirements.",
    customization: [
          "Model configuration",
          "Color",
          "Power system",
          "Air delivery requirement",
          "Accessory package"
    ],
    faqs: [
          {
                "question": "What information is needed to quote PRLG5-8CY Screw Air Compressor?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  },
  {
    slug: "blue-w-3-5-5-compressor",
    name: "Blue W-3.5/5 Compressor",
    category: "Portable Air Compressors",
    image: "/images/source-products/blue-w-3-5-5-compressor.webp",
    summary: "Blue W-3.5/5 Compressor is a portable air compressor product for mining, construction, drilling, and other industrial air-supply applications where mobility and reliable output are required.",
    keywords: ["portable air compressor","mine air compressor","blue w-3.5/5 compressor"],
    features: [
          "Portable structure for site movement",
          "Designed for industrial air supply applications",
          "Suitable for mining and construction support",
          "Model selection based on pressure and air delivery requirements",
          "Quote support for matching compressor type to working conditions"
    ],
    principle: "The compressor draws in air, compresses it through the compression system, and supplies pressurized air to pneumatic tools or industrial site equipment.",
    specs: [
          {
                "label": "Product type",
                "value": "Portable or mobile air compressor"
          },
          {
                "label": "Model selection",
                "value": "Based on air delivery, pressure, engine/motor type, and site environment"
          },
          {
                "label": "Application",
                "value": "Mining, drilling, construction, and industrial air supply"
          },
          {
                "label": "Customization",
                "value": "Color, configuration, power system, and accessory options"
          }
    ],
    applications: [
          "Mining",
          "Construction",
          "Drilling",
          "Industrial Maintenance",
          "Remote Work Sites"
    ],
    installation: "Used as a mobile air-supply unit and connected to compatible pneumatic equipment according to site requirements.",
    customization: [
          "Model configuration",
          "Color",
          "Power system",
          "Air delivery requirement",
          "Accessory package"
    ],
    faqs: [
          {
                "question": "What information is needed to quote Blue W-3.5/5 Compressor?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  },
  {
    slug: "red-w-3-5-5-compressor",
    name: "Red W-3.5/5 Compressor",
    category: "Portable Air Compressors",
    image: "/images/source-products/red-w-3-5-5-compressor.webp",
    summary: "Red W-3.5/5 Compressor is a portable air compressor product for mining, construction, drilling, and other industrial air-supply applications where mobility and reliable output are required.",
    keywords: ["portable air compressor","mine air compressor","red w-3.5/5 compressor"],
    features: [
          "Portable structure for site movement",
          "Designed for industrial air supply applications",
          "Suitable for mining and construction support",
          "Model selection based on pressure and air delivery requirements",
          "Quote support for matching compressor type to working conditions"
    ],
    principle: "The compressor draws in air, compresses it through the compression system, and supplies pressurized air to pneumatic tools or industrial site equipment.",
    specs: [
          {
                "label": "Product type",
                "value": "Portable or mobile air compressor"
          },
          {
                "label": "Model selection",
                "value": "Based on air delivery, pressure, engine/motor type, and site environment"
          },
          {
                "label": "Application",
                "value": "Mining, drilling, construction, and industrial air supply"
          },
          {
                "label": "Customization",
                "value": "Color, configuration, power system, and accessory options"
          }
    ],
    applications: [
          "Mining",
          "Construction",
          "Drilling",
          "Industrial Maintenance",
          "Remote Work Sites"
    ],
    installation: "Used as a mobile air-supply unit and connected to compatible pneumatic equipment according to site requirements.",
    customization: [
          "Model configuration",
          "Color",
          "Power system",
          "Air delivery requirement",
          "Accessory package"
    ],
    faqs: [
          {
                "question": "What information is needed to quote Red W-3.5/5 Compressor?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  },
  {
    slug: "blue-w-3-0-5-mine-air-compressor",
    name: "Blue W-3.0/5 Mine Air Compressor",
    category: "Portable Air Compressors",
    image: "/images/source-products/blue-w-3-0-5-mine-air-compressor.webp",
    summary: "Blue W-3.0/5 Mine Air Compressor is a portable air compressor product for mining, construction, drilling, and other industrial air-supply applications where mobility and reliable output are required.",
    keywords: ["portable air compressor","mine air compressor","blue w-3.0/5 mine air compressor"],
    features: [
          "Portable structure for site movement",
          "Designed for industrial air supply applications",
          "Suitable for mining and construction support",
          "Model selection based on pressure and air delivery requirements",
          "Quote support for matching compressor type to working conditions"
    ],
    principle: "The compressor draws in air, compresses it through the compression system, and supplies pressurized air to pneumatic tools or industrial site equipment.",
    specs: [
          {
                "label": "Product type",
                "value": "Portable or mobile air compressor"
          },
          {
                "label": "Model selection",
                "value": "Based on air delivery, pressure, engine/motor type, and site environment"
          },
          {
                "label": "Application",
                "value": "Mining, drilling, construction, and industrial air supply"
          },
          {
                "label": "Customization",
                "value": "Color, configuration, power system, and accessory options"
          }
    ],
    applications: [
          "Mining",
          "Construction",
          "Drilling",
          "Industrial Maintenance",
          "Remote Work Sites"
    ],
    installation: "Used as a mobile air-supply unit and connected to compatible pneumatic equipment according to site requirements.",
    customization: [
          "Model configuration",
          "Color",
          "Power system",
          "Air delivery requirement",
          "Accessory package"
    ],
    faqs: [
          {
                "question": "What information is needed to quote Blue W-3.0/5 Mine Air Compressor?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  },
  {
    slug: "red-w-3-0-5-mine-air-compressor",
    name: "Red W-3.0/5 Mine Air Compressor",
    category: "Portable Air Compressors",
    image: "/images/source-products/red-w-3-0-5-mine-air-compressor.webp",
    summary: "Red W-3.0/5 Mine Air Compressor is a portable air compressor product for mining, construction, drilling, and other industrial air-supply applications where mobility and reliable output are required.",
    keywords: ["portable air compressor","mine air compressor","red w-3.0/5 mine air compressor"],
    features: [
          "Portable structure for site movement",
          "Designed for industrial air supply applications",
          "Suitable for mining and construction support",
          "Model selection based on pressure and air delivery requirements",
          "Quote support for matching compressor type to working conditions"
    ],
    principle: "The compressor draws in air, compresses it through the compression system, and supplies pressurized air to pneumatic tools or industrial site equipment.",
    specs: [
          {
                "label": "Product type",
                "value": "Portable or mobile air compressor"
          },
          {
                "label": "Model selection",
                "value": "Based on air delivery, pressure, engine/motor type, and site environment"
          },
          {
                "label": "Application",
                "value": "Mining, drilling, construction, and industrial air supply"
          },
          {
                "label": "Customization",
                "value": "Color, configuration, power system, and accessory options"
          }
    ],
    applications: [
          "Mining",
          "Construction",
          "Drilling",
          "Industrial Maintenance",
          "Remote Work Sites"
    ],
    installation: "Used as a mobile air-supply unit and connected to compatible pneumatic equipment according to site requirements.",
    customization: [
          "Model configuration",
          "Color",
          "Power system",
          "Air delivery requirement",
          "Accessory package"
    ],
    faqs: [
          {
                "question": "What information is needed to quote Red W-3.0/5 Mine Air Compressor?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  },
  {
    slug: "sf-4-0-5-diesel-piston-air-compressor",
    name: "SF-4.0/5 Diesel Piston Air Compressor",
    category: "Portable Air Compressors",
    image: "/images/source-products/sf-4-0-5-diesel-piston-air-compressor.webp",
    summary: "SF-4.0/5 Diesel Piston Air Compressor is a portable air compressor product for mining, construction, drilling, and other industrial air-supply applications where mobility and reliable output are required.",
    keywords: ["portable air compressor","mine air compressor","sf-4.0/5 diesel piston air compressor"],
    features: [
          "Portable structure for site movement",
          "Designed for industrial air supply applications",
          "Suitable for mining and construction support",
          "Model selection based on pressure and air delivery requirements",
          "Quote support for matching compressor type to working conditions"
    ],
    principle: "The compressor draws in air, compresses it through the compression system, and supplies pressurized air to pneumatic tools or industrial site equipment.",
    specs: [
          {
                "label": "Product type",
                "value": "Portable or mobile air compressor"
          },
          {
                "label": "Model selection",
                "value": "Based on air delivery, pressure, engine/motor type, and site environment"
          },
          {
                "label": "Application",
                "value": "Mining, drilling, construction, and industrial air supply"
          },
          {
                "label": "Customization",
                "value": "Color, configuration, power system, and accessory options"
          }
    ],
    applications: [
          "Mining",
          "Construction",
          "Drilling",
          "Industrial Maintenance",
          "Remote Work Sites"
    ],
    installation: "Used as a mobile air-supply unit and connected to compatible pneumatic equipment according to site requirements.",
    customization: [
          "Model configuration",
          "Color",
          "Power system",
          "Air delivery requirement",
          "Accessory package"
    ],
    faqs: [
          {
                "question": "What information is needed to quote SF-4.0/5 Diesel Piston Air Compressor?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  },
  {
    slug: "blue-sf-4-0-5-diesel-piston-air-compressor",
    name: "Blue SF-4.0/5 Diesel Piston Air Compressor",
    category: "Portable Air Compressors",
    image: "/images/source-products/blue-sf-4-0-5-diesel-piston-air-compressor.webp",
    summary: "Blue SF-4.0/5 Diesel Piston Air Compressor is a portable air compressor product for mining, construction, drilling, and other industrial air-supply applications where mobility and reliable output are required.",
    keywords: ["portable air compressor","mine air compressor","blue sf-4.0/5 diesel piston air compressor"],
    features: [
          "Portable structure for site movement",
          "Designed for industrial air supply applications",
          "Suitable for mining and construction support",
          "Model selection based on pressure and air delivery requirements",
          "Quote support for matching compressor type to working conditions"
    ],
    principle: "The compressor draws in air, compresses it through the compression system, and supplies pressurized air to pneumatic tools or industrial site equipment.",
    specs: [
          {
                "label": "Product type",
                "value": "Portable or mobile air compressor"
          },
          {
                "label": "Model selection",
                "value": "Based on air delivery, pressure, engine/motor type, and site environment"
          },
          {
                "label": "Application",
                "value": "Mining, drilling, construction, and industrial air supply"
          },
          {
                "label": "Customization",
                "value": "Color, configuration, power system, and accessory options"
          }
    ],
    applications: [
          "Mining",
          "Construction",
          "Drilling",
          "Industrial Maintenance",
          "Remote Work Sites"
    ],
    installation: "Used as a mobile air-supply unit and connected to compatible pneumatic equipment according to site requirements.",
    customization: [
          "Model configuration",
          "Color",
          "Power system",
          "Air delivery requirement",
          "Accessory package"
    ],
    faqs: [
          {
                "question": "What information is needed to quote Blue SF-4.0/5 Diesel Piston Air Compressor?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  },
  {
    slug: "2v-4-0-5-reciprocating-air-compressor",
    name: "2v-4.0/5 reciprocating air compressor",
    category: "Portable Air Compressors",
    image: "/images/source-products/2v-4-0-5-reciprocating-air-compressor.webp",
    summary: "2v-4.0/5 reciprocating air compressor is a portable air compressor product for mining, construction, drilling, and other industrial air-supply applications where mobility and reliable output are required.",
    keywords: ["portable air compressor","mine air compressor","2v-4.0/5 reciprocating air compressor"],
    features: [
          "Portable structure for site movement",
          "Designed for industrial air supply applications",
          "Suitable for mining and construction support",
          "Model selection based on pressure and air delivery requirements",
          "Quote support for matching compressor type to working conditions"
    ],
    principle: "The compressor draws in air, compresses it through the compression system, and supplies pressurized air to pneumatic tools or industrial site equipment.",
    specs: [
          {
                "label": "Product type",
                "value": "Portable or mobile air compressor"
          },
          {
                "label": "Model selection",
                "value": "Based on air delivery, pressure, engine/motor type, and site environment"
          },
          {
                "label": "Application",
                "value": "Mining, drilling, construction, and industrial air supply"
          },
          {
                "label": "Customization",
                "value": "Color, configuration, power system, and accessory options"
          }
    ],
    applications: [
          "Mining",
          "Construction",
          "Drilling",
          "Industrial Maintenance",
          "Remote Work Sites"
    ],
    installation: "Used as a mobile air-supply unit and connected to compatible pneumatic equipment according to site requirements.",
    customization: [
          "Model configuration",
          "Color",
          "Power system",
          "Air delivery requirement",
          "Accessory package"
    ],
    faqs: [
          {
                "question": "What information is needed to quote 2v-4.0/5 reciprocating air compressor?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  },
  {
    slug: "blue-2v-4-0-5-reciprocating-air-compressor",
    name: "Blue 2v-4.0/5 reciprocating air compressor",
    category: "Portable Air Compressors",
    image: "/images/source-products/blue-2v-4-0-5-reciprocating-air-compressor.webp",
    summary: "Blue 2v-4.0/5 reciprocating air compressor is a portable air compressor product for mining, construction, drilling, and other industrial air-supply applications where mobility and reliable output are required.",
    keywords: ["portable air compressor","mine air compressor","blue 2v-4.0/5 reciprocating air compressor"],
    features: [
          "Portable structure for site movement",
          "Designed for industrial air supply applications",
          "Suitable for mining and construction support",
          "Model selection based on pressure and air delivery requirements",
          "Quote support for matching compressor type to working conditions"
    ],
    principle: "The compressor draws in air, compresses it through the compression system, and supplies pressurized air to pneumatic tools or industrial site equipment.",
    specs: [
          {
                "label": "Product type",
                "value": "Portable or mobile air compressor"
          },
          {
                "label": "Model selection",
                "value": "Based on air delivery, pressure, engine/motor type, and site environment"
          },
          {
                "label": "Application",
                "value": "Mining, drilling, construction, and industrial air supply"
          },
          {
                "label": "Customization",
                "value": "Color, configuration, power system, and accessory options"
          }
    ],
    applications: [
          "Mining",
          "Construction",
          "Drilling",
          "Industrial Maintenance",
          "Remote Work Sites"
    ],
    installation: "Used as a mobile air-supply unit and connected to compatible pneumatic equipment according to site requirements.",
    customization: [
          "Model configuration",
          "Color",
          "Power system",
          "Air delivery requirement",
          "Accessory package"
    ],
    faqs: [
          {
                "question": "What information is needed to quote Blue 2v-4.0/5 reciprocating air compressor?",
                "answer": "Please provide the application site, required capacity or working condition, destination country, and any preferred model or configuration."
          },
          {
                "question": "Can you support overseas buyers with model selection?",
                "answer": "Yes. COWIN MAGNET provides service-first communication to help clarify requirements before quotation and shipment."
          }
    ]
  }
];

export const productCategories = [
  "Permanent Magnet Series",
  "Electromagnetic Series",
  "Magnetic Rollers & Magnetic Bars",
  "Mobile Solar Light Towers",
  "Portable Air Compressors"
];
