/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FamilyCatalog, TreeItem } from "./types";

export const INITIAL_TREE: Record<string, TreeItem> = {
  "Phones": {
    children: {
      "Android": { active: true },
      "iOS": { active: false },
      "Feature Phones": { active: false }
    }
  },
  "Tablets": {
    children: {
      "Android": { active: false },
      "iOS": { active: false }
    }
  },
  "Accessories": {
    children: {
      "Smart Watches": { active: false },
      "Bluetooth Earbuds & Over Earphones": { active: false },
      "Chargers": { active: false },
      "Power Banks": { active: false },
      "Cables": { active: false }
    }
  }
};

export const FALLBACK_BRANDS = [
  "Samsung",
  "Xiaomi",
  "Honor",
  "Infinix",
  "Oppo",
  "Realme",
  "Vivo",
  "Motorola"
];

export const FALLBACK_SAMPLE_FAMS: Record<string, string[]> = {
  "Samsung": [
    "Galaxy A07 4G", "Galaxy A17 4G", "Galaxy A17 5G", "Galaxy A26 5G", "Galaxy A36 5G",
    "Galaxy A56 5G", "Galaxy A37 5G", "Galaxy A57 5G", "Galaxy S25 FE 5G", "Galaxy S25 5G",
    "Galaxy S25 Plus 5G", "Galaxy S25 Ultra 5G", "Galaxy S26 5G", "Galaxy S26 Plus 5G",
    "Galaxy S26 Ultra 5G"
  ],
  "Infinix": [
    "Smart 10 4G", "Smart 20 4G", "Hot 60i 4G", "Hot 60 5G", "Hot 60 Pro 4G",
    "Hot 60 Pro Plus 4G", "Note 50s 5G", "Note Edge 5G", "Note 60 5G", "Note 60 Pro 5G",
    "GT 30 Pro 5G"
  ],
  "Honor": [
    "X5c", "X5c Plus", "X6c 4G", "X7d 4G", "X7d 5G", "X8d 4G", "X9d 5G",
    "400 Lite 5G", "400 5G", "400 Pro 5G", "600 Lite 5G", "600 5G", "600 Pro 5G"
  ],
  "Xiaomi": [
    "Redmi A5 4G", "Redmi A7 Pro 4G", "Redmi 15c 4G", "Redmi 15 4G", "Redmi Note 15 4G",
    "Redmi Note 15 5G", "Redmi Note 15 Pro 5G", "Redmi Note 15 Pro Plus 5G", "Poco C85 4G"
  ],
  "Oppo": [
    "A5i 4G", "A5x 4G", "A5 4G", "A5 Pro 4G", "A6x 4G", "A6 4G", "A6 Pro 4G",
    "A6 Pro 5G", "Reno 15f 5G", "Reno 15 5G", "Reno 15 Pro 5G", "Find X9 Pro 5G"
  ],
  "Realme": [
    "Note 60x 4G", "Note 70 4G", "C71 4G", "C75x 4G", "C85 4G", "C85 Pro 4G",
    "14T 5G", "14 5G", "14 Pro 5G", "14 Pro Plus 5G", "15T 5G", "15 5G", "15 Pro 5G"
  ],
  "Vivo": [
    "Y04 4G", "Y05 4G", "Y21D 4G", "Y31D 4G", "Y29 4G", "V60 Lite 4G", "V60 Lite 5G",
    "V60 5G", "V70 FE 5G", "V70 5G", "X300 Pro 5G"
  ],
  "Motorola": [
    "G35 5G", "G56 5G", "Edge 60 Fusion 5G", "Edge 60 5G", "Edge 60 Pro 5G"
  ]
};

// Detailed structured catalog with colors and storage variant details
export const FALLBACK_ADATA: Record<string, Record<string, FamilyCatalog>> = {
  "Samsung": {
    "Galaxy A07 4G": {
      "Black": {
        img: "https://i.ibb.co/MkMNMkSH/1.jpg",
        variants: [
          { s: "4GB / 64GB", name: "Galaxy A07 Dual SIM 4G 4GB - 64GB - Black", bc: "8806097655459" },
          { s: "4GB / 128GB", name: "Galaxy A07 Dual SIM 4G 4GB - 128GB - Black", bc: "8806097853770" },
          { s: "6GB / 128GB", name: "Galaxy A07 Dual SIM 4G 6GB - 128GB - Black", bc: "8806097853749" },
          { s: "8GB / 256GB", name: "Galaxy A07 Dual SIM 4G 8GB - 256GB - Black", bc: "8806097853732" }
        ]
      },
      "Green": {
        img: "https://i.ibb.co/N2s6bdS8/1.jpg",
        variants: [
          { s: "4GB / 64GB", name: "Galaxy A07 Dual SIM 4G 4GB - 64GB - Green", bc: "8806097853794" },
          { s: "4GB / 128GB", name: "Galaxy A07 Dual SIM 4G 4GB - 128GB - Green", bc: "8806097853787" },
          { s: "6GB / 128GB", name: "Galaxy A07 Dual SIM 4G 6GB - 128GB - Green", bc: "8806097853763" },
          { s: "8GB / 256GB", name: "Galaxy A07 Dual SIM 4G 8GB - 256GB - Green", bc: "8806097853756" }
        ]
      },
      "Light Violet": {
        img: "https://i.ibb.co/JFSZCYcm/1.jpg",
        variants: [
          { s: "4GB / 64GB", name: "Galaxy A07 Dual SIM 4G 4GB - 64GB - Light Violet", bc: "8806097853848" },
          { s: "4GB / 128GB", name: "Galaxy A07 Dual SIM 4G 4GB - 128GB - Light Violet", bc: "8806097853831" },
          { s: "6GB / 128GB", name: "Galaxy A07 Dual SIM 4G 6GB - 128GB - Light Violet", bc: "8806097853824" },
          { s: "8GB / 256GB", name: "Galaxy A07 Dual SIM 4G 8GB - 256GB - Light Violet", bc: "8806097853800" }
        ]
      }
    },
    "Galaxy A17 4G": {
      "Black": {
        img: "https://i.ibb.co/WpMhCD1c/1.jpg",
        variants: [
          { s: "4GB / 128GB", name: "Galaxy A17 Dual SIM 4G 4GB - 128GB - Black", bc: "8806097657460" },
          { s: "6GB / 128GB", name: "Galaxy A17 Dual SIM 4G 6GB - 128GB - Black", bc: "8806097657538" },
          { s: "8GB / 256GB", name: "Galaxy A17 Dual SIM 4G 8GB - 256GB - Black", bc: "8806097657439" }
        ]
      },
      "Grey": {
        img: "https://i.ibb.co/39LJpsLw/1.jpg",
        variants: [
          { s: "4GB / 128GB", name: "Galaxy A17 Dual SIM 4G 4GB - 128GB - Grey", bc: "8806097657606" },
          { s: "6GB / 128GB", name: "Galaxy A17 Dual SIM 4G 6GB - 128GB - Grey", bc: "8806097657644" },
          { s: "8GB / 256GB", name: "Galaxy A17 Dual SIM 4G 8GB - 256GB - Grey", bc: "8806097657576" }
        ]
      },
      "Light Blue": {
        img: "https://i.ibb.co/SDHjHRYs/1.jpg",
        variants: [
          { s: "4GB / 128GB", name: "Galaxy A17 Dual SIM 4G 4GB - 128GB - Light Blue", bc: "8806097657736" },
          { s: "6GB / 128GB", name: "Galaxy A17 Dual SIM 4G 6GB - 128GB - Light Blue", bc: "8806097657774" },
          { s: "8GB / 256GB", name: "Galaxy A17 Dual SIM 4G 8GB - 256GB - Light Blue", bc: "8806097657699" }
        ]
      }
    },
    "Galaxy A17 5G": {
      "Black": {
        img: "https://i.ibb.co/WpMhCD1c/1.jpg",
        variants: [{ s: "8GB / 256GB", name: "Galaxy A17 Dual SIM 5G 8GB - 256GB - Black", bc: "8806097666578" }]
      },
      "Grey": {
        img: "https://i.ibb.co/39LJpsLw/1.jpg",
        variants: [{ s: "8GB / 256GB", name: "Galaxy A17 Dual SIM 5G 8GB - 256GB - Grey", bc: "8806097668510" }]
      },
      "Blue": {
        img: "https://i.ibb.co/tMS57gX6/1.jpg",
        variants: [{ s: "8GB / 256GB", name: "Galaxy A17 Dual SIM 5G 8GB - 256GB - Blue", bc: "8806097666417" }]
      }
    },
    "Galaxy A26 5G": {
      "Black": {
        img: "https://i.ibb.co/2YRcwVD9/1.jpg",
        variants: [
          { s: "6GB / 128GB", name: "Galaxy A26 Dual SIM 5G 6GB - 128GB - Black", bc: "8806097102465" },
          { s: "8GB / 256GB", name: "Galaxy A26 Dual SIM 5G 8GB - 256GB - Black", bc: "8806097102434" }
        ]
      },
      "Peach Pink": {
        img: "https://i.ibb.co/HTRK2tQv/1.jpg",
        variants: [
          { s: "6GB / 128GB", name: "Galaxy A26 Dual SIM 5G 6GB - 128GB - Peach Pink", bc: "8806097102274" },
          { s: "8GB / 256GB", name: "Galaxy A26 Dual SIM 5G 8GB - 256GB - Peach Pink", bc: "8806097102243" }
        ]
      },
      "White": {
        img: "https://i.ibb.co/39SBtPSn/1.jpg",
        variants: [
          { s: "6GB / 128GB", name: "Galaxy A26 Dual SIM 5G 6GB - 128GB - White", bc: "8806097102380" },
          { s: "8GB / 256GB", name: "Galaxy A26 Dual SIM 5G 8GB - 256GB - White", bc: "8806097102342" }
        ]
      }
    },
    "Galaxy A36 5G": {
      "Awesome Black": {
        img: "https://i.ibb.co/ZqzYsbm/1.jpg",
        variants: [
          { s: "8GB / 128GB", name: "Galaxy A36 Dual SIM 5G 8GB - 128GB - Awesome Black", bc: "8806097048299" },
          { s: "8GB / 256GB", name: "Galaxy A36 Dual SIM 5G 8GB - 256GB - Awesome Black", bc: "8806097048244" }
        ]
      },
      "Awesome Lavender": {
        img: "https://i.ibb.co/hRwKsdcw/1.jpg",
        variants: [
          { s: "8GB / 128GB", name: "Galaxy A36 Dual SIM 5G 8GB - 128GB - Awesome Lavender", bc: "8806097048916" },
          { s: "8GB / 256GB", name: "Galaxy A36 Dual SIM 5G 8GB - 256GB - Awesome Lavender", bc: "8806097048879" }
        ]
      },
      "Awesome White": {
        img: "https://i.ibb.co/rGR3R0D8/1.jpg",
        variants: [
          { s: "8GB / 128GB", name: "Galaxy A36 Dual SIM 5G 8GB - 128GB - Awesome White", bc: "8806097048626" },
          { s: "8GB / 256GB", name: "Galaxy A36 Dual SIM 5G 8GB - 256GB - Awesome White", bc: "8806097048534" }
        ]
      },
      "Awesome Lime": {
        img: "https://i.ibb.co/nNpkvr1m/1.jpg",
        variants: [
          { s: "8GB / 128GB", name: "Galaxy A36 Dual SIM 5G 8GB - 128GB - Awesome Lime", bc: "8806097049241" },
          { s: "8GB / 256GB", name: "Galaxy A36 Dual SIM 5G 8GB - 256GB - Awesome Lime", bc: "8806097049159" }
        ]
      }
    },
    "Galaxy A56 5G": {
      "Awesome Light Gray": {
        img: "https://i.ibb.co/gLK4VJL3/1.jpg",
        variants: [
          { s: "8GB / 128GB", name: "Galaxy A56 Dual SIM 5G 8GB - 128GB - Awesome Light Gray", bc: "8806097047162" },
          { s: "8GB / 256GB", name: "Galaxy A56 Dual SIM 5G 8GB - 256GB - Awesome Light Gray", bc: "8806097047964" },
          { s: "12GB / 256GB", name: "Galaxy A56 Dual SIM 5G 12GB - 256GB - Awesome Light Gray", bc: "8806097047926" }
        ]
      },
      "Awesome Graphite": {
        img: "https://i.ibb.co/1fh2FFqG/1.jpg",
        variants: [
          { s: "8GB / 128GB", name: "Galaxy A56 Dual SIM 5G 8GB - 128GB - Awesome Graphite", bc: "8806097047681" },
          { s: "8GB / 256GB", name: "Galaxy A56 Dual SIM 5G 8GB - 256GB - Awesome Graphite", bc: "8806097047643" },
          { s: "12GB / 256GB", name: "Galaxy A56 Dual SIM 5G 12GB - 256GB - Awesome Graphite", bc: "8806097047605" }
        ]
      },
      "Awesome Olive": {
        img: "https://i.ibb.co/YFNTnFP9/1.jpg",
        variants: [
          { s: "8GB / 128GB", name: "Galaxy A56 Dual SIM 5G 8GB - 128GB - Awesome Olive", bc: "8806097047841" },
          { s: "8GB / 256GB", name: "Galaxy A56 Dual SIM 5G 8GB - 256GB - Awesome Olive", bc: "8806097047810" },
          { s: "12GB / 256GB", name: "Galaxy A56 Dual SIM 5G 12GB - 256GB - Awesome Olive", bc: "8806097047766" }
        ]
      },
      "Awesome Pink": {
        img: "https://i.ibb.co/d0MnJcNK/1.jpg",
        variants: [
          { s: "8GB / 128GB", name: "Galaxy A56 Dual SIM 5G 8GB - 128GB - Awesome Pink", bc: "8806097047391" },
          { s: "8GB / 256GB", name: "Galaxy A56 Dual SIM 5G 8GB - 256GB - Awesome Pink", bc: "8806097047292" },
          { s: "12GB / 256GB", name: "Galaxy A56 Dual SIM 5G 12GB - 256GB - Awesome Pink", bc: "8806097047247" }
        ]
      }
    },
    "Galaxy A37 5G": {
      "Awesome Charcoal": {
        img: "https://i.ibb.co/vxMQCwKQ/1.jpg",
        variants: [
          { s: "8GB / 128GB", name: "Galaxy A37 Dual SIM 5G 8GB - 128GB - Awesome Charcoal", bc: "8806099055707" },
          { s: "8GB / 256GB", name: "Galaxy A37 Dual SIM 5G 8GB - 256GB - Awesome Charcoal", bc: "8806099055684" },
          { s: "12GB / 256GB", name: "Galaxy A37 Dual SIM 5G 12GB - 256GB - Awesome Charcoal", bc: "8806099140984" }
        ]
      },
      "Awesome Gray Green": {
        img: "https://i.ibb.co/S2NkbbN/1.jpg",
        variants: [
          { s: "8GB / 128GB", name: "Galaxy A37 Dual SIM 5G 8GB - 128GB - Awesome Gray Green", bc: "8806099055585" },
          { s: "8GB / 256GB", name: "Galaxy A37 Dual SIM 5G 8GB - 256GB - Awesome Gray Green", bc: "8806099055561" },
          { s: "12GB / 256GB", name: "Galaxy A37 Dual SIM 5G 12GB - 256GB - Awesome Gray Green", bc: "8806099140991" }
        ]
      },
      "Awesome Lavender": {
        img: "https://i.ibb.co/fVgYPyCx/1.jpg",
        variants: [
          { s: "8GB / 128GB", name: "Galaxy A37 Dual SIM 5G 8GB - 128GB - Awesome Lavender", bc: "8806099055523" },
          { s: "8GB / 256GB", name: "Galaxy A37 Dual SIM 5G 8GB - 256GB - Awesome Lavender", bc: "8806099055509" },
          { s: "12GB / 256GB", name: "Galaxy A37 Dual SIM 5G 12GB - 256GB - Awesome Lavender", bc: "8806099141110" }
        ]
      },
      "Awesome White": {
        img: "https://i.ibb.co/W4f0fJbT/1.jpg",
        variants: [
          { s: "8GB / 128GB", name: "Galaxy A37 Dual SIM 5G 8GB - 128GB - Awesome White", bc: "8806099055646" },
          { s: "8GB / 256GB", name: "Galaxy A37 Dual SIM 5G 8GB - 256GB - Awesome White", bc: "8806099055622" },
          { s: "12GB / 256GB", name: "Galaxy A37 Dual SIM 5G 12GB - 256GB - Awesome White", bc: "8806099140977" }
        ]
      }
    },
    "Galaxy S25 Ultra 5G": {
      "Titanium Black": {
        img: "https://i.ibb.co/sdBRgSK3/1.jpg",
        variants: [
          { s: "12GB / 256GB", name: "Galaxy S25 Ultra Dual SIM 5G 12GB - 256GB - Titanium Black", bc: "8806095830933" },
          { s: "12GB / 512GB", name: "Galaxy S25 Ultra Dual SIM 5G 12GB - 512GB - Titanium Black", bc: "8806095830896" },
          { s: "12GB / 1TB", name: "Galaxy S25 Ultra Dual SIM 5G 12GB - 1TB - Titanium Black", bc: "8806095830858" }
        ]
      }
    }
  }
};

// iOS static config definitions
export const REGIONS = ["International", "Japanese", "Middle East", "Chinese", "USA"];
export const SIM_LIST = ["Single SIM", "Dual SIM", "eSIM Only"];

export const SIM_TEXT_EN: Record<string, string> = {
  "Single SIM": "Nano-SIM and eSIM",
  "Dual SIM": "Dual Nano-SIM",
  "eSIM Only": "eSIM only"
};

export const SIM_TEXT_AR: Record<string, string> = {
  "Single SIM": "Nano-SIM و eSIM",
  "Dual SIM": "شريحتان Nano-SIM",
  "eSIM Only": "eSIM فقط"
};

export const SIM_AR_NAME: Record<string, string> = {
  "Single SIM": "شريحة واحدة",
  "Dual SIM": "شريحتان",
  "eSIM Only": "eSIM فقط"
};

export const REGION_AR: Record<string, string> = {
  "International": "النسخة الدولية",
  "Japanese": "النسخة اليابانية",
  "Middle East": "نسخة الشرق الأوسط",
  "Chinese": "النسخة الصينية",
  "USA": "النسخة الأمريكية"
};

export const FT_AR: Record<string, string> = {
  "FaceTime Supported": "مدعوم",
  "FaceTime Not Supported": "غير مدعوم"
};

export const BULK_HEADERS = [
  "Name", "Name_AR", "Name_FR", "Description", "Description_AR", "Description_FR", "SellerSKU", "ParentSKU",
  "Brand", "PrimaryCategory", "GTIN_Barcode", "Price_EGP", "Sale_Price_EGP", "Sale_Price_Start_At",
  "Sale_Price_End_At", "Stock", "variation", "battery_feature", "bluetooth", "certifications", "chipset_manufacturer",
  "color", "color_AR", "color_FR", "color_family", "condition", "cpu_brand", "cpu_cores", "cpu_speed",
  "display_features", "display_size", "expandable_memory", "external_memory_slot", "extra_features",
  "graphics_processor", "health_features", "main_material", "manufacturer_txt", "material_family",
  "megapixels", "memory_capacity", "memory_technology", "model", "network_coverage", "note", "operating_system",
  "package_content", "package_content_AR", "package_content_FR", "panel_type", "product_line", "product_measures",
  "product_warranty", "product_weight", "production_country", "rear_camera", "screen_size", "security_features",
  "short_description", "short_description_AR", "short_description_FR", "sim_size", "storage_capacity",
  "warranty_address", "warranty_duration", "warranty_type", "youtube_id", "MainImage", "Image2", "Image3",
  "Image4", "Image5", "Image6", "Image7", "Image8"
];
