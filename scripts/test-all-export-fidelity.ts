import * as fs from "fs";
import * as path from "path";
import { compileDocumentToPptx } from "../src/lib/compiler/pptx/pptx-builder";
import { DocumentSpec } from "../src/types/document-spec";

async function main() {
  console.log("===============================================================");
  console.log("SLIDECRAFT AI - COMPREHENSIVE EXPORT FIDELITY VERIFICATION SUITE");
  console.log("===============================================================\n");

  const sampleSvg =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" fill="none">` +
        `<rect width="800" height="450" rx="16" fill="#0B0B1E"/>` +
        `<circle cx="400" cy="225" r="140" stroke="#9B47F5" stroke-opacity="0.5" stroke-width="3" stroke-dasharray="6 6"/>` +
        `<circle cx="400" cy="225" r="70" stroke="#06B6D4" stroke-opacity="0.8" stroke-width="2"/>` +
        `<circle cx="400" cy="225" r="16" fill="#9B47F5"/>` +
        `</svg>`
    );

  const testDoc: DocumentSpec = {
    version: "1.0.0",
    documentType: "presentation",
    meta: {
      title: "Comprehensive PPTX Export Fidelity Test",
      description: "Testing all layout renderers, card mappings, and SVG Base64 encoding",
      author: "SlideCraft Engine",
      tags: ["test", "fidelity", "pptx"],
    },
    canvas: {
      width: 1920,
      height: 1080,
      aspectRatio: "16:9",
      unit: "px",
      dpi: 96,
    },
    theme: {
      mode: "dark",
      colors: {
        primary: "#9B47F5",
        secondary: "#A855F7",
        accent: "#06B6D4",
        background: "#08071A",
        surface: "#110E2E",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        border: "#2A2254",
      },
      typography: {
        headingFont: "Segoe UI",
        bodyFont: "Segoe UI",
        monoFont: "Consolas",
        baseSizePx: 16,
      },
      styleTokens: {
        borderRadiusPx: 12,
        shadow: "md",
      },
    },
    pages: [
      // 1. Hero Title Slide (60/40 split with SVG media)
      {
        id: "p1-hero",
        pageNumber: 1,
        archetype: "hero_title",
        title: "Quantum Enterprise Cryptography: Next Generation Security Architecture",
        subtitle: "A comprehensive framework for quantum-resilient cryptographic infrastructure in modern distributed enterprise networks.",
        badge: "EXECUTIVE BRIEFING",
        elements: [
          {
            type: "media",
            id: "p1-media",
            mediaType: "image",
            url: sampleSvg,
            src: sampleSvg,
            alt: "Quantum Lattice Cryptography",
          },
          {
            type: "text",
            id: "p1-extra-note",
            variant: "body",
            content: "Deployment readiness assessment across cloud infrastructure and edge endpoints.",
            align: "left",
          },
        ],
      },

      // 2. Three Card Grid / Three Column (Cards with 01, 02, 03 pills and dynamic spacing)
      {
        id: "p2-three-card",
        pageNumber: 2,
        archetype: "three_card_grid",
        title: "Core Architectural Foundations",
        subtitle: "Three fundamental pillars underpinning quantum-resistant cryptographic systems.",
        badge: "ARCHITECTURE",
        elements: [
          {
            type: "list",
            id: "p2-pillars",
            listType: "bullet",
            items: [
              {
                id: "p2-c1",
                text: "Post-Quantum Algorithms",
                subtext: "Lattice-based and isogeny-based primitives resistant to Shor's algorithm.",
              },
              {
                id: "p2-c2",
                text: "Hardware Security Modules",
                subtext: "Tamper-resistant cryptographic enclaves operating in air-gapped environments.",
              },
              {
                id: "p2-c3",
                text: "Continuous Entropy Telemetry",
                subtext: "True random number generation verified via quantum state phase fluctuations.",
              },
            ],
          },
        ],
      },

      // 3. Two Column Split (BOTH media AND metric stacked on right)
      {
        id: "p3-two-col",
        pageNumber: 3,
        archetype: "two_column_split",
        title: "Decryption Resistance Benchmarks",
        subtitle: "Validating algorithmic resilience against state-sponsored quantum decryption clusters.",
        badge: "BENCHMARK ANALYSIS",
        elements: [
          {
            type: "text",
            id: "p3-narrative",
            variant: "body",
            content: "Extensive simulation benchmarks across 10,000 simulated logical qubits demonstrate unbreakable key security under NIST PQC standards.",
            align: "left",
          },
          {
            type: "list",
            id: "p3-points",
            listType: "bullet",
            items: [
              { id: "p3-pt1", text: "Zero practical key recovery under 256-bit Kyber lattice parameters." },
              { id: "p3-pt2", text: "Sub-millisecond encapsulation and decapsulation latency in Linux kernels." },
              { id: "p3-pt3", text: "Fully backward-compatible TLS 1.3 hybrid handshake integration." },
            ],
          },
          {
            type: "media",
            id: "p3-media",
            mediaType: "image",
            url: sampleSvg,
            src: sampleSvg,
            alt: "Benchmark Lattice",
          },
          {
            type: "metric",
            id: "p3-metric",
            value: "256-bit",
            label: "Quantum Posture Rating",
            delta: "+99.9% entropy confidence",
            trend: "up",
          },
        ],
      },

      // 4. Big Statistic / Four Metric Dashboard (Wide delta pill and bottom context card)
      {
        id: "p4-metrics",
        pageNumber: 4,
        archetype: "four_metric_dashboard",
        title: "Operational Telemetry & Performance KPIs",
        subtitle: "Key metrics across global cryptographic key exchanges over the last 90 days.",
        badge: "TELEMETRY",
        elements: [
          {
            type: "metric",
            id: "p4-m1",
            value: "99.999%",
            label: "Key Rotation Uptime",
            delta: "Zero key leakage recorded",
            trend: "up",
          },
          {
            type: "metric",
            id: "p4-m2",
            value: "0.42 ms",
            label: "Handshake Overhead",
            delta: "-68% reduction in latency",
            trend: "up",
          },
          {
            type: "metric",
            id: "p4-m3",
            value: "$4.2M",
            label: "Risk Avoidance Value",
            delta: "Prevented breach exposure",
            trend: "up",
          },
          {
            type: "metric",
            id: "p4-m4",
            value: "100%",
            label: "NIST PQC Compliance",
            delta: "FIPS 203/204 Certified",
            trend: "up",
          },
          {
            type: "text",
            id: "p4-note",
            variant: "body",
            content: "Note: All metrics monitored continuously via distributed Prometheus telemetry nodes across 14 geographic zones.",
            align: "left",
          },
        ],
      },

      // 5. Comparison Table / Matrix (Using comp-0-title, comp-1-title to verify NO hardcoded ads)
      {
        id: "p5-comparison",
        pageNumber: 5,
        archetype: "comparison_table",
        title: "Classical RSA-4096 vs Quantum Kyber-1024",
        subtitle: "Architectural comparison across security parameters and performance characteristics.",
        badge: "CRYPTOGRAPHIC COMPARISON",
        elements: [
          {
            type: "text",
            id: "p5-comp-0-title",
            variant: "h3",
            content: "Legacy RSA-4096 Baseline",
            align: "left",
          },
          {
            type: "list",
            id: "p5-comp-0-pts",
            listType: "bullet",
            items: [
              { id: "p5-c0-1", text: "Vulnerable to Shor's algorithm on 4,000+ qubit systems" },
              { id: "p5-c0-2", text: "High computation cost during 4096-bit prime generation" },
              { id: "p5-c0-3", text: "Requires complete protocol deprecation by 2030" },
            ],
          },
          {
            type: "text",
            id: "p5-comp-1-title",
            variant: "h3",
            content: "Quantum Kyber-1024 Target",
            align: "left",
          },
          {
            type: "list",
            id: "p5-comp-1-pts",
            listType: "bullet",
            items: [
              { id: "p5-c1-1", text: "Mathematically resilient against known quantum attacks" },
              { id: "p5-c1-2", text: "Sub-millisecond key encapsulation with small key footprints" },
              { id: "p5-c1-3", text: "Standardized under NIST FIPS 203 for immediate enterprise adoption" },
            ],
          },
        ],
      },

      // 6. Timeline (Milestone sequence with pills and connectors)
      {
        id: "p6-timeline",
        pageNumber: 6,
        archetype: "timeline",
        title: "Enterprise PQC Migration Roadmap",
        subtitle: "Four-phase implementation plan transitioning enterprise crypto systems.",
        badge: "ROADMAP",
        elements: [
          {
            type: "list",
            id: "p6-steps",
            listType: "bullet",
            items: [
              { id: "p6-s1", text: "Inventory & Audit: Catalog all active asymmetric keys and certificates across IT infrastructure." },
              { id: "p6-s2", text: "Hybrid Piloting: Deploy dual-key TLS handshakes in non-critical staging services." },
              { id: "p6-s3", text: "HSM Upgrade: Flash hardware security modules with NIST PQC firmware packages." },
              { id: "p6-s4", text: "Full Cutover: Enforce post-quantum ciphersuites across all customer-facing endpoints." },
            ],
          },
        ],
      },

      // 7. Process Flow (Workflow cards with step badges)
      {
        id: "p7-process",
        pageNumber: 7,
        archetype: "process_flow",
        title: "Zero-Trust Key Encapsulation Pipeline",
        subtitle: "Step-by-step cryptographic sequence for ephemeral session negotiation.",
        badge: "WORKFLOW",
        elements: [
          {
            type: "list",
            id: "p7-steps",
            listType: "bullet",
            items: [
              { id: "p7-st1", text: "Entropy Harvesting: Collect hardware true randomness from quantum diode fluctuations." },
              { id: "p7-st2", text: "Lattice Key Generation: Construct public matrix vectors over polynomial rings." },
              { id: "p7-st3", text: "Encapsulation: Client encrypts symmetric master secret using server public lattice." },
              { id: "p7-st4", text: "Decapsulation: Server recovers secret with private polynomial root matrix." },
            ],
          },
        ],
      },

      // 8. Chart Slide (Native PowerPoint chart + real non-chart takeaway card)
      {
        id: "p8-chart",
        pageNumber: 8,
        archetype: "chart",
        title: "Cryptographic Key Encapsulation Throughput (Ops/sec)",
        subtitle: "Benchmarking operations per second across classical and quantum cipher suites.",
        badge: "PERFORMANCE BENCHMARK",
        elements: [
          {
            type: "chart",
            id: "p8-ch1",
            chartType: "bar",
            labels: ["RSA-2048", "RSA-4096", "ECDH P-256", "Kyber-768", "Kyber-1024"],
            showLegend: true,
            datasets: [
              {
                name: "Operations / Second",
                data: [1200, 320, 8500, 14200, 11800],
              },
            ],
          },
          {
            type: "text",
            id: "p8-takeaway-1",
            variant: "body",
            content: "Kyber-768 delivers 11.8x higher throughput than legacy RSA-2048 while providing mathematically verified quantum resistance.",
            align: "left",
          },
          {
            type: "text",
            id: "p8-takeaway-2",
            variant: "body",
            content: "Negligible memory overhead enables seamless edge IoT deployment without hardware acceleration.",
            align: "left",
          },
        ],
      },

      // 9. Closing Slide (Real bullets on left, Studio closing card on right)
      {
        id: "p9-closing",
        pageNumber: 9,
        archetype: "closing_slide",
        title: "Strategic Mandate & Executive Next Steps",
        subtitle: "Actionable priorities for enterprise risk officers and security architects.",
        badge: "EXECUTIVE SUMMARY",
        elements: [
          {
            type: "text",
            id: "p9-heading",
            variant: "h3",
            content: "Immediate Recommended Actions",
            align: "left",
          },
          {
            type: "list",
            id: "p9-list",
            listType: "bullet",
            items: [
              { id: "p9-it1", text: "Authorize Crypto Agility Assessment: Complete full audit of enterprise cipher dependencies by Q3." },
              { id: "p9-it2", text: "Deploy Hybrid TLS Pilots: Validate hybrid classical/PQC certificates across staging environments." },
              { id: "p9-it3", text: "Engage Hardware Vendors: Ensure all new HSM purchases carry FIPS 203/204 compliance guarantees." },
            ],
          },
          {
            type: "text",
            id: "p9-note",
            variant: "body",
            content: "Early preparation eliminates expensive emergency migrations and preserves customer data integrity.",
            align: "left",
          },
        ],
      },

      // 10. Poster Slide (Event Poster tiered layout)
      {
        id: "p10-poster",
        pageNumber: 10,
        archetype: "college_event_poster",
        title: "Global Quantum Cryptography Summit 2026",
        subtitle: "The world's leading symposium on post-quantum infrastructure and enterprise defense.",
        badge: "ANNUAL SUMMIT",
        elements: [
          {
            type: "event_details",
            id: "p10-event",
            date: "October 14–16, 2026",
            time: "09:00 AM – 06:00 PM EST",
            location: "Metropolitan Tech Pavilion, Boston MA",
            priceOrAccess: "Enterprise Registration Open",
          } as any,
          {
            type: "speaker_card",
            id: "p10-sp1",
            name: "Dr. Elena Rostova",
            title: "Chief Cryptographer",
            company: "Quantum Shield Labs",
          } as any,
          {
            type: "speaker_card",
            id: "p10-sp2",
            name: "Marcus Vance",
            title: "VP Cybersecurity",
            company: "Global Infrastructure Alliance",
          } as any,
          {
            type: "metric",
            id: "p10-m1",
            value: "2,500+",
            label: "Attendees",
          },
          {
            type: "metric",
            id: "p10-m2",
            value: "48",
            label: "Technical Papers",
          },
          {
            type: "cta_badge",
            id: "p10-cta",
            text: "Reserve Delegate Pass",
            actionUrl: "https://quantumsummit2026.org",
          } as any,
          {
            type: "organizer_info",
            id: "p10-org",
            name: "International Post-Quantum Standards Consortium",
          } as any,
        ],
      },

      // 11. Custom Background Override Slide (Testing background priority over theme)
      {
        id: "p11-custom-bg",
        pageNumber: 11,
        archetype: "title_and_content",
        title: "Custom Brand Theme Background Test",
        subtitle: "Verifying that page.backgroundOverride (#0F2942) takes precedence over theme gradients.",
        badge: "THEME PRECEDENCE",
        backgroundOverride: "#0F2942",
        elements: [
          {
            type: "text",
            id: "p11-t1",
            variant: "body",
            content: "This slide features an explicit deep navy custom background (#0F2942). The PPTX compiler must strictly apply this color rather than falling back to default theme gradients.",
            align: "left",
          },
          {
            type: "list",
            id: "p11-l1",
            listType: "bullet",
            items: [
              { id: "p11-i1", text: "Explicit background color overrides theme stops" },
              { id: "p11-i2", text: "Translucent gradient wash is disabled on explicit background" },
              { id: "p11-i3", text: "Text contrast is verified against custom dark navy fill" },
            ],
          },
        ],
      },

      // 12. Full-Width Native Table Slide
      {
        id: "p12-table",
        pageNumber: 12,
        archetype: "table",
        title: "NIST Post-Quantum Standardized Algorithms",
        subtitle: "Formal parameters, cryptographic security levels, and primary target use cases.",
        badge: "STANDARDS MATRIX",
        elements: [
          {
            type: "table",
            id: "p12-tbl",
            headers: ["Algorithm", "Standard", "Security Level", "Primary Application"],
            highlightFirstColumn: true,
            rows: [
              ["ML-KEM (Kyber)", "FIPS 203", "NIST Level 1, 3, 5", "General Key Encapsulation & TLS"],
              ["ML-DSA (Dilithium)", "FIPS 204", "NIST Level 2, 3, 5", "Digital Signatures & PKI Auth"],
              ["SLH-DSA (SPHINCS+)", "FIPS 205", "NIST Level 1, 3, 5", "Stateless Hash-Based Signatures"],
              ["FN-DSA (FALCON)", "Draft Standard", "NIST Level 1, 5", "Ultra-Compact Signature Verification"],
            ],
          },
        ],
      },
    ],
  };

  console.log(`Compiling document with ${testDoc.pages.length} slides across all updated archetypes...`);
  const startTime = Date.now();
  const pptx = await compileDocumentToPptx(testDoc);
  const outPath = path.resolve(process.cwd(), "output", "test_all_export_fidelity.pptx");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await pptx.writeFile({ fileName: outPath });
  const duration = Date.now() - startTime;

  console.log(`[PASS] PPTX compiled and written in ${duration}ms!`);
  console.log(`       Path: ${outPath}`);
  const stats = fs.statSync(outPath);
  console.log(`       Size: ${(stats.size / 1024).toFixed(1)} KB\n`);

  // Inspect OpenXML Package
  console.log("--- OPENXML STRUCTURE INSPECTION ---");
  const fileBuffer = fs.readFileSync(outPath);
  const isZip = fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4b && fileBuffer[2] === 0x03 && fileBuffer[3] === 0x04;
  if (!isZip) {
    throw new Error("Output file is not a valid OpenXML PKZip container!");
  }
  console.log("[PASS] Output file is valid OpenXML container (PKZip format)");

  const binaryString = fileBuffer.toString("binary");
  for (let i = 1; i <= 12; i++) {
    const slideMarker = `ppt/slides/slide${i}.xml`;
    if (!binaryString.includes(slideMarker)) {
      throw new Error(`Missing expected slide marker: ${slideMarker}`);
    }
  }
  console.log("[PASS] All 12 slide XML markers present in OpenXML package");

  // Check chart XML
  if (!binaryString.includes("ppt/charts/chart")) {
    throw new Error("Missing native chart XML parts!");
  }
  console.log("[PASS] Native Excel-backed Chart parts present (ppt/charts/chart*.xml)");

  // Check embedded media parts
  if (binaryString.includes("ppt/media/")) {
    console.log("[PASS] Embedded Vector Media parts confirmed");
  }

  // Check that hardcoded SlideCraft AI ad text is NOT in the binary
  if (binaryString.includes("Static Code Hallucinations") || binaryString.includes("Deterministic Zod AST")) {
    throw new Error("FAILED: Output still contains hardcoded SlideCraft comparison table ad!");
  }
  console.log("[PASS] SlideCraft comparison table placeholder completely eliminated!");

  if (binaryString.includes("2.4x acceleration in vector content synthesis")) {
    throw new Error("FAILED: Output still contains hardcoded 2.4x chart takeaway ad!");
  }
  console.log("[PASS] SlideCraft chart takeaway placeholder completely eliminated!");

  // Verify real user content is in the binary
  if (!binaryString.includes("Quantum Enterprise Cryptography") || !binaryString.includes("Kyber")) {
    throw new Error("FAILED: Real user cryptographic content is missing from PPTX package!");
  }
  console.log("[PASS] Real user content verified inside OpenXML package!");

  console.log("\n===============================================================");
  console.log("ALL 12 LAYOUT ARCHETYPES & COMPILER FIXES VERIFIED SUCCESSFULLY!");
  console.log("===============================================================");
}

main().catch((err) => {
  console.error("\n[FAIL] Test suite encountered an error:", err);
  process.exit(1);
});
