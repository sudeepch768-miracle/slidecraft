"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  Mail,
  ArrowLeft,
  FileText,
  Check,
  CheckCircle2,
  Loader2,
  Building,
  User,
  Calendar,
  Send,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import { projectService } from "@/lib/projects/project-service";
import { buildLetterDocumentSpec } from "@/lib/generators/letter/letter-builder";
import {
  LETTER_TYPES,
  LetterType,
  LetterTone,
} from "@/lib/generators/letter/letter-types";

export default function LetterCreatePage() {
  const router = useRouter();
  const { setDocument, setProjectId } = useEditorStore();

  const [type, setType] = useState<LetterType>("business");
  const [tone, setTone] = useState<LetterTone>("executive");
  const [subject, setSubject] = useState("Proposal for Strategic Enterprise AI Deployment Partnership");
  const [dateStr, setDateStr] = useState("October 14, 2026");

  // Sender details
  const [senderName, setSenderName] = useState("Dr. Marcus Sterling");
  const [senderTitle, setSenderTitle] = useState("Managing Director of Enterprise Solutions");
  const [senderOrg, setSenderOrg] = useState("SlideCraft AI Systems Inc.");
  const [senderEmail, setSenderEmail] = useState("m.sterling@slidecraft.ai");

  // Recipient details
  const [recipientName, setRecipientName] = useState("Elena Rostova");
  const [recipientTitle, setRecipientTitle] = useState("Chief Technology Officer");
  const [recipientOrg, setRecipientOrg] = useState("Global Horizon Technologies Corp.");
  const [salutation, setSalutation] = useState("Dear Ms. Rostova,");

  // Body
  const [para1, setPara1] = useState(
    "I am writing to formally present our strategic roadmap for integrating deterministic AI document composition across your engineering and visual design workflows. Following our preliminary discussions, our team has benchmarked significant gains in rendering precision and workflow automation."
  );
  const [para2, setPara2] = useState(
    "SlideCraft AI's enterprise architecture guarantees 100% vector fidelity, strict layout type safety, and zero regression across multi-platform exports. By replacing ad-hoc generative tools with our typed AST pipeline, Horizon Technologies will reduce presentation drafting cycles by an estimated 65%."
  );
  const [para3, setPara3] = useState(
    "We propose initiating a 30-day enterprise pilot program commencing next month. I welcome the opportunity to coordinate with your technical leads to review infrastructure prerequisites and implementation milestones."
  );

  const [closing, setClosing] = useState("Sincerely yours,");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateLetter = async () => {
    if (!subject.trim()) {
      alert("Please provide a subject line for your formal letter.");
      return;
    }

    try {
      setIsGenerating(true);

      const letterDoc = buildLetterDocumentSpec({
        letterType: type,
        tone,
        date: dateStr,
        subject: subject.trim(),
        salutation: salutation.trim(),
        sender: {
          name: senderName,
          title: senderTitle,
          organization: senderOrg,
          email: senderEmail,
        },
        recipient: {
          name: recipientName,
          title: recipientTitle,
          organization: recipientOrg,
        },
        bodyParagraphs: [para1, para2, para3].filter(Boolean),
        closing,
        aspectRatio: "US_letter",
      });

      // Strict Project Isolation
      const newProject = await projectService.createProject({
        name: subject.slice(0, 45),
        projectType: "letter",
        originalPrompt: `Letter: ${subject}`,
        currentSpec: letterDoc,
      });

      setDocument(letterDoc);
      setProjectId(newProject.id);

      router.push(`/editor?projectId=${newProject.id}`);
    } catch (err: any) {
      console.error("Letter generation error:", err);
      alert("Failed to build letter: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShell title="Corporate Letter Studio" subtitle="Generate official correspondence, executive proposals, and memoranda">
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Studio Hub</span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Letter Studio
          </span>
        </div>

        {/* Title Header */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Corporate Letterhead & Document Studio</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Draft authoritative business proposals, institutional clearance letters, and executive memoranda with formal letterhead styling.
            </p>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-6">
          {/* 1. Letter Classification & Tone */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                1
              </span>
              <h2 className="text-sm font-bold text-foreground">Letter Archetype & Tone</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Letter Classification</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as LetterType)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  {Object.values(LETTER_TYPES).map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Writing Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as LetterTone)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="formal">Formal & Authoritative</option>
                  <option value="executive">Executive Strategic</option>
                  <option value="academic">Academic & Scholarly</option>
                  <option value="cordial">Cordial & Appreciative</option>
                  <option value="assertive">Assertive Escalation</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Sender & Recipient Parties */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                2
              </span>
              <h2 className="text-sm font-bold text-foreground">Sender & Recipient Parties</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sender Block */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Sender Information (Letterhead)</span>
                </span>

                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Sender Full Name"
                  className="w-full text-xs p-2 rounded-lg border border-border bg-background text-foreground font-semibold"
                />
                <input
                  type="text"
                  value={senderTitle}
                  onChange={(e) => setSenderTitle(e.target.value)}
                  placeholder="Designation / Title"
                  className="w-full text-xs p-2 rounded-lg border border-border bg-background text-foreground"
                />
                <input
                  type="text"
                  value={senderOrg}
                  onChange={(e) => setSenderOrg(e.target.value)}
                  placeholder="Organization / Company"
                  className="w-full text-xs p-2 rounded-lg border border-border bg-background text-foreground"
                />
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full text-xs p-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              {/* Recipient Block */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>Recipient Information</span>
                </span>

                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Recipient Name"
                  className="w-full text-xs p-2 rounded-lg border border-border bg-background text-foreground font-semibold"
                />
                <input
                  type="text"
                  value={recipientTitle}
                  onChange={(e) => setRecipientTitle(e.target.value)}
                  placeholder="Recipient Title"
                  className="w-full text-xs p-2 rounded-lg border border-border bg-background text-foreground"
                />
                <input
                  type="text"
                  value={recipientOrg}
                  onChange={(e) => setRecipientOrg(e.target.value)}
                  placeholder="Target Organization"
                  className="w-full text-xs p-2 rounded-lg border border-border bg-background text-foreground"
                />
                <input
                  type="text"
                  value={salutation}
                  onChange={(e) => setSalutation(e.target.value)}
                  placeholder="Salutation (e.g. Dear Dr. Smith,)"
                  className="w-full text-xs p-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          {/* 3. Subject Line & Date */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                3
              </span>
              <h2 className="text-sm font-bold text-foreground">Formal Subject & Date</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-foreground">Formal Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Request for Institutional Endorsement..."
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Letter Date</label>
                <input
                  type="text"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  placeholder="e.g. October 14, 2026"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            </div>
          </div>

          {/* 4. Letter Body Paragraphs */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                4
              </span>
              <h2 className="text-sm font-bold text-foreground">Letter Body & Sign-Off</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Opening Context Paragraph</label>
                <textarea
                  value={para1}
                  onChange={(e) => setPara1(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Core Proposal / Argument Paragraph</label>
                <textarea
                  value={para2}
                  onChange={(e) => setPara2(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Call to Action / Next Steps</label>
                <textarea
                  value={para3}
                  onChange={(e) => setPara3(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none leading-relaxed"
                />
              </div>

              <div className="w-full sm:w-64 space-y-1 pt-2">
                <label className="text-xs font-semibold text-foreground">Formal Sign-Off Closing</label>
                <input
                  type="text"
                  value={closing}
                  onChange={(e) => setClosing(e.target.value)}
                  placeholder="e.g. Sincerely yours,"
                  className="w-full text-xs p-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Action Generate Button */}
          <div className="flex items-center justify-between p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Ready to compile your letterhead document?</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generates a formal executive document spec with Word (.docx) and high-resolution PDF print support.
              </p>
            </div>
            <button
              onClick={handleGenerateLetter}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:bg-primary/95 transition-all shrink-0 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compiling Letterhead...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-amber-300" />
                  <span>Generate Corporate Letter</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
