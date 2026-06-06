// Hand-curated theme catalog · Stage-1 MVP (per the build context doc).
// 12 themes (6 IDX, 6 US) with seedwords + constituents + tiers.
// Tier convention (matches MSCI ≥50% pure-play, Bloomberg ≥50% Tier 1):
//   Core         ≥ 50% revenue/business tied to theme
//   Significant  20-50%
//   Peripheral   < 20%   (still eligible; eligibility floor 20% by default)
// All membership labelled `analyst-tagged` for honesty until EDGAR text +
// XBRL revenue-segment parsing comes online (Stage 2).

import type { Theme } from "./types";

export const THEMES: Theme[] = [
  // ─── IDX themes ─────────────────────────────────────────────────
  {
    slug: "idx-nickel-ev-battery",
    name: "Nickel & EV Battery Supply Chain",
    category: "Energy & Materials",
    region: "IDX",
    benchmark: "IHSG TR",
    blurb: "Indonesia's 61% global nickel share + HPAL / battery downstream",
    definition:
      "Indonesia produced 61.3% of global mined nickel in 2024 (NRCan/Statista) and holds ~34% of reserves. The raw-ore export ban forces downstream processing — HPAL, MHP, nickel sulfate — feeding EV-battery cathode supply. The theme captures upstream miners, smelters, integrated MIND ID group entities, and listed beneficiaries of Chinese-financed processing capacity.",
    seedwords: [
      "nickel", "laterite", "HPAL", "high-pressure acid leach", "MHP", "mixed hydroxide precipitate",
      "nickel sulfate", "ferronickel", "NPI", "EV battery", "cathode", "precursor",
      "downstream processing", "smelter", "Morowali", "Weda Bay", "stainless steel",
    ],
    constituents: [
      { ticker: "INCO", region: "IDX", relevancePct: 92, tier: "Core", source: "analyst-tagged", rationale: "PT Vale Indonesia — pure-play nickel matte; FY2025 production 72.0kt." },
      { ticker: "ANTM", region: "IDX", relevancePct: 58, tier: "Core", source: "analyst-tagged", rationale: "Aneka Tambang — nickel + gold + bauxite; nickel ~50% of revenue." },
      { ticker: "HRUM", region: "IDX", relevancePct: 45, tier: "Significant", source: "analyst-tagged", rationale: "Harum Energy — pivoted from coal to nickel via PT Westrong Metal Industry." },
      { ticker: "MBMA", region: "IDX", relevancePct: 88, tier: "Core", source: "analyst-tagged", rationale: "Merdeka Battery Materials — RKEF + HPAL focus." },
      { ticker: "NCKL", region: "IDX", relevancePct: 85, tier: "Core", source: "analyst-tagged", rationale: "Harita Nickel / Trimegah Bangun Persada — HPAL operator (PT Halmahera Persada Lygend)." },
      { ticker: "TINS", region: "IDX", relevancePct: 18, tier: "Peripheral", source: "analyst-tagged", rationale: "PT Timah — tin primary; minor nickel-adjacent exposure via MIND ID." },
    ],
    methodology: {
      scoringFormula: "Revenue share from nickel-ore + smelting + downstream battery materials. Indirect SIC mapping for service providers (discount 0.5×).",
      dataProvenance: "IDX iXBRL segment data + IDX annual-report Business section + IDX corporate-actions disclosures.",
      eligibilityFloorPct: 15,
      weighting: "relevance",
      rebalanceCadence: "Semi-annual review (Apr/Oct); ad-hoc on M&A.",
      lastReview: "2026-05-28",
      limitations: "China controls ~75-80% of IDX processing capacity — country-risk concentration. HPAL projects historically over budget/schedule. Nickel price has been volatile (-30% peak-to-trough in last 12m).",
    },
    citationIds: ["msci-thematic-relevance", "bloomberg-thematic-protocol", "ben-david-franzoni-kim-moussawi-2023"],
    riskNote:
      "Concentrated commodity exposure; Chinese capacity dominance; HPAL execution risk. Nickel price cyclicality has historically punished levered miners disproportionately.",
  },

  {
    slug: "idx-danantara-soe",
    name: "Danantara · SOE Reform",
    category: "Finance & Inclusion",
    region: "IDX",
    benchmark: "IHSG TR",
    blurb: "Indonesia's new sovereign wealth fund consolidates ~US$900-980B of SOE assets",
    definition:
      "BPI Danantara (Daya Anagata Nusantara), launched 24 Feb 2025 under Law No. 1/2025 + Gov't Reg No. 10/2025, consolidates ~US$900-980B of SOE assets under management. Initial 7 SOEs: BMRI, BBRI, BBNI, TLKM, Pertamina, PLN, MIND ID — among the world's largest SWFs. Theme captures listed Danantara-consolidated entities and adjacent SOE beneficiaries.",
    seedwords: [
      "Danantara", "BPI Danantara", "sovereign wealth fund", "SWF",
      "SOE reform", "BUMN", "konsolidasi BUMN", "Holding BUMN",
      "Law No. 1 2025", "MIND ID",
    ],
    constituents: [
      { ticker: "BMRI", region: "IDX", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Bank Mandiri — initial 7 Danantara entities." },
      { ticker: "BBRI", region: "IDX", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Bank Rakyat Indonesia — initial 7 Danantara entities." },
      { ticker: "BBNI", region: "IDX", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Bank Negara Indonesia — initial 7 Danantara entities." },
      { ticker: "TLKM", region: "IDX", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Telkom Indonesia — initial 7 Danantara entities." },
      { ticker: "ANTM", region: "IDX", relevancePct: 60, tier: "Core", source: "analyst-tagged", rationale: "Aneka Tambang — MIND ID group member." },
      { ticker: "PGAS", region: "IDX", relevancePct: 55, tier: "Core", source: "analyst-tagged", rationale: "Perusahaan Gas Negara — Pertamina-group beneficiary." },
      { ticker: "JSMR", region: "IDX", relevancePct: 45, tier: "Significant", source: "analyst-tagged", rationale: "Jasa Marga — toll-road SOE; potential infrastructure-tier rotation." },
      { ticker: "WIKA", region: "IDX", relevancePct: 35, tier: "Significant", source: "analyst-tagged", rationale: "Wijaya Karya — SOE construction; balance-sheet reform candidate." },
    ],
    methodology: {
      scoringFormula: "Direct ownership stake in Danantara-consolidated entity (relevance 95%); subsidiary / group-member (55-60%); SOE peer in rotation universe (30-45%).",
      dataProvenance: "OJK Statistik Pasar Modal + Government Regulation No. 10/2025 + IDX listed-company filings.",
      eligibilityFloorPct: 25,
      weighting: "market-cap",
      rebalanceCadence: "Quarterly + on major Danantara consolidation milestones.",
      lastReview: "2026-05-28",
      limitations:
      "Governance risk: SWF concentration draws comparisons to 1MDB in academic and press coverage. Political-interference risk is non-zero. Realised returns will depend on actual operational reform, not just announcement.",
    },
    citationIds: ["msci-thematic-relevance", "ben-david-franzoni-kim-moussawi-2023", "morningstar-thematic-2022"],
    riskNote:
      "Single-issuer headline risk: any Danantara governance issue affects every constituent simultaneously. 'Reform thesis' often de-rates if execution slips. Compare to MSCI EM SOE basket historicals.",
  },

  {
    slug: "idx-digital-banks",
    name: "Indonesian Digital Banks",
    category: "Finance & Inclusion",
    region: "IDX",
    benchmark: "IHSG TR",
    blurb: "Tech-ecosystem-backed neobanks · Bank Jago / SeaBank / Allo / Krom",
    definition:
      "OJK-licensed digital banks (POJK 12/2021) attached to large tech ecosystems — GoTo (Jago), Sea/Shopee (SeaBank), CT Corp (Allo), Kredivo (Krom), Akulaku (Neo Commerce), Tolaram (Amar). Capture high-deposit-growth, tech-distribution moats, and the secular Indonesia banking-penetration story.",
    seedwords: [
      "bank digital", "neobank", "digital banking", "POJK 12/2021",
      "tabungan digital", "e-wallet bank", "embedded finance", "BaaS",
    ],
    constituents: [
      { ticker: "ARTO", region: "IDX", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Bank Jago — flagship digital bank; GoTo + Jerry Ng ecosystem." },
      { ticker: "BBYB", region: "IDX", relevancePct: 90, tier: "Core", source: "analyst-tagged", rationale: "Bank Neo Commerce — Akulaku-backed; pure digital." },
      { ticker: "BBHI", region: "IDX", relevancePct: 88, tier: "Core", source: "analyst-tagged", rationale: "Allo Bank — CT Corp ecosystem (Trans, Detik, Bukalapak)." },
      { ticker: "AMAR", region: "IDX", relevancePct: 80, tier: "Core", source: "analyst-tagged", rationale: "Bank Amar Indonesia — Tolaram ecosystem; SME + retail digital." },
      { ticker: "BBSI", region: "IDX", relevancePct: 85, tier: "Core", source: "analyst-tagged", rationale: "Krom Bank Indonesia — Kredivo-backed; high deposit-growth." },
    ],
    methodology: {
      scoringFormula: "Direct OJK digital-bank license (90-95%); high-tech-distribution channel share (>50% e-channel deposits ≥80%).",
      dataProvenance: "OJK bank registrations + IDX iXBRL + IDX quarterly financial filings.",
      eligibilityFloorPct: 50,
      weighting: "score-vol",
      rebalanceCadence: "Quarterly post-IDX earnings.",
      lastReview: "2026-05-28",
      limitations:
      "Most names still GAAP-loss-making — earnings depend on parent-ecosystem traffic. Asset quality cycle still unproven. P/BV often >3× — overvaluation risk per Ben-David 2023 thematic-launch finding.",
    },
    citationIds: ["msci-thematic-relevance", "ben-david-franzoni-kim-moussawi-2023"],
    riskNote:
      "Heavy ecosystem dependence; cohort-level CAC volatility; rising rates squeeze NIM unevenly across the cohort.",
  },

  {
    slug: "idx-consumer-staples",
    name: "Indonesian Consumer Demand",
    category: "Consumer & Demographics",
    region: "IDX",
    benchmark: "IHSG TR",
    blurb: "Domestic-consumption-led staples · Indofood / Mayora / Unilever / ICBP",
    definition:
      "Indonesia's 275M population + rising middle class drives the secular consumer-staples story. The theme captures branded packaged-food + HPC + dairy + tobacco names with strong distribution, pricing-power, and IDR-hedged USD-cost exposure.",
    seedwords: [
      "consumer staples", "FMCG", "packaged food", "branded consumer",
      "konsumen Indonesia", "ritel modern", "minuman", "makanan ringan",
    ],
    constituents: [
      { ticker: "INDF", region: "IDX", relevancePct: 90, tier: "Core", source: "analyst-tagged", rationale: "Indofood Sukses Makmur — Indomie + agribusiness; largest staples conglomerate." },
      { ticker: "ICBP", region: "IDX", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Indofood CBP — pure packaged-food (Indomie domestic + global)." },
      { ticker: "UNVR", region: "IDX", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Unilever Indonesia — HPC + branded household; quality compounder." },
      { ticker: "MYOR", region: "IDX", relevancePct: 92, tier: "Core", source: "analyst-tagged", rationale: "Mayora Indah — biscuits, coffee, confectionery; export upside." },
      { ticker: "HMSP", region: "IDX", relevancePct: 88, tier: "Core", source: "analyst-tagged", rationale: "HM Sampoerna — tobacco; staple income via cigarettes." },
      { ticker: "GGRM", region: "IDX", relevancePct: 80, tier: "Core", source: "analyst-tagged", rationale: "Gudang Garam — kretek cigarettes; cigarette-tax cycle exposure." },
    ],
    methodology: {
      scoringFormula: "Branded consumer-staples revenue share ≥70% → Core; mixed-segment with ≥30% staples → Significant.",
      dataProvenance: "IDX iXBRL + IDX annual reports + GICS Consumer Staples cross-map.",
      eligibilityFloorPct: 25,
      weighting: "market-cap",
      rebalanceCadence: "Annual.",
      lastReview: "2026-05-28",
      limitations:
      "Currency translation: USD-denominated COGS (wheat, dairy, palm) vs IDR sales — margin compression in IDR-weak regimes. Excise-tax risk for tobacco names.",
    },
    citationIds: ["novy-marx-2013", "asness-frazzini-pedersen-2019", "msci-thematic-relevance"],
    riskNote:
      "Staples is a quality-compounder cohort — pays a multiple premium; vulnerable to multiple compression when rates rise.",
  },

  {
    slug: "idx-energy-transition",
    name: "Indonesian Energy Transition",
    category: "Energy & Materials",
    region: "IDX",
    benchmark: "IHSG TR",
    blurb: "RUPTL 2025-34 · geothermal · solar · decentralized power",
    definition:
      "RUPTL 2025-34 targets 75 GW of renewables by 2040 (up from ~15 GW), with heavy emphasis on geothermal (Indonesia is #2 globally), solar, and decentralized rural power. The theme captures listed IPPs, geothermal majors, and IDX-listed renewables developers.",
    seedwords: [
      "geothermal", "panas bumi", "renewable energy", "RUPTL", "solar PV",
      "energi terbarukan", "PLTGU", "PLTS", "PLTP", "IPP",
    ],
    constituents: [
      { ticker: "BREN", region: "IDX", relevancePct: 92, tier: "Core", source: "analyst-tagged", rationale: "Barito Renewables — geothermal pure-play (Star Energy)." },
      { ticker: "PGEO", region: "IDX", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Pertamina Geothermal Energy — geothermal pure-play." },
      { ticker: "TBIG", region: "IDX", relevancePct: 35, tier: "Significant", source: "analyst-tagged", rationale: "Tower Bersama — adjacent on rural-grid + telco-infra ramp." },
      { ticker: "PGAS", region: "IDX", relevancePct: 40, tier: "Significant", source: "analyst-tagged", rationale: "Perusahaan Gas Negara — transitional fuel + LNG infrastructure." },
    ],
    methodology: {
      scoringFormula: "Renewables capacity (MW) / total generating capacity. ≥80% renewable = Core.",
      dataProvenance: "RUPTL 2025-34 + IDX iXBRL + KESDM (Energy Ministry) capacity data.",
      eligibilityFloorPct: 25,
      weighting: "relevance",
      rebalanceCadence: "Annual post-RUPTL update.",
      lastReview: "2026-05-28",
      limitations:
      "BREN illiquid float skews benchmark comparisons. Geothermal capex cycles long. PLN PPA tariff disputes are a recurring risk.",
    },
    citationIds: ["msci-thematic-relevance", "ben-david-franzoni-kim-moussawi-2023"],
    riskNote:
      "Concentrated in 2-3 names by AUM. Geothermal-development risk (drilling, permitting) underpriced at index level.",
  },

  {
    slug: "idx-palm-oil",
    name: "Palm Oil & Agribusiness",
    category: "Energy & Materials",
    region: "IDX",
    benchmark: "IHSG TR",
    blurb: "CPO upstream + downstream · subject to WASDE substitution risk",
    definition:
      "Indonesia produces ~58% of global palm oil. Theme captures listed CPO producers + downstream (margarine, oleochemicals). Sensitive to WASDE soybean projections, EU deforestation regulation (EUDR), and biodiesel B40 mandate.",
    seedwords: [
      "CPO", "palm oil", "kelapa sawit", "perkebunan", "oleochemicals",
      "biodiesel", "B40", "RSPO", "EUDR",
    ],
    constituents: [
      { ticker: "AALI", region: "IDX", relevancePct: 92, tier: "Core", source: "analyst-tagged", rationale: "Astra Agro Lestari — upstream CPO; integrated Astra subsidiary." },
      { ticker: "LSIP", region: "IDX", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "London Sumatra — pure-play CPO upstream." },
      { ticker: "DSNG", region: "IDX", relevancePct: 88, tier: "Core", source: "analyst-tagged", rationale: "Dharma Satya Nusantara — CPO + downstream (sago, hardwood)." },
      { ticker: "SIMP", region: "IDX", relevancePct: 80, tier: "Core", source: "analyst-tagged", rationale: "Salim Ivomas Pratama — integrated palm oil." },
      { ticker: "BWPT", region: "IDX", relevancePct: 85, tier: "Core", source: "analyst-tagged", rationale: "Eagle High Plantations — upstream CPO." },
    ],
    methodology: {
      scoringFormula: "CPO + palm-derivative revenue share ≥70% → Core; ≥30% with significant downstream → Significant.",
      dataProvenance: "IDX iXBRL + GAPKI (Indonesian Palm Oil Association) production data.",
      eligibilityFloorPct: 30,
      weighting: "score-vol",
      rebalanceCadence: "Annual.",
      lastReview: "2026-05-28",
      limitations:
      "ESG-screening exclusion risk (deforestation/peatland). EUDR cuts EU exposure. CPO/soybean ratio is the price driver — track WASDE.",
    },
    citationIds: ["msci-thematic-relevance", "ben-david-franzoni-kim-moussawi-2023"],
    riskNote:
      "Commodity-cyclical with embedded ESG-exclusion risk. Long-only positioning often arrives at the wrong end of the price cycle.",
  },

  // ─── US themes ─────────────────────────────────────────────────
  {
    slug: "us-ai-datacenter",
    name: "AI · Datacenter Buildout",
    category: "Disruptive Technology",
    region: "US",
    benchmark: "S&P 500",
    blurb: "Hyperscaler capex + GPU/accelerator + datacenter REITs + power",
    definition:
      "The AI capex super-cycle running through 2027+ — hyperscaler GPU buildouts, accelerator manufacturers, datacenter REITs, and adjacent infrastructure (cooling, networking, power). Mega-7 + supply chain. ARK identifies AI as one of five innovation platforms in its Big Ideas reports.",
    seedwords: [
      "artificial intelligence", "machine learning", "deep learning",
      "GPU", "TPU", "AI accelerator", "data center", "hyperscale",
      "inference", "training cluster", "liquid cooling", "HBM",
    ],
    constituents: [
      { ticker: "NVDA", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "GPU + CUDA ecosystem; ~90% AI-accelerator share." },
      { ticker: "AVGO", region: "US", relevancePct: 75, tier: "Core", source: "analyst-tagged", rationale: "Custom XPUs + AI networking (Tomahawk); ~50% AI revenue." },
      { ticker: "AMD", region: "US", relevancePct: 60, tier: "Core", source: "analyst-tagged", rationale: "MI300X/MI325X; hyperscaler-2nd-source." },
      { ticker: "MSFT", region: "US", relevancePct: 35, tier: "Significant", source: "analyst-tagged", rationale: "Azure AI services + OpenAI partnership; ~30% capex tied to AI." },
      { ticker: "GOOGL", region: "US", relevancePct: 35, tier: "Significant", source: "analyst-tagged", rationale: "TPU + Gemini + cloud AI workloads." },
      { ticker: "META", region: "US", relevancePct: 25, tier: "Significant", source: "analyst-tagged", rationale: "Llama + significant GPU capex; ad-stack AI uplift." },
      { ticker: "AMZN", region: "US", relevancePct: 22, tier: "Significant", source: "analyst-tagged", rationale: "AWS Bedrock + Trainium/Inferentia; capex cycle." },
      { ticker: "ORCL", region: "US", relevancePct: 30, tier: "Significant", source: "analyst-tagged", rationale: "OCI GPU clusters; Stargate JV with OpenAI/SoftBank." },
    ],
    methodology: {
      scoringFormula: "AI/cloud-AI revenue intensity per 10-K segment + ARK Big Ideas methodology + revenue capex intensity proxy.",
      dataProvenance: "SEC EDGAR 10-K Item 1 + companyfacts XBRL revenue segments + earnings call transcripts (manual review).",
      eligibilityFloorPct: 20,
      weighting: "relevance",
      rebalanceCadence: "Quarterly post-10-Q.",
      lastReview: "2026-05-28",
      limitations:
      "Mega-7 dominance creates concentration risk. AI capex/revenue gap may close (or not) over 2027-29. Cf. Ben-David 2023: AI ETFs launched at peak hype historically lost 30% risk-adjusted over five years.",
    },
    citationIds: ["bloomberg-thematic-protocol", "msci-thematic-relevance", "ben-david-franzoni-kim-moussawi-2023", "hoberg-phillips-2016"],
    riskNote:
      "The single most over-launched theme in ETF history. Multiple top-decile risk-adjusted decay candidates per Ben-David 2023.",
  },

  {
    slug: "us-semiconductors",
    name: "Semiconductors",
    category: "Disruptive Technology",
    region: "US",
    benchmark: "S&P 500",
    blurb: "Compute + memory + lithography + foundry + packaging",
    definition:
      "Front-to-back semiconductor value chain — design (fabless), manufacturing (foundry, IDM), equipment (litho, deposition), memory, and packaging. Beneficiaries of CHIPS Act, AI capex, and the secular silicon-content cycle.",
    seedwords: [
      "semiconductor", "wafer", "fab", "foundry", "lithography",
      "EUV", "ASML", "TSMC", "memory", "DRAM", "NAND", "HBM",
      "advanced packaging", "CoWoS",
    ],
    constituents: [
      { ticker: "NVDA", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "GPU compute leader." },
      { ticker: "AVGO", region: "US", relevancePct: 90, tier: "Core", source: "analyst-tagged", rationale: "Broadcom — networking silicon + custom ASIC." },
      { ticker: "AMD", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Pure-play fabless; CPU + GPU + DPU." },
      { ticker: "INTC", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Intel — IDM + foundry pivot (18A node)." },
      { ticker: "QCOM", region: "US", relevancePct: 80, tier: "Core", source: "analyst-tagged", rationale: "Qualcomm — mobile + auto + IoT silicon." },
      { ticker: "AMAT", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Applied Materials — wafer-fab equipment." },
      { ticker: "MU", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Micron — memory IDM (DRAM/NAND/HBM)." },
      { ticker: "KLAC", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "KLA — process control + metrology." },
    ],
    methodology: {
      scoringFormula: "Semiconductor-segment revenue share. Equipment / design / manufacturing all count.",
      dataProvenance: "SEC EDGAR 10-K segments + GICS 4530 cross-map.",
      eligibilityFloorPct: 50,
      weighting: "market-cap",
      rebalanceCadence: "Quarterly.",
      lastReview: "2026-05-28",
      limitations:
      "Highly cyclical (every 18-24mo). Geopolitical export-control overhang (US/China/Taiwan). Often top-decile inflows = top-decile drawdown risk.",
    },
    citationIds: ["bloomberg-thematic-protocol", "msci-thematic-relevance", "ben-david-franzoni-kim-moussawi-2023"],
    riskNote:
      "Cyclical; concentration in Mag-7 + supply chain. SOX has historically delivered +60% peak-to-peak and -50% peak-to-trough.",
  },

  {
    slug: "us-glp1-cardiometabolic",
    name: "GLP-1 · Obesity & Cardiometabolic",
    category: "Healthcare & Life Sciences",
    region: "US",
    benchmark: "S&P 500",
    blurb: "Semaglutide / Tirzepatide and the broader obesity-drug class",
    definition:
      "GLP-1 receptor agonists (semaglutide, tirzepatide, retatrutide pipeline) and the wider cardiometabolic-disease modification opportunity. Themes around obesity, type-2 diabetes, NASH, cardiovascular risk reduction. Inclusion threshold: companies deriving ≥50% revenue from, or with FDA Phase I-III/approved GLP-1 / cardiometabolic drugs.",
    seedwords: [
      "GLP-1", "semaglutide", "tirzepatide", "Wegovy", "Ozempic",
      "Mounjaro", "Zepbound", "retatrutide", "obesity drug",
      "cardiometabolic", "incretin", "GIP",
    ],
    constituents: [
      { ticker: "LLY", region: "US", relevancePct: 65, tier: "Core", source: "analyst-tagged", rationale: "Eli Lilly — Mounjaro/Zepbound (tirzepatide) + retatrutide pipeline; obesity dominant growth driver." },
      { ticker: "PFE", region: "US", relevancePct: 18, tier: "Peripheral", source: "analyst-tagged", rationale: "Pfizer — danuglipron/lotiglipron oral GLP-1 pipeline; <20% LT revenue exposure." },
      { ticker: "AMGN", region: "US", relevancePct: 15, tier: "Peripheral", source: "analyst-tagged", rationale: "MariTide (AMG133) Phase 2; not yet revenue-material." },
      { ticker: "VKTX", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Viking Therapeutics — VK2735 obesity pure-play biotech." },
      { ticker: "ZBH", region: "US", relevancePct: 10, tier: "Peripheral", source: "analyst-tagged", rationale: "Zimmer Biomet — adverse expectation from GLP-1 → less ortho; included as a negative-correlation hedge." },
    ],
    methodology: {
      scoringFormula: "≥50% revenue tied to GLP-1/cardiometabolic = Core; FDA Phase I-III pipeline only = Peripheral. Roundhill OZEM / Amplify THNR / Tema HRTS inclusion convention used.",
      dataProvenance: "FDA approvals + 10-K Item 1 + corporate development pipeline disclosures.",
      eligibilityFloorPct: 10,
      weighting: "score-vol",
      rebalanceCadence: "Quarterly + on Phase III readouts.",
      lastReview: "2026-05-28",
      limitations:
      "Two-name concentration (LLY + NVO ADR not in scope here). Pricing/CMS coverage decisions are binary catalysts. Cf. ARK Wright's Law — falling per-dose cost as scale rises.",
    },
    citationIds: ["bloomberg-thematic-protocol", "msci-thematic-relevance", "ben-david-franzoni-kim-moussawi-2023"],
    riskNote:
      "Binary clinical-readout risk; severe overhang from competitor drug approvals. ETF flows have followed peak-hype — caveat per Ben-David 2023.",
  },

  {
    slug: "us-cybersecurity",
    name: "Cybersecurity",
    category: "Disruptive Technology",
    region: "US",
    benchmark: "S&P 500",
    blurb: "XDR / Zero Trust / SASE / identity · platform consolidation",
    definition:
      "Modern cybersecurity stack — XDR, SASE, identity, cloud-workload protection. Platform consolidation favors Tier-1 vendors. Beneficiaries of AI-driven attacks + ongoing breach disclosure (SEC 8-K disclosure rules).",
    seedwords: [
      "cybersecurity", "XDR", "SIEM", "SOAR", "Zero Trust",
      "SASE", "CASB", "endpoint security", "identity",
      "vulnerability management", "cloud workload protection",
    ],
    constituents: [
      { ticker: "PANW", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Palo Alto Networks — platformization leader (XSIAM)." },
      { ticker: "CRWD", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "CrowdStrike — XDR/identity Falcon platform." },
      { ticker: "ZS", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Zscaler — Zero Trust + SASE pure-play." },
      { ticker: "FTNT", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Fortinet — network + SD-WAN security." },
      { ticker: "OKTA", region: "US", relevancePct: 90, tier: "Core", source: "analyst-tagged", rationale: "Okta — identity (workforce + customer)." },
      { ticker: "S", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "SentinelOne — XDR autonomous." },
    ],
    methodology: {
      scoringFormula: "Cybersecurity-segment revenue share ≥80% → Core.",
      dataProvenance: "SEC EDGAR 10-K + GICS 4510 Software cross-map.",
      eligibilityFloorPct: 50,
      weighting: "score-vol",
      rebalanceCadence: "Quarterly.",
      lastReview: "2026-05-28",
      limitations:
      "Platform consolidation hurts point-solution names. Long-cycle enterprise sales = revenue durability but slow growth in down cycles.",
    },
    citationIds: ["msci-thematic-relevance", "bloomberg-thematic-protocol", "ben-david-franzoni-kim-moussawi-2023"],
    riskNote:
      "High-multiple SaaS cohort; rate-sensitive. M&A overhang on smaller names.",
  },

  {
    slug: "us-defense-tech",
    name: "Defense & Defense-Tech",
    category: "Defense & Geopolitics",
    region: "US",
    benchmark: "S&P 500",
    blurb: "Primes + new-entrant defense-tech · drones / AI / space",
    definition:
      "Traditional defense primes + new-entrant defense-tech (autonomous, AI, space, electronic warfare). Beneficiaries of NATO 2.5% GDP commitments + Indo-Pacific procurement cycle.",
    seedwords: [
      "defense", "military", "missile", "drone", "UAV",
      "hypersonic", "electronic warfare", "space launch",
      "AUKUS", "Replicator initiative",
    ],
    constituents: [
      { ticker: "LMT", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Lockheed Martin — primes leader; F-35 + missiles." },
      { ticker: "RTX", region: "US", relevancePct: 80, tier: "Core", source: "analyst-tagged", rationale: "RTX (Raytheon) — missiles + Pratt + Collins." },
      { ticker: "NOC", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Northrop Grumman — B-21 + space + ICBM." },
      { ticker: "GD", region: "US", relevancePct: 85, tier: "Core", source: "analyst-tagged", rationale: "General Dynamics — combat systems + Gulfstream." },
      { ticker: "BA", region: "US", relevancePct: 40, tier: "Significant", source: "analyst-tagged", rationale: "Boeing — defense ~40% of revenue (BDS segment)." },
      { ticker: "PLTR", region: "US", relevancePct: 55, tier: "Core", source: "analyst-tagged", rationale: "Palantir — government/defense AI software (~55% gov revenue)." },
    ],
    methodology: {
      scoringFormula: "Government/defense segment revenue share ≥50% → Core. Boeing split via BDS segment.",
      dataProvenance: "10-K segment data + DoD contract awards (USAspending.gov).",
      eligibilityFloorPct: 25,
      weighting: "market-cap",
      rebalanceCadence: "Annual + on major procurement awards.",
      lastReview: "2026-05-28",
      limitations:
      "Cycle tied to global tensions — mean-reverts on detente. Backlog → revenue conversion lag 18-36 months.",
    },
    citationIds: ["msci-thematic-relevance", "bloomberg-thematic-protocol"],
    riskNote:
      "ESG-screening exclusion at some institutional mandates. Procurement-cycle-driven; budget caps can compress.",
  },

  {
    slug: "us-reshoring",
    name: "US Reshoring & Supply-Chain",
    category: "Defense & Geopolitics",
    region: "US",
    benchmark: "S&P 500",
    blurb: "CHIPS Act + IRA tax credits + nearshoring beneficiaries",
    definition:
      "Reshoring + nearshoring of strategic manufacturing — semiconductors (CHIPS Act $52B), critical minerals, batteries, pharma, defense industrial base. Beneficiaries span fab equipment, industrial REITs, US-domiciled producers, and logistics infrastructure.",
    seedwords: [
      "reshoring", "nearshoring", "onshoring", "CHIPS Act",
      "Inflation Reduction Act", "IRA", "domestic manufacturing",
      "industrial policy", "supply chain resilience", "critical minerals",
      "DPA Title III", "Buy American",
    ],
    constituents: [
      { ticker: "CAT", region: "US", relevancePct: 45, tier: "Significant", source: "analyst-tagged", rationale: "Caterpillar — industrial machinery for US-fab buildout + infrastructure cycle." },
      { ticker: "ETN", region: "US", relevancePct: 70, tier: "Core", source: "analyst-tagged", rationale: "Eaton — electrical infrastructure; ~70% datacenter + reshoring tied." },
      { ticker: "ROK", region: "US", relevancePct: 85, tier: "Core", source: "analyst-tagged", rationale: "Rockwell Automation — factory-floor industrial automation; reshoring-pure-play." },
      { ticker: "PWR", region: "US", relevancePct: 60, tier: "Core", source: "analyst-tagged", rationale: "Quanta Services — electrical infrastructure / grid build-out." },
      { ticker: "NUE", region: "US", relevancePct: 50, tier: "Core", source: "analyst-tagged", rationale: "Nucor — US steel; IRA + 25% steel tariff beneficiary." },
      { ticker: "EMR", region: "US", relevancePct: 55, tier: "Core", source: "analyst-tagged", rationale: "Emerson Electric — process automation + Aspen Tech." },
      { ticker: "AMAT", region: "US", relevancePct: 40, tier: "Significant", source: "analyst-tagged", rationale: "Applied Materials — CHIPS Act direct beneficiary for US fab buildout." },
    ],
    methodology: {
      scoringFormula: "Domestic-revenue share + capacity expansion announced + CHIPS/IRA funding receipt.",
      dataProvenance: "10-K + DoC CHIPS Office awards + IRA Section 48C/45X filings + earnings transcripts.",
      eligibilityFloorPct: 25,
      weighting: "score-vol",
      rebalanceCadence: "Semi-annual.",
      lastReview: "2026-05-28",
      limitations:
        "Cycle tied to fiscal policy continuity — election risk. Many names trade on backlog/capex announcements, not realised revenue.",
    },
    citationIds: ["msci-thematic-relevance", "bloomberg-thematic-protocol", "ben-david-franzoni-kim-moussawi-2023"],
    riskNote:
      "Fiscal-policy-dependent (CHIPS/IRA continuity). Multiples have re-rated on policy hype; mean-reversion risk if subsidies are clawed back.",
  },

  {
    slug: "us-robotics-automation",
    name: "Robotics & Automation",
    category: "Disruptive Technology",
    region: "US",
    benchmark: "S&P 500",
    blurb: "Industrial robotics + warehouse automation + humanoid bets",
    definition:
      "Industrial robotics, warehouse automation, surgical robotics, and emerging humanoid platforms. Cuts across capital-goods, semis (vision/control silicon), and software. ARK identifies robotics as one of five innovation platforms.",
    seedwords: [
      "robotics", "industrial robot", "humanoid", "robot arm",
      "warehouse automation", "AGV", "AMR", "machine vision",
      "surgical robot", "automation", "RaaS",
    ],
    constituents: [
      { ticker: "ISRG", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Intuitive Surgical — da Vinci platform; pure-play surgical robotics." },
      { ticker: "ABB", region: "US", relevancePct: 55, tier: "Core", source: "analyst-tagged", rationale: "ABB Ltd ADR — industrial robotics + electrification (~55% automation revenue)." },
      { ticker: "ROK", region: "US", relevancePct: 90, tier: "Core", source: "analyst-tagged", rationale: "Rockwell Automation — factory automation pure-play." },
      { ticker: "EMR", region: "US", relevancePct: 60, tier: "Core", source: "analyst-tagged", rationale: "Emerson Electric — process automation + Aspen Tech software." },
      { ticker: "TER", region: "US", relevancePct: 80, tier: "Core", source: "analyst-tagged", rationale: "Teradyne — semi test + Universal Robots collaborative arms." },
      { ticker: "TSLA", region: "US", relevancePct: 22, tier: "Significant", source: "analyst-tagged", rationale: "Tesla — Optimus humanoid bet; option value on the platform." },
      { ticker: "NVDA", region: "US", relevancePct: 18, tier: "Peripheral", source: "analyst-tagged", rationale: "NVIDIA — Isaac robotics stack; small but strategic exposure." },
    ],
    methodology: {
      scoringFormula: "Robotics/automation segment revenue share. Pure-play (≥80%) = Core; significant cohort = Significant.",
      dataProvenance: "10-K + GICS 2010/2020/4520 cross-map + IFR (International Federation of Robotics) data.",
      eligibilityFloorPct: 15,
      weighting: "relevance",
      rebalanceCadence: "Quarterly.",
      lastReview: "2026-05-28",
      limitations:
        "Humanoid robots remain pre-revenue (TSLA Optimus, FIGR). High capex / long-cycle business at index level. Capital-goods cyclicality.",
    },
    citationIds: ["msci-thematic-relevance", "bloomberg-thematic-protocol", "ben-david-franzoni-kim-moussawi-2023"],
    riskNote:
      "Humanoid names trade on demo videos, not earnings. Industrial-automation cohort is capital-goods cyclical.",
  },

  {
    slug: "us-ai-cooling",
    name: "AI Datacenter Cooling",
    category: "Disruptive Technology",
    region: "US",
    benchmark: "S&P 500",
    blurb: "Liquid + immersion cooling for GPU racks · Blackwell/Rubin thermal density",
    definition:
      "The thermal-management layer of the AI buildout. Blackwell racks dissipate 120-140 kW (vs ~40 kW for prior generation); Vera Rubin NVL72 pushes higher still. Air-cooling is exhausted — liquid + immersion + rear-door heat exchangers + CDUs (coolant distribution units) become mandatory. Pure-plays here capture spend that doesn't show up in NVDA's revenue but is mathematically required for every GPU sold.",
    seedwords: [
      "liquid cooling", "immersion cooling", "datacenter cooling",
      "CDU", "coolant distribution unit", "rear door heat exchanger",
      "direct-to-chip", "two-phase cooling", "chiller plant",
      "AI thermal", "hyperscale cooling",
    ],
    constituents: [
      { ticker: "VRT", region: "US", relevancePct: 80, tier: "Core", source: "analyst-tagged", rationale: "Vertiv — pure-play DC infrastructure; liquid cooling + CDU + power chain. AI-tied bookings ~+40% YoY." },
      { ticker: "MOD", region: "US", relevancePct: 70, tier: "Core", source: "analyst-tagged", rationale: "Modine — Airedale brand DC HVAC + chillers; Climate Solutions segment growing 30%+ YoY on hyperscaler orders." },
      { ticker: "NVT", region: "US", relevancePct: 55, tier: "Core", source: "analyst-tagged", rationale: "nVent — liquid cooling + busways + electrical enclosures; pure-play DC tilt within infrastructure." },
      { ticker: "SPXC", region: "US", relevancePct: 45, tier: "Significant", source: "analyst-tagged", rationale: "SPX Technologies — Marley cooling towers + Olsun transformers for DC; both legs hyperscaler-levered." },
      { ticker: "TT", region: "US", relevancePct: 28, tier: "Significant", source: "analyst-tagged", rationale: "Trane Technologies — chiller plants + climate controls; DC mix rising but blended with commercial HVAC." },
      { ticker: "SBGSY", region: "US", relevancePct: 32, tier: "Significant", source: "analyst-tagged", rationale: "Schneider Electric ADR — APC UPS + Galaxy + cooling; ~30% of revenue tied to AI/DC end-market." },
      { ticker: "JCI", region: "US", relevancePct: 18, tier: "Peripheral", source: "analyst-tagged", rationale: "Johnson Controls — broader HVAC; smaller AI DC mix vs Trane/Modine but reorganization unlocks DC focus." },
    ],
    methodology: {
      scoringFormula: "DC + AI-attributed revenue segment share + bookings growth from hyperscaler announcements + qualitative thermal-density positioning.",
      dataProvenance: "10-K segment data + earnings transcripts + hyperscaler capex commentary + Dell'Oro / Synergy Research DC infrastructure tracker.",
      eligibilityFloorPct: 15,
      weighting: "relevance",
      rebalanceCadence: "Quarterly post-earnings.",
      lastReview: "2026-06-03",
      limitations:
        "Cooling spend is back-loaded vs GPU shipments — orders typically book 2-3 quarters after silicon. Power-grid bottleneck is binding before cooling demand fully realizes; can defer revenue. Pricing power weaker than NVDA's; competitive (Boyd, Schneider APC, Asetek for direct-to-chip).",
    },
    citationIds: ["msci-thematic-relevance", "bloomberg-thematic-protocol", "ben-david-franzoni-kim-moussawi-2023"],
    riskNote:
      "Cooling is a derivative bet on GPU shipments — if AI capex digestion arrives, this cohort de-rates faster than NVDA (no software moat, no install base lock-in). VRT trades at premium-to-peers multiple already.",
  },

  {
    slug: "us-ai-power-grid",
    name: "AI Power Grid & Electrical",
    category: "Disruptive Technology",
    region: "US",
    benchmark: "S&P 500",
    blurb: "Gas turbines + transformers + grid build · the binding constraint",
    definition:
      "Power, not silicon, is now the binding constraint on AI buildout. PJM failed its Dec 2025 capacity auction by 6,625 MW (first time ever); ERCOT large-load queue exceeds 230 GW; HV transformer lead times are 4-5 years. Hyperscalers are committing 10+ year PPAs and bringing turbines/grid build-out forward by half a decade. Picks-and-shovels exposure to that capex.",
    seedwords: [
      "data center power", "gas turbine", "grid infrastructure",
      "transformer", "switchgear", "backup generator",
      "power purchase agreement", "PPA", "load growth",
      "transmission", "substation", "uprate", "interconnection queue",
    ],
    constituents: [
      { ticker: "GEV", region: "US", relevancePct: 75, tier: "Core", source: "analyst-tagged", rationale: "GE Vernova — gas turbines + grid; ~$120B backlog; turbine slots sold out through 2028, hyperscaler-direct." },
      { ticker: "ETN", region: "US", relevancePct: 70, tier: "Core", source: "analyst-tagged", rationale: "Eaton — electrical infrastructure; DC mix ~30% of revenue and rising. Overlaps with Reshoring theme." },
      { ticker: "HUBB", region: "US", relevancePct: 60, tier: "Core", source: "analyst-tagged", rationale: "Hubbell — utility distribution transformers + switchgear; 4-5yr lead times = pricing power." },
      { ticker: "GNRC", region: "US", relevancePct: 50, tier: "Core", source: "analyst-tagged", rationale: "Generac — backup generators for DC; commercial industrial segment 50%+ tied to DC." },
      { ticker: "PWR", region: "US", relevancePct: 60, tier: "Core", source: "analyst-tagged", rationale: "Quanta Services — grid build-out + transmission lines; multi-year hyperscaler PPAs drive backlog. Overlaps Reshoring." },
      { ticker: "FIX", region: "US", relevancePct: 65, tier: "Core", source: "analyst-tagged", rationale: "Comfort Systems USA — DC mechanical/electrical contractors; ~50% of revenue DC + advanced manufacturing." },
      { ticker: "PRIM", region: "US", relevancePct: 55, tier: "Core", source: "analyst-tagged", rationale: "Primoris — utility-scale grid + power infrastructure; transmission + substation backlog ramping." },
      { ticker: "MYRG", region: "US", relevancePct: 45, tier: "Significant", source: "analyst-tagged", rationale: "MYR Group — electrical infrastructure contractor; transmission/distribution rebuild cycle." },
    ],
    methodology: {
      scoringFormula: "DC + grid-modernization attributed revenue + booked backlog tied to hyperscaler PPAs + transmission queue exposure.",
      dataProvenance: "10-K segment + EIA Form 860/923 + hyperscaler PPA announcements (MSFT-CEG, META-X-Energy, GOOG-Kairos, AMZN-Talen) + PJM / ERCOT interconnection queue.",
      eligibilityFloorPct: 25,
      weighting: "score-vol",
      rebalanceCadence: "Quarterly post-earnings.",
      lastReview: "2026-06-03",
      limitations:
        "Utility regulatory friction can delay backlog conversion. Permitting / siting risk on transformer + transmission. Nuclear PPAs (CEG-TMI, AMZN-Talen) won't come online until 2027-2030 — near-term revenue is gas + grid only.",
    },
    citationIds: ["msci-thematic-relevance", "bloomberg-thematic-protocol", "ben-david-franzoni-kim-moussawi-2023"],
    riskNote:
      "Gas-turbine cycles historically book 18-24 months ahead of GDP — a tail-risk recession would compress new orders sharply. Permitting reform is a binary catalyst either direction.",
  },

  {
    slug: "us-datacenter-reits",
    name: "Datacenter REITs",
    category: "Disruptive Technology",
    region: "US",
    benchmark: "S&P 500",
    blurb: "Physical AI real estate · hyperscale + colo · power-constrained leasing",
    definition:
      "The physical real estate layer of the AI buildout — hyperscale build-to-suit, retail colocation, and interconnection. Cash-flow visibility from 10-15yr leases, but increasingly power-constrained: leasing premium attaches to sites with secured grid interconnection. Rate-sensitive but with secular tailwind that has historically broken the rate-correlation.",
    seedwords: [
      "data center REIT", "hyperscale", "colocation", "colo",
      "interconnection", "build-to-suit", "edge data center",
      "leased megawatts", "kW per cabinet", "rack density",
    ],
    constituents: [
      { ticker: "EQIX", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Equinix — global #1 interconnection + colo; 270+ DCs in 73 markets. Network effect = pricing power." },
      { ticker: "DLR", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Digital Realty — global hyperscale + colo; 300+ DCs. Direct hyperscaler exposure higher than EQIX." },
      { ticker: "IRM", region: "US", relevancePct: 35, tier: "Significant", source: "analyst-tagged", rationale: "Iron Mountain — pivoting records-storage to DC + asset lifecycle; DC segment ~$1B+ run-rate, ramping." },
      { ticker: "AMT", region: "US", relevancePct: 22, tier: "Significant", source: "analyst-tagged", rationale: "American Tower — mostly towers, but CoreSite acquisition gives ~$1B DC exposure; small but optionality." },
    ],
    methodology: {
      scoringFormula: "DC-segment revenue share + leased MW capacity growth + interconnection density (only EQIX-relevant proxy).",
      dataProvenance: "10-K segment data + supplemental disclosures + Synergy Research / Cushman & Wakefield DC market reports + hyperscaler lease announcements.",
      eligibilityFloorPct: 20,
      weighting: "market-cap",
      rebalanceCadence: "Quarterly post-earnings.",
      lastReview: "2026-06-03",
      limitations:
        "Rate-sensitive — historically DC REITs trade like long-duration bonds. The AI demand tailwind has broken this correlation since 2023, but a hawkish-Fed surprise re-engages it. Power-grid bottleneck caps near-term leasing velocity; cash-flow growth is back-loaded.",
    },
    citationIds: ["msci-thematic-relevance", "bloomberg-thematic-protocol", "ben-david-franzoni-kim-moussawi-2023"],
    riskNote:
      "Concentration risk: top 4 hyperscaler tenants drive >50% of DLR's backlog. Renegotiation cycles in 2027-29 are the watch point.",
  },

  {
    slug: "us-ai-optical-networking",
    name: "AI Optical & Networking",
    category: "Disruptive Technology",
    region: "US",
    benchmark: "S&P 500",
    blurb: "800G/1.6T interconnect · co-packaged optics · the GPU-fabric layer",
    definition:
      "The interconnect layer that stitches GPUs into a single compute fabric — switches, transceivers, retimers, optical components, silicon photonics. NVDA's networking segment ran $14.8B in Q1 FY27 (+199% YoY) — this theme captures the wallet share that goes outside of NVDA: scale-out (Ethernet/InfiniBand) + scale-up (NVLink/UALink) + optical components.",
    seedwords: [
      "800G", "1.6T", "optical transceiver", "co-packaged optics",
      "CPO", "silicon photonics", "DSP", "retimer", "PCIe Gen6",
      "AEC", "active electrical cable", "InfiniBand", "Spectrum-X",
      "NVLink", "UALink", "Ultra Ethernet", "scale-out", "scale-up",
    ],
    constituents: [
      { ticker: "ANET", region: "US", relevancePct: 85, tier: "Core", source: "analyst-tagged", rationale: "Arista — 800G/1.6T DC switches; Meta + MSFT primary customers; AI-back-end fabric leader for Ethernet." },
      { ticker: "AVGO", region: "US", relevancePct: 50, tier: "Core", source: "analyst-tagged", rationale: "Broadcom — Tomahawk/Jericho switch silicon + AI ASIC (OAI partnership); networking ~$15B+ AI revenue. Overlaps AI-Datacenter." },
      { ticker: "MRVL", region: "US", relevancePct: 65, tier: "Core", source: "analyst-tagged", rationale: "Marvell — Inphi DSPs + custom AI silicon (Trainium-adjacent); ~65% of revenue tied to AI/DC by FY27." },
      { ticker: "COHR", region: "US", relevancePct: 70, tier: "Core", source: "analyst-tagged", rationale: "Coherent — optical components + transceivers; DC/AI mix >50% and growing." },
      { ticker: "LITE", region: "US", relevancePct: 75, tier: "Core", source: "analyst-tagged", rationale: "Lumentum — DC laser/transceiver leader; AI mix 60%+ of optical revenue." },
      { ticker: "CIEN", region: "US", relevancePct: 45, tier: "Significant", source: "analyst-tagged", rationale: "Ciena — coherent optical for hyperscale DCI; mix shifting from telco to cloud." },
      { ticker: "ALAB", region: "US", relevancePct: 90, tier: "Core", source: "analyst-tagged", rationale: "Astera Labs — connectivity silicon for AI (Aries retimers, Scorpio fabric); pure-play AI infrastructure." },
      { ticker: "CRDO", region: "US", relevancePct: 90, tier: "Core", source: "analyst-tagged", rationale: "Credo Technology — active electrical cables (AECs) + retimers for AI clusters; pure-play." },
    ],
    methodology: {
      scoringFormula: "AI/DC-attributed revenue share + 800G/1.6T design wins + hyperscaler-named-customer disclosures + cross-check vs NVDA networking segment growth.",
      dataProvenance: "10-K segment + earnings transcripts + LightCounting / Dell'Oro optical & DC switch market shares + hyperscaler design-win announcements.",
      eligibilityFloorPct: 25,
      weighting: "relevance",
      rebalanceCadence: "Quarterly post-earnings.",
      lastReview: "2026-06-03",
      limitations:
        "Pure-plays (ALAB, CRDO) trade at peer-leading multiples already — re-rating room is narrower than the underlying growth might suggest. Co-packaged optics (CPO) transition in 2027-28 could disrupt the pluggable-transceiver cohort (LITE, COHR) — directional but timing-uncertain.",
    },
    citationIds: ["msci-thematic-relevance", "bloomberg-thematic-protocol", "ben-david-franzoni-kim-moussawi-2023"],
    riskNote:
      "If hyperscalers standardize on Ultra Ethernet + UALink, NVDA's networking dominance (Spectrum-X / NVLink) compresses — net positive for ANET / AVGO, net negative for the NVDA-tied parts of the cohort. Watch UEC consortium milestones in 2H 2026.",
  },

  {
    slug: "us-nuclear-uranium",
    name: "Nuclear & Uranium Revival",
    category: "Energy & Materials",
    region: "US",
    benchmark: "S&P 500",
    blurb: "SMR developers + uranium miners + utilities re-rating",
    definition:
      "Nuclear-power renaissance: SMR (Small Modular Reactor) developers, uranium miners (front-end fuel), and utilities with existing nuclear fleets re-rating on AI-driven power demand. Capture both the front-end fuel cycle and back-end build-out story.",
    seedwords: [
      "nuclear", "SMR", "small modular reactor", "uranium",
      "enrichment", "fuel cycle", "AP1000", "Vogtle",
      "fission", "molten salt",
    ],
    constituents: [
      { ticker: "CCJ", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Cameco — uranium miner + Westinghouse JV." },
      { ticker: "URA", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Global X Uranium ETF — basket proxy." },
      { ticker: "SMR", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "NuScale Power — SMR design pure-play." },
      { ticker: "OKLO", region: "US", relevancePct: 95, tier: "Core", source: "analyst-tagged", rationale: "Oklo Inc. — fast-reactor SMR; Sam Altman-backed." },
      { ticker: "CEG", region: "US", relevancePct: 60, tier: "Core", source: "analyst-tagged", rationale: "Constellation Energy — largest US nuclear fleet operator." },
      { ticker: "VST", region: "US", relevancePct: 30, tier: "Significant", source: "analyst-tagged", rationale: "Vistra — Comanche Peak nuclear; data-center PPAs." },
    ],
    methodology: {
      scoringFormula: "Uranium-mining or nuclear-generation revenue share. SMR developers count even pre-revenue (analyst-tagged).",
      dataProvenance: "10-K + EIA + WNA (World Nuclear Association) production data.",
      eligibilityFloorPct: 25,
      weighting: "score-vol",
      rebalanceCadence: "Semi-annual + on SMR licensing milestones.",
      lastReview: "2026-05-28",
      limitations:
      "SMR commercialization timelines are 2028-30 at earliest. Uranium spot price highly cyclical. Regulatory + waste disposal overhang.",
    },
    citationIds: ["msci-thematic-relevance", "ben-david-franzoni-kim-moussawi-2023"],
    riskNote:
      "Pre-revenue SMR names trade on milestone news. Uranium has been in a structural shortage but spot is volatile.",
  },
];

export const THEME_CATEGORIES: Array<Theme["category"]> = [
  "Disruptive Technology",
  "Energy & Materials",
  "Healthcare & Life Sciences",
  "Finance & Inclusion",
  "Consumer & Demographics",
  "Defense & Geopolitics",
];

export function themeBySlug(slug: string): Theme | undefined {
  return THEMES.find((t) => t.slug === slug);
}

export function themesByCategory(cat: Theme["category"]): Theme[] {
  return THEMES.filter((t) => t.category === cat);
}

export function themesByRegion(region: Theme["region"]): Theme[] {
  return THEMES.filter((t) => t.region === region);
}
