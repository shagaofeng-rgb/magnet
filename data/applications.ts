export type Application = {
  slug: string;
  name: string;
  image: string;
  summary: string;
  painPoints: string[];
  recommendedProducts: string[];
  faqs: { question: string; answer: string }[];
};

export const applications: Application[] = [
  {
    slug: "mining",
    name: "Mining",
    image: "/images/catalog/page-1-image-9-2546x1532.jpg",
    summary:
      "Magnetic separators remove tramp iron from ore, stone, and conveyed bulk materials to protect crushers, screens, mills, and downstream processing equipment.",
    painPoints: ["Crusher damage from tramp iron", "Thick material burden", "Dusty and harsh operating conditions"],
    recommendedProducts: [
      "Suspended Electromagnetic Conveyor Belt Separator",
      "Permanent Overband Magnet",
      "Magnetic Drum Separator"
    ],
    faqs: [
      {
        question: "Which magnetic separator is suitable for mining conveyors?",
        answer:
          "For heavy burden and deep iron pieces, suspended electromagnetic separators are often preferred. For lower operating cost and continuous removal, permanent overband magnets are commonly used."
      }
    ]
  },
  {
    slug: "recycling",
    name: "Recycling",
    image: "/images/generated/recycling-application-cowinmagnet.png",
    summary:
      "Recycling lines need continuous separation of ferrous metals from mixed waste, scrap, shredded materials, and conveyed industrial materials.",
    painPoints: ["Frequent iron contamination", "Need for continuous discharge", "High wear and unstable material flow"],
    recommendedProducts: [
      "Automatic Cleaning Magnetic Separators for Iron Scrap Waste",
      "Permanent Overband Magnet",
      "Metal Detector"
    ],
    faqs: [
      {
        question: "What separator is best for high iron contamination in recycling?",
        answer:
          "A self-cleaning overband magnet is usually the right starting point because it removes and discharges ferrous metals continuously."
      }
    ]
  },
  {
    slug: "aggregate-cement",
    name: "Aggregate & Cement",
    image: "/images/catalog/page-3-image-1-1349x734.jpg",
    summary:
      "Aggregate and cement plants use magnetic separation to protect crushers, conveyors, mills, and process equipment from metal damage.",
    painPoints: ["Metal damage to crushers and mills", "Large conveyor widths", "High dust levels and long operating hours"],
    recommendedProducts: [
      "Suspended Permanent Magnetic Separator",
      "Electromagnetic Self-Unloading Iron Remover",
      "Magnetic Head Pulley"
    ],
    faqs: [
      {
        question: "Can one separator cover different conveyor widths?",
        answer:
          "Each separator should be selected according to conveyor width, belt speed, suspension height, and material burden. Custom sizing is available."
      }
    ]
  },
  {
    slug: "coal-power-plant",
    name: "Coal & Power Plant",
    image: "/images/catalog/page-4-image-1-1349x734.jpg",
    summary:
      "Coal handling and power plant conveyors require stable iron removal to reduce equipment damage, downtime, and maintenance costs.",
    painPoints: ["Long conveyor systems", "Continuous industrial operation", "Need to protect downstream crushers and mills"],
    recommendedProducts: [
      "Suspended Electromagnetic Conveyor Belt Separator",
      "Electromagnetic Self-Unloading Iron Remover",
      "Magnetic Head Pulley"
    ],
    faqs: [
      {
        question: "Why use electromagnetic separators in coal handling?",
        answer:
          "Electromagnetic separators provide deep magnetic penetration and strong attraction for buried ferrous pieces in thick material layers."
      }
    ]
  }
];
