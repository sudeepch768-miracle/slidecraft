"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  FileText,
  ArrowLeft,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Loader2,
  User,
  Briefcase,
  GraduationCap,
  Code,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import { projectService } from "@/lib/projects/project-service";
import { buildResumeDocumentSpec } from "@/lib/generators/resume/resume-builder";
import {
  RESUME_TYPES,
  ResumeType,
  ResumeSectionItem,
} from "@/lib/generators/resume/resume-types";
import { FormatLivePreview } from "@/components/preview/FormatLivePreview";

export default function ResumeCreatePage() {
  const router = useRouter();
  const { setDocument, setProjectId } = useEditorStore();

  const [resumeType, setResumeType] = useState<ResumeType>("ats_friendly");
  const [pageLimit, setPageLimit] = useState<"1_page" | "2_page">("1_page");

  // Contact Info
  const [name, setName] = useState("Alexander Vance");
  const [targetTitle, setTargetTitle] = useState("Staff AI Systems Architect & Research Lead");
  const [email, setEmail] = useState("alexander.vance@slidecraft.ai");
  const [phone, setPhone] = useState("+1 (555) 349-8201");
  const [location, setLocation] = useState("San Francisco, CA");
  const [linkedin, setLinkedin] = useState("linkedin.com/in/alexandervance");

  // Summary
  const [summary, setSummary] = useState(
    "Staff AI Systems Architect with 8+ years designing production agentic systems, deterministic vector compilers, and enterprise LLM orchestration engines. Proven track record leading distributed engineering teams and delivering 99.9% uptime infrastructure."
  );

  // Skills
  const [skillsText, setSkillsText] = useState(
    "TypeScript, Python, Next.js, Distributed Systems, PyTorch, LangChain, Vector Databases, PostgreSQL, Docker, AWS, Zod, React 19"
  );

  // Experience Items
  const [experiences, setExperiences] = useState<ResumeSectionItem[]>([
    {
      id: "exp-1",
      title: "Staff AI Architect",
      subtitle: "SlideCraft Engineering Corp",
      dateRange: "2023 - Present",
      location: "San Francisco, CA",
      bullets: [
        "Architected deterministic visual AST compilation pipeline reducing rendering regressions by 94%.",
        "Orchestrated multi-user cloud workspace synchronization serving 150K+ monthly active creators.",
        "Engineered zero-hallucination ATS resume parser ensuring 100% compliant document generation.",
      ],
    },
    {
      id: "exp-2",
      title: "Senior Full-Stack Engineer",
      subtitle: "Applied AI Technologies Inc",
      dateRange: "2020 - 2023",
      location: "New York, NY",
      bullets: [
        "Led core team of 6 engineers migrating legacy web microservices to Next.js edge runtime.",
        "Implemented real-time canvas vector transformations with WebGL acceleration.",
      ],
    },
  ]);

  // Education
  const [education, setEducation] = useState<ResumeSectionItem[]>([
    {
      id: "edu-1",
      title: "Master of Science in Computer Science (AI Systems)",
      subtitle: "Stanford University",
      dateRange: "2018 - 2020",
      location: "Stanford, CA",
      bullets: ["Focus: Neural Architecture Search and Distributed Compilers. GPA: 3.94."],
    },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: `exp-${Date.now()}`,
        title: "Senior Role Title",
        subtitle: "Company Name",
        dateRange: "2021 - 2023",
        location: "Location",
        bullets: ["Key quantified achievement or leadership initiative."],
      },
    ]);
  };

  const handleRemoveExperience = (idx: number) => {
    setExperiences(experiences.filter((_, i) => i !== idx));
  };

  const handleGenerateResume = async () => {
    if (!name.trim()) {
      alert("Please provide your full name.");
      return;
    }

    try {
      setIsGenerating(true);

      const skillsList = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const resumeDoc = buildResumeDocumentSpec({
        resumeType,
        contactInfo: {
          name: name.trim(),
          title: targetTitle.trim() || undefined,
          email: email.trim(),
          phone: phone.trim() || undefined,
          location: location.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
        },
        summaryText: summary.trim() || undefined,
        skills: skillsList,
        experience: experiences,
        education,
        aspectRatio: "A4_portrait",
      });

      // Strict Project Isolation
      const newProject = await projectService.createProject({
        name: `${name} - Resume`,
        projectType: "resume",
        originalPrompt: `Resume for ${name} (${targetTitle})`,
        currentSpec: resumeDoc,
      });

      setDocument(resumeDoc);
      setProjectId(newProject.id);

      router.push(`/editor?projectId=${newProject.id}`);
    } catch (err: any) {
      console.error("Resume generation error:", err);
      alert("Failed to build resume: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShell title="Executive Resume Studio" subtitle="Build ATS-friendly, factually accurate resumes & CVs">
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Studio Hub</span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20">
            Resume Studio
          </span>
        </div>

        {/* Title Header */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Executive Resume & CV Studio</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Strictly structured section hierarchy guaranteed to pass modern ATS scanners with zero invented credentials and verified typography.
            </p>
          </div>
        </div>

        {/* 2-Column Grid: Config Form on Left, Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Resume Archetype */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                  1
                </span>
                <h2 className="text-sm font-bold text-foreground">Resume Archetype & Page Budget</h2>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-lg bg-muted border border-border text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPageLimit("1_page")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-colors",
                    pageLimit === "1_page" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  1 Page Strict
                </button>
                <button
                  type="button"
                  onClick={() => setPageLimit("2_page")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-colors",
                    pageLimit === "2_page" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  2 Pages (Executive)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {Object.values(RESUME_TYPES).map((res) => {
                const isSelected = resumeType === res.id;
                return (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setResumeType(res.id)}
                    className={cn(
                      "p-3 rounded-xl border text-left flex flex-col justify-between transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-foreground"
                        : "border-border bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div>
                      <span className="text-xs font-bold block mb-1">{res.label}</span>
                      <p className="text-[10px] opacity-75 line-clamp-2">{res.description}</p>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary stroke-[3] mt-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Contact Details */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                2
              </span>
              <h2 className="text-sm font-bold text-foreground">Contact & Header Profile</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Full Candidate Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Jane Doe"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Target Role Title</label>
                <input
                  type="text"
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  placeholder="e.g. Senior Machine Learning Engineer"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State / Remote"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">LinkedIn / Portfolio URL</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            </div>
          </div>

          {/* 3. Executive Summary & Skills */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                3
              </span>
              <h2 className="text-sm font-bold text-foreground">Summary & Core Skills</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Executive Career Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Core Skills & Technical Competencies (comma-separated)
                </label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="e.g. Python, Distributed Systems, Docker, Machine Learning"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            </div>
          </div>

          {/* 4. Work Experience */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                  4
                </span>
                <h2 className="text-sm font-bold text-foreground">Work History ({experiences.length})</h2>
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Role</span>
              </button>
            </div>

            <div className="space-y-3">
              {experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].title = e.target.value;
                          setExperiences(updated);
                        }}
                        placeholder="Job Title"
                        className="text-xs font-bold p-1.5 rounded-md border border-border bg-background text-foreground"
                      />
                      <input
                        type="text"
                        value={exp.subtitle || ""}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].subtitle = e.target.value;
                          setExperiences(updated);
                        }}
                        placeholder="Company Name"
                        className="text-xs p-1.5 rounded-md border border-border bg-background text-foreground"
                      />
                      <input
                        type="text"
                        value={exp.dateRange || ""}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].dateRange = e.target.value;
                          setExperiences(updated);
                        }}
                        placeholder="Dates (e.g. 2022 - Present)"
                        className="text-xs p-1.5 rounded-md border border-border bg-background text-foreground"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      className="p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                      title="Remove Role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    {exp.bullets.map((b, bIdx) => (
                      <input
                        key={bIdx}
                        type="text"
                        value={b}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].bullets[bIdx] = e.target.value;
                          setExperiences(updated);
                        }}
                        placeholder="Bullet point achievement..."
                        className="w-full text-[11px] p-1.5 rounded-md border border-border bg-background text-foreground"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Generate Button */}
          <div className="flex items-center justify-between p-6 rounded-2xl border border-sky-500/20 bg-sky-500/5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Ready to generate your ATS resume?</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Renders a pristine, ATS-scannable resume document with Word (.docx) and PDF export support.
              </p>
            </div>
            <button
              onClick={handleGenerateResume}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:bg-primary/95 transition-all shrink-0 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Structuring ATS Spec...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-sky-300" />
                  <span>Generate Executive Resume</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Sticky Live Preview Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 rounded-2xl border border-border/80 bg-card p-4 shadow-sm space-y-3">
            <FormatLivePreview
              documentType="resume"
              title={name || "Candidate Name"}
              subtitle={targetTitle}
              aspectRatio="A4_portrait"
              moodOrCategory={resumeType}
              details={{
                badge: resumeType.toUpperCase().replace("_", " "),
                handle: email,
                metrics: [
                  { label: "Experience", value: `${experiences.length} Roles` },
                  { label: "Format", value: pageLimit === "1_page" ? "1 Page" : "2 Pages" },
                ],
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </AppShell>
  );
}
