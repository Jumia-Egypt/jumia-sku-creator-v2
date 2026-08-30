/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "motion/react";
import {
  Smartphone,
  Tablet,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Trash2,
  Plus,
  ArrowLeft,
  ArrowRight,
  Search,
  CheckCircle,
  RefreshCw,
  FileSpreadsheet,
  Lock,
  Unlock,
  Store,
  AlertTriangle,
  User,
  Download,
  PlusCircle,
  Check,
  Info,
  Layers,
  ShoppingBag,
  ExternalLink,
  Plus as PlusIcon,
  Trash
} from "lucide-react";

import {
  Variant,
  ColorDetail,
  FamilyCatalog,
  TreeItem,
  QueueItem,
  Submission,
  SelectedStorageState
} from "./types";

import {
  INITIAL_TREE,
  FALLBACK_BRANDS,
  FALLBACK_SAMPLE_FAMS,
  FALLBACK_ADATA,
  REGIONS,
  SIM_LIST,
  SIM_TEXT_EN,
  SIM_TEXT_AR,
  SIM_AR_NAME,
  REGION_AR,
  FT_AR,
  BULK_HEADERS
} from "./data";

// Initialize Supabase Client
const SUPABASE_URL = "https://vxscfljgtmddnmzmwitq.supabase.co";
const SUPABASE_KEY = "sb_publishable_3Im_1dgtrjvTitchLnjIzA_Vu3RaDPw";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

const ADMIN_PASSWORD = "P@$$w0rD";

export default function App() {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<"vendor" | "admin">("vendor");
  const [shopName, setShopName] = useState<string>(() => {
    return localStorage.getItem("jumia_shop_name") || "";
  });
  const [shopNameInput, setShopNameInput] = useState("");

  // Catalog Browser States
  const [path, setPath] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>(FALLBACK_BRANDS);
  const [sampleFams, setSampleFams] = useState<Record<string, string[]>>(FALLBACK_SAMPLE_FAMS);
  const [aData, setAData] = useState<Record<string, Record<string, FamilyCatalog>>>(FALLBACK_ADATA);

  // iOS catalog lists loaded from DB
  const [iosCatalogLoaded, setIosCatalogLoaded] = useState(false);
  const [iosFamilies, setIosFamilies] = useState<string[]>([]);
  const [iosAData, setIosAData] = useState<Record<string, FamilyCatalog>>({});

  // Active Wizard state
  const [selectedFamily, setSelectedFamily] = useState<string>("");
  const [familySelections, setFamilySelections] = useState<Record<string, SelectedStorageState>>({});
  const [commonCountry, setCommonCountry] = useState<string>("");
  const [commonWarranty, setCommonWarranty] = useState<string>("");
  const [famClearArmed, setFamClearArmed] = useState(false);

  // Queue State
  const [queue, setQueue] = useState<QueueItem[]>(() => {
    const saved = localStorage.getItem("jumia_sku_queue");
    return saved ? JSON.parse(saved) : [];
  });
  const [queueOpen, setQueueOpen] = useState(false);
  const [qOpenBrand, setQOpenBrand] = useState<Record<string, boolean>>({});
  const [qOpenFam, setQOpenFam] = useState<Record<string, boolean>>({});
  const [clearQueueArmed, setClearQueueArmed] = useState(false);

  // Admin Panel States
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");
  const [clearSubsArmed, setClearSubsArmed] = useState(false);
  const [adminOpenVendors, setAdminOpenVendors] = useState<Record<string, boolean>>({});
  const [adminOpenBrands, setAdminOpenBrands] = useState<Record<string, boolean>>({});
  const [adminOpenFamilies, setAdminOpenFamilies] = useState<Record<string, boolean>>({});

  // Shared UI states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isDoneLoading, setIsDoneLoading] = useState(false);

  // Refs for smooth scrolling
  const wizardCardRef = useRef<HTMLDivElement>(null);
  const familyCardRef = useRef<HTMLDivElement>(null);
  const queueCardRef = useRef<HTMLDivElement>(null);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem("jumia_sku_queue", JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    if (shopName) {
      localStorage.setItem("jumia_shop_name", shopName);
    } else {
      localStorage.removeItem("jumia_shop_name");
    }
  }, [shopName]);

  // Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Load live catalogs on startup
  useEffect(() => {
    loadLiveCatalog();
    loadLiveIOSCatalog();
  }, []);

  const loadLiveCatalog = async () => {
    try {
      const { data, error } = await sb
        .from("master_data")
        .select("barcode,brand,model_family,ram,rom,color,name_en,image1")
        .order("id", { ascending: true });

      if (error) {
        console.warn("Live catalog fetch failed, using fallbacks:", error.message);
        return;
      }

      if (data && data.length > 0) {
        const customAData: Record<string, Record<string, FamilyCatalog>> = {};
        const customSampleFams: Record<string, string[]> = {};
        const customBrands: string[] = [];

        data.forEach((m) => {
          const br = m.brand;
          const fam = m.model_family;
          const col = m.color;
          if (!br || !fam || !col) return;

          if (!customAData[br]) {
            customAData[br] = {};
            customSampleFams[br] = [];
            customBrands.push(br);
          }

          if (!customAData[br][fam]) {
            customAData[br][fam] = {};
            customSampleFams[br].push(fam);
          }

          if (!customAData[br][fam][col]) {
            customAData[br][fam][col] = {
              img: m.image1 || "",
              variants: []
            };
          }

          customAData[br][fam][col].variants.push({
            s: `${m.ram || ""} / ${m.rom || ""}`,
            name: m.name_en,
            bc: m.barcode || ""
          });
        });

        setAData(customAData);
        setSampleFams(customSampleFams);
        setBrands(customBrands);
      }
    } catch (err) {
      console.warn("Catalog fetch request exception:", err);
    }
  };

  const loadLiveIOSCatalog = async () => {
    try {
      const { data, error } = await sb
        .from("master_data_ios")
        .select("id,model_family,rom,color,name_en,name_ar,image1")
        .order("id", { ascending: true });

      if (error) {
        console.warn("iOS live catalog failed:", error.message);
        return;
      }

      if (data && data.length > 0) {
        const customIOSAData: Record<string, FamilyCatalog> = {};
        const customIOSFams: string[] = [];

        data.forEach((r) => {
          const f = r.model_family;
          const rom = r.rom;
          const color = r.color;
          if (!f || !rom || !color) return;

          if (!customIOSAData[f]) {
            customIOSAData[f] = {};
            customIOSFams.push(f);
          }

          if (!customIOSAData[f][color]) {
            customIOSAData[f][color] = {
              img: r.image1 || "",
              variants: []
            };
          }

          // Avoid duplicate rom entries per color
          const colorObj = customIOSAData[f][color];
          if (!colorObj.variants.some((v) => v.s === rom)) {
            colorObj.variants.push({
              s: rom,
              id: r.id,
              name_en: r.name_en,
              name_ar: r.name_ar,
              name: r.name_en
            });
          }
        });

        // Sort variant capacities by numerical size
        Object.keys(customIOSAData).forEach((f) => {
          Object.keys(customIOSAData[f]).forEach((c) => {
            customIOSAData[f][c].variants.sort((a, b) => {
              const parseSize = (s: string) => {
                const match = /([\d.]+)\s*(TB|GB)/i.exec(s);
                if (!match) return 0;
                const num = parseFloat(match[1]);
                return /TB/i.test(match[2]) ? num * 1024 : num;
              };
              return parseSize(a.s) - parseSize(b.s);
            });
          });
        });

        setIosAData(customIOSAData);
        setIosFamilies(customIOSFams);
        setIosCatalogLoaded(true);
      }
    } catch (err) {
      console.warn("iOS live catalog exception:", err);
    }
  };

  // Helper to format thumbnail image using Supabase bucket mapping
  const fThumb = (u: string): string => {
    if (!u) return "";
    // Serve images directly from public folder with base path
    const basePath = "/jumia-sku-creator-v2";
    if (u.startsWith("/")) {
      return basePath + u;
    }
    return u;
  };

  const nodeAt = (p: string[]) => {
    if (p.length === 0) return INITIAL_TREE;
    if (p.length === 1) return INITIAL_TREE[p[0]]?.children || null;
    return null;
  };

  // Navigate breadcrumbs
  const handleCrumbClick = (index: number) => {
    setPath(path.slice(0, index));
    setSelectedFamily("");
    setFamilySelections({});
    setCommonCountry("");
    setCommonWarranty("");
    setTimeout(() => {
      wizardCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleResetNav = () => {
    setPath([]);
    setSelectedFamily("");
    setFamilySelections({});
    setCommonCountry("");
    setCommonWarranty("");
    setTimeout(() => {
      wizardCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Check if a item exists in local queue
  const inQueue = (name: string) => {
    return queue.some((item) => item.name === name);
  };

  const inQueueIOS = (fam: string, color: string, storage: string) => {
    return queue.some((item) => item.isIOS && item.family === fam && item.color === color && item.storage === storage);
  };

  // Gather currently selected brand based on wizard path
  const currentBrand = path.length >= 3 ? path[2] : path[1] === "iOS" ? "Apple" : "";

  // Get active catalogs
  const activeFamilies = currentBrand === "Apple" ? iosFamilies : sampleFams[currentBrand] || [];
  const activeFamilyDetails = (currentBrand === "Apple" ? iosAData[selectedFamily] || {} : (aData[currentBrand]?.[selectedFamily] || {})) as FamilyCatalog;

  // Form validity states
  const isIOS = currentBrand === "Apple";

  const isFormReadyToSubmit = () => {
    const keys = Object.keys(familySelections);
    if (keys.length === 0) return false;

    if (isIOS) {
      return keys.every((key) => {
        const s = familySelections[key];
        return s.sim && s.facetime && s.region && s.country && s.warranty && s.barcode && s.barcode.trim();
      });
    } else {
      return (
        commonCountry &&
        commonWarranty &&
        keys.every((key) => {
          // Find standard variant
          let foundVariant: Variant | undefined;
          Object.values(activeFamilyDetails).forEach((colDetail) => {
            (colDetail as ColorDetail).variants.forEach((v) => {
              if (v.name === key) foundVariant = v;
            });
          });
          const originalBarcode = foundVariant?.bc || "";
          const typedBarcode = familySelections[key]?.barcode || "";
          return originalBarcode || typedBarcode.trim();
        })
      );
    }
  };

  // Storing the description cache for iOS variants
  const [iosDescCache, setIosDescCache] = useState<Record<string, { desc_en: string; desc_ar: string; hl: string; hl_ar: string }>>({});

  const handleAddToQueue = async () => {
    if (!isFormReadyToSubmit()) {
      triggerToast("Please fill in all required fields highlighted in red.");
      return;
    }

    setIsDoneLoading(true);

    if (isIOS) {
      const keys = Object.keys(familySelections);
      const newQueueItems: QueueItem[] = [];

      try {
        for (const key of keys) {
          const s = familySelections[key];
          const [fam, colName, storage] = key.split("|");
          const colorObj = iosAData[fam]?.[colName];
          const vobj = colorObj?.variants.find((v) => v.s === storage);

          if (!vobj) continue;

          // Fetch description from Supabase if not in cache
          let descData = iosDescCache[String(vobj.id)];
          if (!descData) {
            const { data, error } = await sb
              .from("master_data_ios")
              .select("long_desc_en,highlights_en,long_desc_ar,highlights_ar")
              .eq("id", vobj.id);

            if (error || !data || data.length === 0) {
              console.error("iOS description fetch failed:", error);
              triggerToast("Connection failed. Please check internet connection.");
              setIsDoneLoading(false);
              return;
            }

            descData = {
              desc_en: data[0].long_desc_en || "",
              desc_ar: data[0].long_desc_ar || "",
              hl: data[0].highlights_en || "",
              hl_ar: data[0].highlights_ar || ""
            };

            setIosDescCache((prev) => ({
              ...prev,
              [String(vobj.id)]: descData
            }));
          }

          // Build dynamic names & translations
          const nameEN = vobj.name_en?.replace(/Single SIM|Dual SIM|eSIM Only/, s.sim) + ` "${s.region} Version" "${s.facetime}"`;
          
          let rawAr = vobj.name_ar || "";
          const simArStr = SIM_AR_NAME[s.sim] || s.sim;
          const regArStr = REGION_AR[s.region] || s.region;
          const ftArStr = FT_AR[s.facetime] || "";
          const nameAR = rawAr.replace(/Single SIM|Dual SIM|eSIM Only|شريحة واحدة|شريحتان|eSIM فقط/, simArStr) + ` "${regArStr}" "FaceTime ${ftArStr}"`;

          // Form descriptions
          let finalDescEn = descData.desc_en;
          if (SIM_TEXT_EN[s.sim]) {
            finalDescEn = finalDescEn.replace(/(<li>SIM:\s*)[^<]*(<\/li>)/, `$1${SIM_TEXT_EN[s.sim]}$2`);
          }
          finalDescEn = finalDescEn.replace(/(<li>FaceTime:\s*)[^<]*(<\/li>)/, `$1${s.facetime === "FaceTime Supported" ? "Supported" : "Not Supported"}$2`);

          let finalDescAr = descData.desc_ar;
          if (SIM_TEXT_AR[s.sim]) {
            finalDescAr = finalDescAr.replace(/(<li>شريحة الاتصال:\s*)[^<]*(<\/li>)/, `$1${SIM_TEXT_AR[s.sim]}$2`);
          }
          finalDescAr = finalDescAr.replace(/(<li>FaceTime:\s*)[^<]*(<\/li>)/, `$1${FT_AR[s.facetime] || ""}$2`);

          if (!inQueue(nameEN)) {
            newQueueItems.push({
              family: fam,
              brand: "Apple",
              color: colName,
              storage: storage,
              name: nameEN,
              name_ar: nameAR,
              desc: finalDescEn,
              desc_ar: finalDescAr,
              hl: descData.hl,
              hl_ar: descData.hl_ar,
              img: colorObj?.img || "",
              barcode: s.barcode,
              sku: s.sku,
              country: s.country,
              warranty: s.warranty,
              sim: s.sim,
              region: s.region,
              facetime: s.facetime,
              isIOS: true
            });
          }
        }

        setQueue((prev) => [...prev, ...newQueueItems]);
        triggerToast(`Added ${newQueueItems.length} iPhone versions to Queue.`);
      } catch (err) {
        console.error("iOS queue add exception:", err);
        triggerToast("An error occurred while building descriptions.");
      }
    } else {
      // Android
      const newQueueItems: QueueItem[] = [];
      Object.keys(familySelections).forEach((key) => {
        let foundVariant: Variant | undefined;
        let colName = "";
        let imgUrl = "";

        Object.entries(activeFamilyDetails).forEach(([color, detail]) => {
          const colDetail = detail as ColorDetail;
          colDetail.variants.forEach((v) => {
            if (v.name === key) {
              foundVariant = v;
              colName = color;
              imgUrl = colDetail.img;
            }
          });
        });

        if (!foundVariant) return;

        const actualBarcode = foundVariant.bc || familySelections[key]?.barcode || "";

        if (!inQueue(key)) {
          newQueueItems.push({
            family: selectedFamily,
            brand: currentBrand,
            color: colName,
            storage: foundVariant.s,
            name: key,
            img: imgUrl,
            barcode: actualBarcode,
            sku: familySelections[key]?.sku || "",
            country: commonCountry,
            warranty: commonWarranty
          });
        }
      });

      setQueue((prev) => [...prev, ...newQueueItems]);
      triggerToast(`Added ${newQueueItems.length} Android models to Queue.`);
    }

    setIsDoneLoading(false);
    setSelectedFamily("");
    setFamilySelections({});
    setCommonCountry("");
    setCommonWarranty("");
  };

  // Submit Queue to Supabase
  const handleSubmitQueue = async () => {
    if (!queue.length) {
      triggerToast("Queue is empty.");
      return;
    }
    if (!shopName) {
      triggerToast("Shop Name is missing.");
      return;
    }

    setSubmitLoading(true);

    const submissionRows = queue.map((q) => {
      const row: any = {
        shop_name: shopName,
        name_en: q.name,
        brand: q.brand,
        model_family: q.family,
        country: q.country,
        warranty: q.warranty,
        barcode: q.barcode || "",
        seller_sku: q.sku || ""
      };

      if (q.isIOS) {
        row.is_ios = true;
        row.name_ar = q.name_ar || "";
        row.desc_en = q.desc || "";
        row.desc_ar = q.desc_ar || "";
        row.highlights_en = q.hl || "";
        row.highlights_ar = q.hl_ar || "";
        row.color = q.color || "";
        row.image1 = q.img || "";
      }

      return row;
    });

    try {
      const { data, error } = await sb.from("submissions").insert(submissionRows);

      if (error) {
        alert("Submission failed: " + error.message);
        setSubmitLoading(false);
        return;
      }

      triggerToast(`Successfully submitted ${queue.length} product SKUs to Jumia!`);
      setQueue([]);
      setPath([]);
      setSelectedFamily("");
      setFamilySelections({});
      setCommonCountry("");
      setCommonWarranty("");
      setShopName("");
      setShopNameInput("");
      setQOpenBrand({});
      setQOpenFam({});
    } catch (err: any) {
      alert("Submit exception: " + (err?.message || err));
    } finally {
      setSubmitLoading(false);
    }
  };

  // Admin authenticate
  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) {
      setAdminAuthenticated(true);
      setAdminPasswordError(false);
      loadAdminSubmissions();
    } else {
      setAdminPasswordError(true);
    }
  };

  const loadAdminSubmissions = async () => {
    setAdminLoading(true);
    try {
      const { data, error } = await sb
        .from("submissions")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Submissions loading error:", error.message);
        return;
      }
      setSubmissions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      const { error } = await sb.from("submissions").delete().eq("id", id);
      if (error) {
        alert("Delete failed: " + error.message);
        return;
      }
      triggerToast("Submission deleted.");
      loadAdminSubmissions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminClearAll = async () => {
    if (!clearSubsArmed) {
      setClearSubsArmed(true);
      setTimeout(() => setClearSubsArmed(false), 3000);
      return;
    }

    try {
      const { error } = await sb.from("submissions").delete().neq("id", 0);
      if (error) {
        alert("Clear failed: " + error.message);
        return;
      }
      triggerToast("All submissions deleted from system.");
      loadAdminSubmissions();
    } catch (err) {
      console.error(err);
    } finally {
      setClearSubsArmed(false);
    }
  };

  // Export & Download CSV Bulk Sheet
  const handleDownloadCsv = async (filterShopName?: string) => {
    const listToExport = filterShopName
      ? submissions.filter((s) => s.shop_name === filterShopName)
      : submissions;

    if (!listToExport.length) {
      alert("No submissions to export yet.");
      return;
    }

    try {
      const { data: masterData, error: masterError } = await sb.from("master_data").select("*");
      if (masterError) {
        alert("Catalog loading failed: " + masterError.message);
        return;
      }

      const byName: Record<string, any> = {};
      (masterData || []).forEach((m) => {
        byName[m.name_en] = m;
      });

      const csvRows: string[] = [];
      // Escaping CSV values
      const csvEsc = (v: any) => {
        if (v === null || v === undefined || v === "") return "";
        const s = String(v);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      };

      // Header row
      csvRows.push(BULK_HEADERS.map(csvEsc).join(","));

      let matchedCount = 0;
      listToExport.forEach((s) => {
        const m = byName[s.name_en];
        const isIOSVariant = !!s.is_ios;

        // Skip unmatched Android items to maintain file integrity
        if (!isIOSVariant && !m) return;
        matchedCount++;

        const bc = isIOSVariant ? s.barcode || "" : m?.barcode || s.barcode || "";
        const sku = s.seller_sku && s.seller_sku.trim() ? s.seller_sku.trim() : bc;

        const rowArr = new Array(75).fill("");

        if (isIOSVariant) {
          rowArr[0] = s.name_en || "";
          rowArr[1] = s.name_ar || "";
          rowArr[3] = s.desc_en || "";
          rowArr[4] = s.desc_ar || "";
          rowArr[6] = sku;
          rowArr[7] = sku;
          rowArr[8] = "Apple";
          rowArr[9] = "1002314 - Phones & Tablets / Mobile Phones / Smartphones / iOS Phones";
          rowArr[10] = bc;
          rowArr[15] = 0; // Default stock
          rowArr[16] = "..."; // Variation
          rowArr[21] = s.color || "";
          rowArr[42] = s.model_family || "";
          rowArr[52] = s.warranty || "";
          rowArr[54] = s.country || "";
          rowArr[58] = s.highlights_en || "";
          rowArr[59] = s.highlights_ar || "";

          const imgs = [s.image1 || ""];
          for (let k = 0; k < 7; k++) {
            rowArr[67 + k] = (imgs[k] || "").trim();
          }
        } else {
          const nameAR = m.name_ar || "";
          const colorAR = nameAR.indexOf(" - ") > -1 ? nameAR.split(" - ").pop()?.trim() || "" : "";

          rowArr[0] = m.name_en || "";
          rowArr[1] = m.name_ar || "";
          rowArr[3] = m.long_desc_en || "";
          rowArr[4] = m.long_desc_ar || "";
          rowArr[6] = sku;
          rowArr[7] = sku;
          rowArr[8] = m.brand || "";
          rowArr[9] = "1002300 - Phones & Tablets / Mobile Phones / Smartphones / Android Phones";
          rowArr[10] = bc;
          rowArr[15] = 0;
          rowArr[16] = "...";
          rowArr[21] = m.color || "";
          rowArr[22] = colorAR;
          rowArr[42] = m.model_family || "";
          rowArr[52] = s.warranty || "";
          rowArr[54] = s.country || "";
          rowArr[58] = m.highlights_en || "";
          rowArr[59] = m.highlights_ar || "";

          const imgs = [m.image1, m.image2, m.image3, m.image4, m.image5, m.image6, m.image7];
          for (let k = 0; k < 7; k++) {
            rowArr[67 + k] = (imgs[k] || "").trim();
          }
        }

        csvRows.push(rowArr.map(csvEsc).join(","));
      });

      if (matchedCount === 0) {
        alert("None of the submitted models matched our primary catalogs. Export aborted.");
        return;
      }

      // Create download blob
      const blob = new Blob(["\ufeff" + csvRows.join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const filename = filterShopName
        ? `Jumia_BulkSheet_${filterShopName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`
        : `Jumia_BulkSheet_${new Date().toISOString().slice(0, 10)}.csv`;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Failed to build CSV: " + err.message);
    }
  };

  // Group queue by brand then by model family for accordion
  const groupedQueue: Record<string, { count: number; families: Record<string, QueueItem[]> }> = {};
  queue.forEach((item) => {
    if (!groupedQueue[item.brand]) {
      groupedQueue[item.brand] = { count: 0, families: {} };
    }
    groupedQueue[item.brand].count++;
    if (!groupedQueue[item.brand].families[item.family]) {
      groupedQueue[item.brand].families[item.family] = [];
    }
    groupedQueue[item.brand].families[item.family].push(item);
  });

  // Filtered submissions in Admin panel
  const filteredSubmissions = submissions.filter((s) => {
    const q = adminSearch.toLowerCase();
    return (
      s.shop_name?.toLowerCase().includes(q) ||
      s.name_en?.toLowerCase().includes(q) ||
      s.brand?.toLowerCase().includes(q) ||
      s.model_family?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col selection:bg-brand/20 selection:text-slate-900">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center shadow-lg shadow-brand/20">
              <span className="text-white font-black text-lg">★</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tighter text-slate-900 flex items-center">
                JUMIA
              </span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest -mt-1">
                SKU Builder
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("vendor")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "vendor"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Store className="w-3.5 h-3.5 text-brand" />
              <span>Vendor</span>
            </button>
            <button
              onClick={() => setViewMode("admin")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "admin"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {adminAuthenticated ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
              <span>Admin</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === "vendor" ? (
          <div>
            {!shopName ? (
              /* Shop Setup View */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-md mx-auto my-12"
              >
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl relative overflow-hidden bento-card">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand to-brand-dark" />
                  <div className="accent-glow" />
                  
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 text-brand mb-4">
                      <Store className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Enter Your Shop Name</h1>
                    <p className="text-sm text-slate-500 mt-1.5">
                      Provide your exact Shop Name to Start with your Bulk Listings.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (shopNameInput.trim()) setShopName(shopNameInput.trim());
                    }}
                    className="space-y-5"
                  >
                    <div>
                      <input
                        type="text"
                        value={shopNameInput}
                        onChange={(e) => setShopNameInput(e.target.value)}
                        placeholder="Your Shop Name"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand focus:outline-none transition-all text-slate-900 font-medium shadow-sm"
                      />
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mt-3">
                        <p className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                          <AlertTriangle className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                          <span>
                            Copy Your Shop Name Exactly As Written in Your Vendor Center Profile Data..
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!shopNameInput.trim()}
                      className="w-full py-3.5 px-4 bg-brand hover:bg-brand-dark disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md shadow-brand/10 hover:shadow-lg hover:shadow-brand/20 cursor-pointer"
                    >
                      Continue & Setup Workspace
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              /* Core Catalog Creator Workspace */
              <div className="space-y-6">
                {/* User Greeting Hero Banner */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-800 shadow-sm flex flex-col sm:flex-row items-center sm:justify-between gap-6 relative overflow-hidden bento-card"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-brand-dark opacity-80" />
                  {/* Decorative background shapes */}
                  <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute left-1/3 bottom-0 -translate-b-12 w-32 h-32 bg-brand/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl shadow-sm">
                      👋
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                        Hi <span className="underline decoration-brand underline-offset-4">{shopName}</span>,
                      </h2>
                      <p className="text-slate-500 text-sm sm:text-base font-medium mt-1">
                        Let's build and publish your product catalogs to Jumia.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShopName("");
                      setShopNameInput("");
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-all self-stretch sm:self-auto text-center cursor-pointer"
                  >
                    Change Shop Name
                  </button>
                </motion.div>

                {/* STEP 1 CARD: Category, Brand Navigation */}
                <div ref={wizardCardRef} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md relative overflow-hidden bento-card">
                  <div className="accent-glow" />
                  <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand text-white font-bold text-sm">
                        1
                      </span>
                      <h3 className="font-bold text-lg text-slate-800">
                        {path.length === 0
                           ? "Select Main Category"
                           : path.length === 1
                           ? "Select Subcategory"
                           : path.length === 2
                           ? "Select Brand / Option"
                           : "Explore Catalog"}
                      </h3>
                    </div>

                    {path.length > 0 && (
                      <button
                        onClick={handleResetNav}
                        className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        Start From Beginning
                      </button>
                    )}
                  </div>

                  {/* Horizontal Flowcrumb navigation */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center gap-2 overflow-x-auto">
                    <button
                      onClick={handleResetNav}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        path.length === 0 ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Category Catalog</span>
                    </button>

                    {path.map((label, i) => (
                      <React.Fragment key={i}>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <button
                          disabled={i === 2} // Brand level locked from simple click back, use buttons below
                          onClick={() => handleCrumbClick(i + 1)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            i === path.length - 1
                              ? "bg-brand/10 text-brand border border-brand/20 shadow-sm"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          <span>{label}</span>
                          {i !== 2 && (
                            <span className="text-[10px] text-slate-400 hover:text-red-500 transition-colors ml-1">
                              ✕
                            </span>
                          )}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Dynamic choices list */}
                  <div className="mt-6">
                    {nodeAt(path) ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.keys(nodeAt(path) || {}).map((label) => {
                          const item = (nodeAt(path) as Record<string, any>)[label];
                          const isActive = path.length === 0 ? true : !!item.active;

                          return (
                            <button
                              key={label}
                              disabled={!isActive}
                              onClick={() => {
                                setPath([...path, label]);
                              }}
                              className={`p-4 rounded-xl border text-left transition-all ${
                                isActive
                                  ? "bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-brand text-slate-700 hover:text-slate-900 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer"
                                  : "bg-slate-50/40 border-slate-200/50 text-slate-400 cursor-not-allowed"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {path.length === 0 && (
                                  <span className="p-2 rounded-lg bg-slate-100 text-brand">
                                    {label === "Phones" ? (
                                      <Smartphone className="w-4 h-4" />
                                    ) : label === "Tablets" ? (
                                      <Tablet className="w-4 h-4" />
                                    ) : (
                                      <Layers className="w-4 h-4" />
                                    )}
                                  </span>
                                )}
                                <div>
                                  <div className="font-bold text-sm tracking-tight">{label}</div>
                                  {!isActive && <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Soon</span>}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* Deepest Level Category Reached */
                      <div>
                        {path[0] === "Phones" && path[1] === "Android" && path.length === 2 && (
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 border-l-2 border-brand/50">Select Brand</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {brands.map((br) => (
                                <button
                                  key={br}
                                  onClick={() => {
                                    setPath([...path, br]);
                                    setTimeout(() => {
                                      familyCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }, 100);
                                  }}
                                  className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-brand rounded-xl text-center font-bold text-sm text-slate-700 hover:text-slate-900 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
                                >
                                  {br}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {(path.length >= 3 || (path[0] === "Phones" && path[1] === "iOS" && path.length === 2)) && (
                  <motion.div
                    ref={familyCardRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md scroll-mt-20 bento-card relative overflow-hidden"
                  >
                    <div className="accent-glow" />
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand text-white font-bold text-sm">
                          2
                        </span>
                        <h3 className="font-bold text-lg text-slate-800">
                          {selectedFamily ? selectedFamily : `Select Model Family (${currentBrand})`}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedFamily && (
                          <>
                            <button
                              onClick={() => {
                                setFamilySelections({});
                                setCommonCountry("");
                                setCommonWarranty("");
                              }}
                              className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              Clear Selections
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFamily("");
                                setFamilySelections({});
                              }}
                              className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              Choose Other Model
                            </button>
                          </>
                        )}
                        {!selectedFamily && path.length >= 3 && (
                          <button
                            onClick={changeBrand}
                            className="text-xs font-bold text-brand bg-brand-soft border border-brand/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Change Brand
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Catalog Families Grid list */}
                    {!selectedFamily ? (
                      <div>
                        {currentBrand === "Apple" && !iosCatalogLoaded ? (
                          <div className="py-12 text-center text-slate-500 font-medium">
                            <RefreshCw className="w-8 h-8 text-brand animate-spin mx-auto mb-3" />
                            <p>Connecting & downloading latest iPhone catalog...</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {currentBrand === "Apple" ? (
                              /* Group iOS Families by version */
                              <div className="space-y-6">
                                {(Array.from(new Set(activeFamilies.map((f) => {
                                  const m = /iPhone (\d+)/.exec(f);
                                  return m ? m[1] : "Other";
                                }))) as string[])
                                  .sort((a, b) => {
                                    if (a === "Other") return 1;
                                    if (b === "Other") return -1;
                                    return parseInt(b) - parseInt(a);
                                  })
                                  .map((gen) => {
                                    const famList = activeFamilies.filter((f) => {
                                      const m = /iPhone (\d+)/.exec(f);
                                      return m ? m[1] === gen : gen === "Other";
                                    });

                                    return (
                                      <div key={gen} className="space-y-2">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 border-l-2 border-brand/50">
                                          iPhone {gen} Series
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                          {famList.map((f) => (
                                            <button
                                              key={f}
                                              onClick={() => {
                                                setSelectedFamily(f);
                                                setFamilySelections({});
                                              }}
                                              className="p-3 bg-slate-50 hover:bg-brand/10 border border-slate-200 hover:border-brand text-slate-700 hover:text-slate-950 font-semibold text-xs sm:text-sm rounded-xl text-center transition-all shadow-sm cursor-pointer"
                                            >
                                              {f}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            ) : (
                              /* Standard Android Grid list */
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {activeFamilies.map((f) => (
                                  <button
                                    key={f}
                                    onClick={() => {
                                      setSelectedFamily(f);
                                      setFamilySelections({});
                                    }}
                                    className="p-3 bg-slate-50 hover:bg-brand/10 border border-slate-200 hover:border-brand text-slate-700 hover:text-slate-950 font-semibold text-xs sm:text-sm rounded-xl text-center transition-all shadow-sm cursor-pointer"
                                  >
                                    {f}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Deep Variant Form Configurer */
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {Object.entries(activeFamilyDetails).map(([color, detail]) => {
                            const colDetail = detail as ColorDetail;
                            const colorThumbnail = fThumb(colDetail.img);
                            
                            return (
                              <div key={color} className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                                <div className="space-y-4">
                                  {/* Color image */}
                                  <div className="relative aspect-video rounded-xl border border-slate-200 overflow-hidden bg-white flex items-center justify-center p-2 group">
                                    <img
                                      src={colorThumbnail}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = colDetail.img;
                                      }}
                                      alt={`${selectedFamily} ${color}`}
                                      className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                      referrerPolicy="no-referrer"
                                      loading="lazy"
                                      decoding="async"
                                      id={`img-${selectedFamily}-${color}`}
                                    />
                                    <div className="absolute bottom-2 right-2 px-2.5 py-0.5 bg-slate-200/90 border border-slate-300/30 rounded-full text-[10px] font-bold text-slate-700 uppercase tracking-wider backdrop-blur-sm pointer-events-none">
                                      {color}
                                    </div>
                                  </div>

                                  {/* Storage toggle buttons list */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                                        Storages
                                      </span>
                                      
                                      <button
                                        onClick={() => {
                                          const keysToSelect = colDetail.variants.map(v => isIOS ? `${selectedFamily}|${color}|${v.s}` : v.name);
                                          const allSelected = keysToSelect.every(k => !!familySelections[k]);

                                          setFamilySelections(prev => {
                                            const updated = { ...prev };
                                            keysToSelect.forEach(k => {
                                              if (allSelected) {
                                                delete updated[k];
                                              } else {
                                                updated[k] = isIOS
                                                  ? { sim: "", facetime: "", region: "", country: "", warranty: "", barcode: "", sku: "" }
                                                  : { sim: "", facetime: "", region: "", country: "", warranty: "", barcode: "", sku: "" };
                                              }
                                            });
                                            return updated;
                                          });
                                        }}
                                        className="text-[10px] font-extrabold text-brand hover:text-brand-dark hover:underline uppercase tracking-wide cursor-pointer"
                                      >
                                        Select All
                                      </button>
                                    </div>

                                    <div className="space-y-1.5">
                                      {colDetail.variants.map((v) => {
                                        const key = isIOS ? `${selectedFamily}|${color}|${v.s}` : v.name;
                                        const isAlreadyAdded = isIOS ? inQueueIOS(selectedFamily, color, v.s) : inQueue(key);
                                        const isSelected = !!familySelections[key];

                                        return (
                                          <div key={v.s} className="space-y-2">
                                            <button
                                              disabled={isAlreadyAdded}
                                              id={`btn-${key}`}
                                              onClick={() => {
                                                setFamilySelections((prev) => {
                                                  const copy = { ...prev };
                                                  if (copy[key]) {
                                                    delete copy[key];
                                                  } else {
                                                    copy[key] = {
                                                      sim: "",
                                                      facetime: "",
                                                      region: "",
                                                      country: "",
                                                      warranty: "",
                                                      barcode: "",
                                                      sku: ""
                                                    };
                                                  }
                                                  return copy;
                                                });
                                              }}
                                              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                                                isAlreadyAdded
                                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 cursor-not-allowed"
                                                  : isSelected
                                                  ? "bg-brand/10 border-brand text-brand-dark shadow-sm cursor-pointer"
                                                  : "bg-slate-50 border-slate-200 text-slate-700 hover:border-brand hover:bg-slate-100 cursor-pointer"
                                              }`}
                                            >
                                              <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                                  isAlreadyAdded
                                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                                    : isSelected
                                                    ? "bg-brand border-brand text-white"
                                                    : "border-slate-300 bg-white"
                                                }`}>
                                                  {(isSelected || isAlreadyAdded) && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                                <span>{v.s}</span>
                                              </div>
                                              
                                              {isAlreadyAdded && (
                                                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md">
                                                  In Queue
                                                </span>
                                              )}
                                            </button>

                                            {/* Subfields dropdown expansion */}
                                            {isSelected && !isAlreadyAdded && (
                                              <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="bg-white border border-slate-200 rounded-xl p-3 space-y-3 shadow-inner text-xs"
                                              >
                                                {isIOS ? (
                                                  <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-2">
                                                      <div>
                                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                          SIM Type *
                                                        </label>
                                                        <select
                                                          value={familySelections[key].sim}
                                                          onChange={(e) => {
                                                            const val = e.target.value;
                                                            setFamilySelections((prev) => ({
                                                              ...prev,
                                                              [key]: { ...prev[key], sim: val, facetime: "", region: "" }
                                                            }));
                                                          }}
                                                          className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-brand text-slate-800 ${
                                                            familySelections[key].sim ? "border-emerald-500/50 focus:border-emerald-500" : "border-rose-400/40 focus:border-rose-400"
                                                          }`}
                                                        >
                                                          <option value="" className="bg-white">Select...</option>
                                                          {SIM_LIST.map((sim) => (
                                                            <option key={sim} value={sim} className="bg-white">
                                                              {sim}
                                                            </option>
                                                          ))}
                                                        </select>
                                                      </div>

                                                      <div>
                                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                          FaceTime *
                                                        </label>
                                                        <select
                                                          disabled={!familySelections[key].sim}
                                                          value={familySelections[key].facetime}
                                                          onChange={(e) => {
                                                            const val = e.target.value;
                                                            setFamilySelections((prev) => ({
                                                              ...prev,
                                                              [key]: { ...prev[key], facetime: val, region: "" }
                                                            }));
                                                          }}
                                                          className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-brand text-slate-800 ${
                                                            familySelections[key].facetime ? "border-emerald-500/50 focus:border-emerald-500" : "border-rose-400/40 focus:border-rose-400"
                                                          }`}
                                                        >
                                                          <option value="" className="bg-white">Select...</option>
                                                          <option value="FaceTime Supported" className="bg-white">Yes (Supported)</option>
                                                          <option value="FaceTime Not Supported" className="bg-white">No (Not Supported)</option>
                                                        </select>
                                                      </div>
                                                    </div>

                                                    <div>
                                                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                        Region / Version *
                                                      </label>
                                                      <select
                                                        disabled={!familySelections[key].facetime}
                                                        value={familySelections[key].region}
                                                        onChange={(e) => {
                                                          const val = e.target.value;
                                                          setFamilySelections((prev) => ({
                                                            ...prev,
                                                            [key]: { ...prev[key], region: val }
                                                          }));
                                                        }}
                                                        className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-brand text-slate-800 ${
                                                          familySelections[key].region ? "border-emerald-500/50 focus:border-emerald-500" : "border-rose-400/40 focus:border-rose-400"
                                                        }`}
                                                      >
                                                        <option value="" className="bg-white">Select...</option>
                                                        {REGIONS.map((reg) => (
                                                          <option key={reg} value={reg} className="bg-white">
                                                            {reg} Version
                                                          </option>
                                                        ))}
                                                      </select>
                                                    </div>

                                                    {familySelections[key].region && (
                                                      <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="space-y-3 pt-2 border-t border-slate-100"
                                                      >
                                                        <div className="grid grid-cols-2 gap-2">
                                                          <div>
                                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                              Country *
                                                            </label>
                                                            <select
                                                              value={familySelections[key].country}
                                                              onChange={(e) => {
                                                                const val = e.target.value;
                                                                setFamilySelections((prev) => ({
                                                                  ...prev,
                                                                  [key]: { ...prev[key], country: val }
                                                                }));
                                                              }}
                                                              className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-brand text-slate-800 ${
                                                                familySelections[key].country ? "border-emerald-500/50 focus:border-emerald-500" : "border-rose-400/40 focus:border-rose-400"
                                                              }`}
                                                            >
                                                              <option value="" className="bg-white">Select...</option>
                                                              <option value="Egypt" className="bg-white">Egypt</option>
                                                              <option value="China" className="bg-white">China</option>
                                                              <option value="China, Egypt" className="bg-white">China, Egypt</option>
                                                              <option value="Vietnam" className="bg-white">Vietnam</option>
                                                            </select>
                                                          </div>

                                                          <div>
                                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                              Warranty *
                                                            </label>
                                                            <select
                                                              value={familySelections[key].warranty}
                                                              onChange={(e) => {
                                                                const val = e.target.value;
                                                                setFamilySelections((prev) => ({
                                                                  ...prev,
                                                                  [key]: { ...prev[key], warranty: val }
                                                                }));
                                                              }}
                                                              className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-brand text-slate-800 ${
                                                                familySelections[key].warranty ? "border-emerald-500/50 focus:border-emerald-500" : "border-rose-400/40 focus:border-rose-400"
                                                              }`}
                                                            >
                                                              <option value="" className="bg-white">Select...</option>
                                                              <option value="No Warranty" className="bg-white">No Warranty</option>
                                                              <option value="1 Year" className="bg-white">1 Year</option>
                                                              <option value="18 Months" className="bg-white">18 Months</option>
                                                            </select>
                                                          </div>
                                                        </div>

                                                        <div>
                                                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                            Barcode *
                                                          </label>
                                                          <input
                                                            type="text"
                                                            value={familySelections[key].barcode}
                                                            onChange={(e) => {
                                                              const val = e.target.value;
                                                              setFamilySelections((prev) => ({
                                                                ...prev,
                                                                [key]: { ...prev[key], barcode: val }
                                                              }));
                                                            }}
                                                            placeholder="Enter variant barcode"
                                                            className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-brand text-slate-800 placeholder-slate-400 ${
                                                              familySelections[key].barcode.trim() ? "border-emerald-500/50 focus:border-emerald-500" : "border-rose-400/40 focus:border-rose-400"
                                                            }`}
                                                          />
                                                        </div>

                                                        <div>
                                                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                            Seller SKU (Optional)
                                                          </label>
                                                          <input
                                                            type="text"
                                                            value={familySelections[key].sku}
                                                            onChange={(e) => {
                                                              const val = e.target.value;
                                                              setFamilySelections((prev) => ({
                                                                ...prev,
                                                                [key]: { ...prev[key], sku: val }
                                                              }));
                                                            }}
                                                            placeholder="Custom seller SKU code"
                                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand text-slate-800 placeholder-slate-400"
                                                          />
                                                        </div>
                                                      </motion.div>
                                                    )}
                                                  </div>
                                                ) : (
                                                  /* Standard Android dynamic subfields */
                                                  <div className="space-y-2">
                                                    {!v.bc && (
                                                      <div>
                                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                          Barcode Required *
                                                        </label>
                                                        <input
                                                          type="text"
                                                          value={familySelections[key].barcode}
                                                          onChange={(e) => {
                                                            const val = e.target.value;
                                                            setFamilySelections((prev) => ({
                                                              ...prev,
                                                              [key]: { ...prev[key], barcode: val }
                                                            }));
                                                          }}
                                                          placeholder="Enter barcode"
                                                          className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-brand text-slate-800 placeholder-slate-400 ${
                                                            familySelections[key].barcode.trim() ? "border-emerald-500/50" : "border-rose-400/40"
                                                          }`}
                                                        />
                                                      </div>
                                                    )}
                                                    <div>
                                                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                        Seller SKU (Optional)
                                                      </label>
                                                      <input
                                                        type="text"
                                                        value={familySelections[key].sku}
                                                        onChange={(e) => {
                                                          const val = e.target.value;
                                                          setFamilySelections((prev) => ({
                                                            ...prev,
                                                            [key]: { ...prev[key], sku: val }
                                                          }));
                                                        }}
                                                        placeholder="Custom SKU"
                                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand text-slate-800 placeholder-slate-400"
                                                      />
                                                    </div>
                                                  </div>
                                                )}
                                              </motion.div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Batch country & warranty details for Android (applies to all items ticked) */}
                        {!isIOS && (
                          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                              <Info className="w-4 h-4 text-brand" />
                              <span>Production Batch Details</span>
                            </h4>
                            <p className="text-xs text-slate-500">
                              These variables are applied automatically to all ticked Android model variations.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1.5">
                                <label className="block font-bold text-slate-600 uppercase">
                                  Production Country *
                                </label>
                                <select
                                  value={commonCountry}
                                  onChange={(e) => setCommonCountry(e.target.value)}
                                  className={`w-full p-3 bg-white border rounded-xl focus:outline-none focus:border-brand text-slate-800 ${
                                    commonCountry ? "border-emerald-500/50 focus:border-emerald-500" : "border-rose-400/40 focus:border-rose-400"
                                  }`}
                                >
                                  <option value="" className="bg-white">Choose production country...</option>
                                  <option value="Egypt" className="bg-white">Egypt</option>
                                  <option value="China" className="bg-white">China</option>
                                  <option value="China, Egypt" className="bg-white">China, Egypt</option>
                                  <option value="Vietnam" className="bg-white">Vietnam</option>
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <label className="block font-bold text-slate-600 uppercase">
                                  Warranty Period *
                                </label>
                                <select
                                  value={commonWarranty}
                                  onChange={(e) => setCommonWarranty(e.target.value)}
                                  className={`w-full p-3 bg-white border rounded-xl focus:outline-none focus:border-brand text-slate-800 ${
                                    commonWarranty ? "border-emerald-500/50 focus:border-emerald-500" : "border-rose-400/40 focus:border-rose-400"
                                  }`}
                                >
                                  <option value="" className="bg-white">Choose warranty period...</option>
                                  <option value="No Warranty" className="bg-white">No Warranty</option>
                                  <option value="1 Year" className="bg-white">1 Year</option>
                                  <option value="18 Months" className="bg-white">18 Months</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Wizard Form Submissions Bar */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                          <button
                            onClick={() => setSelectedFamily("")}
                            className="px-5 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                          >
                            Cancel Selection
                          </button>
                          
                          <button
                            onClick={handleAddToQueue}
                            disabled={!isFormReadyToSubmit() || isDoneLoading}
                            id="btn-add-to-queue"
                            className={`px-6 py-3 text-sm font-bold text-white rounded-xl transition-all shadow-md flex items-center gap-2 ${
                              isFormReadyToSubmit() && !isDoneLoading
                                ? "bg-brand hover:bg-brand-dark hover:-translate-y-0.5 cursor-pointer"
                                : "bg-slate-200 text-slate-400 border border-slate-300/60 cursor-not-allowed"
                            }`}
                          >
                            {isDoneLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Generating Descriptions...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Done! Add to Queue ({Object.keys(familySelections).length})</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 3 CARD: Active Local Submissions Queue */}
                {queue.length > 0 && (
                  <div ref={queueCardRef} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md">
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4 mb-4">
                      <div
                        onClick={() => setQueueOpen(!queueOpen)}
                        className="flex items-center gap-3 cursor-pointer select-none group"
                      >
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand text-white font-bold text-sm shadow-[0_0_12px_rgba(139,92,246,0.3)]">
                          3
                        </span>
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-brand transition-colors">
                          Your Active Queue
                        </h3>
                        <span className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-bold">
                          {queue.length} {queue.length === 1 ? "item" : "items"}
                        </span>
                        {queueOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (!clearQueueArmed) {
                              setClearQueueArmed(true);
                              setTimeout(() => setClearQueueArmed(false), 3000);
                            } else {
                              setQueue([]);
                              setClearQueueArmed(false);
                            }
                          }}
                          className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-400 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          {clearQueueArmed ? "Confirm Clear Queue" : "Clear All Items"}
                        </button>

                        <button
                          onClick={handleSubmitQueue}
                          disabled={submitLoading}
                          className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-100 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                        >
                          {submitLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileSpreadsheet className="w-4 h-4" />
                          )}
                          <span>Submit Your Request</span>
                        </button>
                      </div>
                    </div>

                    {/* Accordion List Content */}
                    <AnimatePresence>
                      {queueOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          {Object.entries(groupedQueue).map(([brand, bData]) => {
                            const isBrandOpen = qOpenBrand[brand] === true;

                            return (
                              <div
                                key={brand}
                                className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                                  isBrandOpen
                                    ? "border-brand/40 ring-1 ring-brand/10 shadow-md bg-white"
                                    : "border-slate-200 shadow-sm bg-slate-50/50 hover:border-slate-300"
                                }`}
                              >
                                <div
                                  onClick={() => {
                                    setQOpenBrand((prev) => ({ ...prev, [brand]: !isBrandOpen }));
                                  }}
                                  className={`px-4 py-3 flex items-center justify-between cursor-pointer select-none border-b transition-all duration-300 ${
                                    isBrandOpen
                                      ? "bg-brand/5 border-brand/20"
                                      : "bg-slate-100 border-slate-200 hover:bg-slate-150"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className={`font-bold text-sm transition-colors duration-300 ${isBrandOpen ? "text-brand-dark" : "text-slate-800"}`}>
                                      {brand}
                                    </span>
                                    <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full transition-all duration-300 ${
                                      isBrandOpen
                                        ? "bg-brand/10 border-brand/30 text-brand-dark shadow-[0_1px_2px_rgba(246,139,30,0.1)]"
                                        : "bg-slate-200 border-slate-300 text-slate-700"
                                    }`}>
                                      {bData.count} {bData.count === 1 ? "version" : "versions"}
                                    </span>
                                  </div>
                                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                                    isBrandOpen ? "rotate-180 text-brand" : "text-slate-500"
                                  }`} />
                                </div>

                                <AnimatePresence initial={false}>
                                  {isBrandOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25, ease: "easeInOut" }}
                                      className="divide-y divide-slate-150 overflow-hidden"
                                    >
                                      {Object.entries(bData.families).map(([fam, items]) => {
                                        const isFamOpen = qOpenFam[`${brand}|${fam}`] === true;

                                        return (
                                          <div key={fam} className="bg-transparent">
                                            <div
                                              onClick={() => {
                                                setQOpenFam((prev) => ({ ...prev, [`${brand}|${fam}`]: !isFamOpen }));
                                              }}
                                              className={`px-6 py-2.5 flex items-center justify-between cursor-pointer select-none transition-all duration-300 border-l-2 ${
                                                isFamOpen
                                                  ? "bg-slate-50/80 border-l-brand text-slate-900 border-b border-b-slate-100/50"
                                                  : "bg-transparent border-l-transparent text-slate-600 hover:bg-slate-100/40"
                                              }`}
                                            >
                                              <span className={`font-semibold text-xs transition-colors duration-300 ${isFamOpen ? "text-brand-dark font-bold" : "text-slate-700"}`}>
                                                {fam}
                                              </span>
                                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${
                                                isFamOpen ? "rotate-180 text-brand" : "text-slate-450"
                                              }`} />
                                            </div>

                                            <AnimatePresence initial={false}>
                                              {isFamOpen && (
                                                <motion.div
                                                  initial={{ height: 0, opacity: 0 }}
                                                  animate={{ height: "auto", opacity: 1 }}
                                                  exit={{ height: 0, opacity: 0 }}
                                                  transition={{ duration: 0.25, ease: "easeInOut" }}
                                                  className="px-6 py-3 space-y-2.5 bg-slate-50/20 border-b border-slate-100 last:border-b-0 overflow-hidden"
                                                >
                                                  {items.map((item, localIdx) => {
                                                    // Find actual master index in full queue array
                                                    const globalIdx = queue.findIndex(
                                                      (q) =>
                                                        q.name === item.name &&
                                                        q.brand === item.brand &&
                                                        q.family === item.family &&
                                                        q.color === item.color &&
                                                        q.storage === item.storage
                                                    );

                                                    return (
                                                      <div
                                                        key={localIdx}
                                                        className="flex items-center justify-between p-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-colors group text-xs shadow-sm hover:shadow-md"
                                                      >
                                                        <div className="flex items-center gap-3">
                                                          <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center p-1">
                                                            <img
                                                              src={fThumb(item.img)}
                                                              onError={(e) => {
                                                                (e.target as HTMLImageElement).src = item.img;
                                                              }}
                                                              className="max-h-full object-contain"
                                                              alt=""
                                                              loading="lazy"
                                                              decoding="async"
                                                              referrerPolicy="no-referrer"
                                                            />
                                                          </div>
                                                          <div>
                                                            <div className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                                                              <span>
                                                                {item.color} · {item.storage}
                                                              </span>
                                                              {item.isIOS && (
                                                                <span className="text-[9px] uppercase font-bold tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-1 rounded">
                                                                  {item.sim} · {item.region}
                                                                </span>
                                                              )}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                                                              <span>Barcode: <strong className="text-slate-700">{item.barcode}</strong></span>
                                                              {item.sku && (
                                                                <span>SKU: <strong className="text-slate-700">{item.sku}</strong></span>
                                                              )}
                                                              <span>Origin: <strong className="text-slate-700">{item.country}</strong></span>
                                                              <span>Warranty: <strong className="text-slate-700">{item.warranty}</strong></span>
                                                            </div>
                                                          </div>
                                                        </div>

                                                        <button
                                                          onClick={() => {
                                                            if (globalIdx > -1) {
                                                              setQueue((prev) => prev.filter((_, idx) => idx !== globalIdx));
                                                            }
                                                          }}
                                                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer"
                                                        >
                                                          <Trash className="w-4 h-4" />
                                                        </button>
                                                      </div>
                                                    );
                                                  })}
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </div>
                                        );
                                      })}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Admin Dashboard Panel */
          <div>
            {!adminAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto my-12"
              >
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-brand" />

                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-soft text-brand-dark mb-4">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin Authentication</h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Enter security password code credentials to access database logs.
                    </p>
                  </div>

                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                      <input
                        type="password"
                        placeholder="Security Password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-brand focus:outline-none transition-all text-center text-lg font-bold shadow-inner"
                      />
                      {adminPasswordError && (
                        <p className="text-xs text-red-500 font-bold mt-2 text-center">
                          Incorrect password. Try again.
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl transition-all shadow-md"
                    >
                      Unlock Dashboard
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              /* Auth Approved Dashboard view */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Submissions Dashboard</h2>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      <span>Live submissions records connection active.</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <button
                      onClick={loadAdminSubmissions}
                      disabled={adminLoading}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-600 transition-all"
                      title="Reload submissions list"
                    >
                      <RefreshCw className={`w-4 h-4 ${adminLoading ? "animate-spin" : ""}`} />
                    </button>

                    <button
                      onClick={handleAdminClearAll}
                      className="px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs sm:text-sm rounded-xl transition-all"
                    >
                      {clearSubsArmed ? "Tap again to DELETE ALL" : "Clear All Submissions"}
                    </button>
                  </div>
                </div>

                {/* Counter Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      Total Submission Lines
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 mt-1">
                      {submissions.length}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      Unique active Shops
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 mt-1">
                      {new Set(submissions.map((s) => s.shop_name)).size}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      Unique active Brands
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 mt-1">
                      {new Set(submissions.map((s) => s.brand)).size}
                    </div>
                  </div>
                </div>

                {/* Submissions Log Dashboard */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  {/* Search bar header */}
                  <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:max-w-xs">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="Search submissions log..."
                        className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2 text-xs rounded-lg focus:outline-none focus:border-brand"
                      />
                    </div>

                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Showing {filteredSubmissions.length} of {submissions.length} lines
                    </span>
                  </div>

                  {adminLoading ? (
                    <div className="py-24 text-center text-slate-400 text-xs">
                      <RefreshCw className="w-8 h-8 text-brand animate-spin mx-auto mb-2" />
                      <p>Loading database records...</p>
                    </div>
                  ) : filteredSubmissions.length === 0 ? (
                    <div className="py-24 text-center">
                      <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h4 className="font-bold text-slate-800">No matching submissions</h4>
                      <p className="text-slate-400 text-xs mt-1">Please try modifying your filter or publish a queue.</p>
                    </div>
                  ) : (() => {
                    // Group filtered submissions by Vendor, then by Brand, then by Model Family
                    const groupedSubmissions: Record<string, {
                      count: number;
                      brands: Record<string, {
                        count: number;
                        families: Record<string, Submission[]>
                      }>
                    }> = {};

                    filteredSubmissions.forEach((s) => {
                      const shop = s.shop_name || "Unknown Shop";
                      if (!groupedSubmissions[shop]) {
                        groupedSubmissions[shop] = { count: 0, brands: {} };
                      }
                      groupedSubmissions[shop].count++;

                      const brand = s.brand || "Other";
                      if (!groupedSubmissions[shop].brands[brand]) {
                        groupedSubmissions[shop].brands[brand] = { count: 0, families: {} };
                      }
                      groupedSubmissions[shop].brands[brand].count++;

                      const fam = s.model_family || "Other Family";
                      if (!groupedSubmissions[shop].brands[brand].families[fam]) {
                        groupedSubmissions[shop].brands[brand].families[fam] = [];
                      }
                      groupedSubmissions[shop].brands[brand].families[fam].push(s);
                    });

                    return (
                      <div className="p-4 space-y-4">
                        {Object.entries(groupedSubmissions).map(([shop, shopData]) => {
                          const isVendorOpen = !!adminOpenVendors[shop];
                          return (
                            <div
                              key={shop}
                              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                                isVendorOpen
                                  ? "border-brand/40 ring-1 ring-brand/10 shadow-md bg-white"
                                  : "border-slate-200 shadow-sm bg-slate-50/30 hover:border-slate-300 hover:bg-white"
                              }`}
                            >
                              {/* Vendor Header Row */}
                              <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                                <div
                                  onClick={() => {
                                    setAdminOpenVendors(prev => ({ ...prev, [shop]: !isVendorOpen }));
                                  }}
                                  className="flex items-center gap-3 cursor-pointer select-none group flex-1"
                                >
                                  <div className="p-2 bg-brand/10 text-brand rounded-xl group-hover:bg-brand group-hover:text-white transition-all">
                                    <Store className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="font-extrabold text-base text-slate-800 group-hover:text-brand transition-colors">
                                      {shop}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      {shopData.count} submitted {shopData.count === 1 ? "variant" : "variants"}
                                    </p>
                                  </div>
                                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ml-2 ${
                                    isVendorOpen ? "rotate-180 text-brand" : ""
                                  }`} />
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleDownloadCsv(shop)}
                                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-400 text-emerald-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                                    title={`Download CSV template for ${shop}`}
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Download CSV</span>
                                  </button>
                                </div>
                              </div>

                              {/* Vendor Body - Brands list */}
                              <AnimatePresence initial={false}>
                                {isVendorOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                    className="border-t border-slate-100 bg-slate-50/10 p-4 space-y-3 overflow-hidden"
                                  >
                                    {Object.entries(shopData.brands).map(([brand, bData]) => {
                                      const brandKey = `${shop}|${brand}`;
                                      const isBrandOpen = adminOpenBrands[brandKey] === true;

                                      return (
                                        <div
                                          key={brand}
                                          className={`border rounded-xl overflow-hidden transition-all duration-300 bg-white ${
                                            isBrandOpen
                                              ? "border-brand/20 ring-1 ring-brand/5 shadow-sm"
                                              : "border-slate-200 shadow-sm hover:border-slate-300"
                                          }`}
                                        >
                                          {/* Brand Accordion Header */}
                                          <div
                                            onClick={() => {
                                              setAdminOpenBrands(prev => ({ ...prev, [brandKey]: !isBrandOpen }));
                                            }}
                                            className={`px-4 py-3 flex items-center justify-between cursor-pointer select-none border-b transition-all duration-300 ${
                                              isBrandOpen ? "bg-brand/5 border-brand/10" : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                                            }`}
                                          >
                                            <div className="flex items-center gap-2.5">
                                              <span className={`font-bold text-sm transition-colors duration-300 ${isBrandOpen ? "text-brand-dark" : "text-slate-800"}`}>
                                                {brand}
                                              </span>
                                              <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full transition-all duration-300 ${
                                                isBrandOpen
                                                  ? "bg-brand/10 border-brand/30 text-brand-dark"
                                                  : "bg-slate-200 border-slate-300 text-slate-700"
                                              }`}>
                                                {bData.count} {bData.count === 1 ? "version" : "versions"}
                                              </span>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                                              isBrandOpen ? "rotate-180 text-brand" : "text-slate-500"
                                            }`} />
                                          </div>

                                          {/* Brand Body - Families List */}
                                          <AnimatePresence initial={false}>
                                            {isBrandOpen && (
                                              <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                                className="divide-y divide-slate-150 overflow-hidden"
                                              >
                                                {Object.entries(bData.families).map(([fam, items]) => {
                                                  const famKey = `${shop}|${brand}|${fam}`;
                                                  const isFamOpen = adminOpenFamilies[famKey] === true;

                                                  return (
                                                    <div key={fam} className="bg-transparent">
                                                      <div
                                                        onClick={() => {
                                                          setAdminOpenFamilies(prev => ({ ...prev, [famKey]: !isFamOpen }));
                                                        }}
                                                        className={`px-6 py-2.5 flex items-center justify-between cursor-pointer select-none transition-all duration-300 border-l-2 ${
                                                          isFamOpen
                                                            ? "bg-slate-50 border-l-brand text-slate-950 border-b border-b-slate-100"
                                                            : "bg-transparent border-l-transparent text-slate-700 hover:bg-slate-50/50"
                                                        }`}
                                                      >
                                                        <span className={`font-semibold text-xs ${isFamOpen ? "text-brand-dark font-bold" : "text-slate-700"}`}>
                                                          {fam}
                                                        </span>
                                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${
                                                          isFamOpen ? "rotate-180 text-brand" : "text-slate-500"
                                                        }`} />
                                                      </div>

                                                      {/* Families Body - Individual Items list */}
                                                      <AnimatePresence initial={false}>
                                                        {isFamOpen && (
                                                          <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                                            className="px-6 py-3 space-y-2.5 bg-slate-50/20 border-b border-slate-100 last:border-b-0 overflow-hidden"
                                                          >
                                                            {items.map((item) => (
                                                              <div
                                                                key={item.id}
                                                                className="flex items-center justify-between p-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-colors group text-xs shadow-sm"
                                                              >
                                                                <div className="flex items-center gap-3">
                                                                  {item.is_ios && item.image1 ? (
                                                                    <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center p-1 flex-shrink-0">
                                                                      <img
                                                                        src={fThumb(item.image1)}
                                                                        onError={(e) => {
                                                                          (e.target as HTMLImageElement).src = item.image1;
                                                                        }}
                                                                        className="max-h-full object-contain"
                                                                        alt=""
                                                                        loading="lazy"
                                                                        decoding="async"
                                                                        referrerPolicy="no-referrer"
                                                                      />
                                                                    </div>
                                                                  ) : (
                                                                    <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 font-extrabold flex-shrink-0 text-[10px]">
                                                                      {brand[0] || "?"}
                                                                    </div>
                                                                  )}
                                                                  <div>
                                                                    <div className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                                                                      <span>{item.name_en}</span>
                                                                      {item.is_ios && (
                                                                        <span className="text-[9px] uppercase font-bold tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-1 rounded">
                                                                          iOS
                                                                        </span>
                                                                      )}
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                                                                      <span>Barcode: <strong className="text-slate-700 font-mono">{item.barcode || "—"}</strong></span>
                                                                      {item.seller_sku && (
                                                                        <span>SKU: <strong className="text-slate-700 font-mono">{item.seller_sku}</strong></span>
                                                                      )}
                                                                      <span>Origin: <strong className="text-slate-700">{item.country || "—"}</strong></span>
                                                                      <span>Warranty: <strong className="text-slate-700">{item.warranty || "—"}</strong></span>
                                                                    </div>
                                                                  </div>
                                                                </div>

                                                                <button
                                                                  onClick={() => handleAdminDelete(item.id)}
                                                                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-650 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer flex-shrink-0"
                                                                  title="Delete Submission Line"
                                                                >
                                                                  <Trash className="w-4 h-4" />
                                                                </button>
                                                              </div>
                                                            ))}
                                                          </motion.div>
                                                        )}
                                                      </AnimatePresence>
                                                    </div>
                                                  );
                                                })}
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modern Feedback Floating Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
animate={{ opacity: 1, y: 0, x: "-50%" }}
exit={{ opacity: 0, y: 20, x: "-50%" }}
className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-2 max-w-md w-[calc(100%-2rem)]"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="flex-1">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );

  function changeBrand() {
    setSelectedFamily("");
    setFamilySelections({});
    setCommonCountry("");
    setCommonWarranty("");
    if (path.length >= 3) {
      setPath(path.slice(0, 2));
    }
    setTimeout(() => {
      wizardCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }
}