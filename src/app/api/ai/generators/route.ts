import { NextRequest, NextResponse } from "next/server";
import { buildPosterDocumentSpec } from "@/lib/poster-engine/poster-builder";
import { buildInfographicDocumentSpec } from "@/lib/generators/infographic/infographic-builder";
import { buildSocialDocumentSpec } from "@/lib/generators/social/social-builder";
import { buildResumeDocumentSpec } from "@/lib/generators/resume/resume-builder";
import { buildLetterDocumentSpec } from "@/lib/generators/letter/letter-builder";
import { buildDiagramDocumentSpec } from "@/lib/generators/diagram/diagram-builder";
import { buildChartDocumentSpec } from "@/lib/generators/chart/chart-builder";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || req.nextUrl.searchParams.get("action");

    if (!action) {
      return NextResponse.json(
        {
          error:
            "Missing 'action'. Valid actions: generate_poster, generate_infographic, generate_social, generate_resume, generate_letter, generate_diagram, generate_chart.",
        },
        { status: 400 }
      );
    }

    const uniqueProjectId = `proj-${action.replace("generate_", "")}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    let generatedSpec: any = null;
    let formatType = "";

    switch (action) {
      case "generate_poster": {
        formatType = "poster";
        generatedSpec = buildPosterDocumentSpec({
          posterType: body.posterType || "college_event",
          title: body.title || "Special Presentation Poster",
          subtitle: body.subtitle,
          dimensions: body.dimensions || "A4_portrait",
          designMood: body.designMood || "vibrant_modern",
          typographyStyle: body.typographyStyle || "modern_sans",
          eventDate: body.eventDate,
          eventTime: body.eventTime,
          eventVenue: body.eventVenue,
          qrUrl: body.qrUrl,
          organizerName: body.organizerName,
          contactEmail: body.contactEmail,
          callToActionText: body.callToActionText || "REGISTER NOW",
          highlights: body.highlights,
        });
        break;
      }

      case "generate_infographic": {
        formatType = "infographic";
        generatedSpec = buildInfographicDocumentSpec({
          infographicType: body.infographicType || "process",
          title: body.title || "Process Infographic",
          subtitle: body.subtitle,
          badge: body.badge,
          dimensions: body.dimensions || "9:16",
          steps: body.steps || [
            { title: "Step 1", description: "First phase description" },
            { title: "Step 2", description: "Second phase description" },
            { title: "Step 3", description: "Third phase description" },
          ],
        });
        break;
      }

      case "generate_social": {
        formatType = "social_media";
        generatedSpec = buildSocialDocumentSpec({
          platform: body.platform || "instagram_post",
          headline: body.headline || "Featured Announcement",
          subheadline: body.subheadline,
          callToAction: body.callToAction,
          handleOrBrand: body.handleOrBrand,
          badgeText: body.badgeText,
          highlightStats: body.highlightStats,
          aspectRatio: body.aspectRatio,
        });
        break;
      }

      case "generate_resume": {
        formatType = "resume";
        generatedSpec = buildResumeDocumentSpec({
          resumeType: body.resumeType || "ats_friendly",
          contactInfo: body.contactInfo || {
            name: body.name || "Candidate Name",
            email: body.email || "candidate@email.com",
            title: body.title,
            phone: body.phone,
            location: body.location,
          },
          summaryText: body.summaryText,
          skills: body.skills,
          experience: body.experience,
          education: body.education,
          aspectRatio: "A4_portrait",
        });
        break;
      }

      case "generate_letter": {
        formatType = "letter";
        generatedSpec = buildLetterDocumentSpec({
          letterType: body.letterType || "business",
          tone: body.tone || "executive",
          date: body.date,
          subject: body.subject || "Formal Proposal",
          salutation: body.salutation || "Dear Recipient,",
          sender: body.sender || { name: "Sender Name" },
          recipient: body.recipient || { name: "Recipient Name" },
          bodyParagraphs: body.bodyParagraphs || ["Opening context", "Main details", "Call to action"],
          closing: body.closing || "Sincerely,",
          aspectRatio: "US_letter",
        });
        break;
      }

      case "generate_diagram": {
        formatType = "diagram";
        generatedSpec = buildDiagramDocumentSpec({
          diagramCategory: body.diagramCategory || "system_architecture",
          title: body.title || "System Architecture",
          subtitle: body.subtitle,
          badge: body.badge,
          nodes: body.nodes,
          connections: body.connections,
          aspectRatio: "16:9",
        });
        break;
      }

      case "generate_chart": {
        formatType = "chart";
        generatedSpec = buildChartDocumentSpec({
          chartType: body.chartType || "column",
          archetype: body.archetype || "kpi_dashboard",
          title: body.title || "Quantitative Chart Analysis",
          subtitle: body.subtitle,
          labels: body.labels || ["Q1", "Q2", "Q3", "Q4"],
          datasets: body.datasets || [{ name: "Metric Series", data: [100, 140, 180, 220] }],
          kpis: body.kpis,
          aspectRatio: "16:9",
        });
        break;
      }

      default:
        return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      formatType,
      projectId: uniqueProjectId,
      document: generatedSpec,
      meta: {
        isolated: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[Generators API Route Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to generate format spec." }, { status: 500 });
  }
}
