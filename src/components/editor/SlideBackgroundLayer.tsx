"use client";

import React from "react";
import { BackgroundSpec, ThemeSpec } from "@/types/document-spec";
import { VisualDirection } from "@/types/visual-direction";
import { cn } from "@/lib/utils";

interface SlideBackgroundLayerProps {
  backgroundSpec?: BackgroundSpec;
  visualDirection?: VisualDirection;
  theme: ThemeSpec;
  bgOverride?: string;
  className?: string;
}

export const SlideBackgroundLayer: React.FC<SlideBackgroundLayerProps> = ({
  backgroundSpec,
  visualDirection,
  theme,
  bgOverride,
  className,
}) => {
  const rawGlow = backgroundSpec?.glow || visualDirection?.glow;
  const glow = rawGlow
    ? {
        position: rawGlow.position,
        color: rawGlow.color,
        secondaryColor: (rawGlow as any).secondaryColor,
        blur: (rawGlow as any).blurPx ?? (rawGlow as any).blur ?? 80,
        opacity: rawGlow.opacity ?? 0.25,
        scale: rawGlow.scale ?? 1.2,
      }
    : undefined;

  const rawShapes = backgroundSpec?.decorativeShapes || visualDirection?.decorativeShapes;
  const shapes = rawShapes
    ? {
        style: ((rawShapes as any).style || (rawShapes as any).type || "none") as string,
        position: ((rawShapes as any).position || "top_right") as string,
        color: rawShapes.color,
        secondaryColor: (rawShapes as any).secondaryColor,
        opacity: rawShapes.opacity ?? 0.15,
      }
    : undefined;

  const pattern =
    backgroundSpec?.pattern ||
    (visualDirection?.texturePattern?.type !== "none" ? visualDirection?.texturePattern?.type : undefined) ||
    "none";
  const patternOpacity =
    backgroundSpec?.patternOpacity ?? visualDirection?.texturePattern?.opacity ?? 0.12;

  // Compute gradient CSS
  const gradient = backgroundSpec?.gradient || visualDirection?.gradient;
  let gradientCss = "";
  if (gradient && gradient.stops && gradient.stops.length > 0) {
    const angleStr =
      typeof gradient.angleDeg === "number"
        ? `${gradient.angleDeg}deg`
        : gradient.direction === "to_right"
        ? "to right"
        : gradient.direction === "to_bottom"
        ? "to bottom"
        : gradient.direction === "to_top_right"
        ? "to top right"
        : "to bottom right";
    const stopsStr = gradient.stops.map((s) => `${s.color} ${s.position}%`).join(", ");
    gradientCss = `linear-gradient(${angleStr}, ${stopsStr})`;
  }

  // Glow position styles
  const getGlowPositionClasses = (position?: string) => {
    switch (position) {
      case "top_left":
        return "-top-36 -left-36";
      case "top_right":
        return "-top-36 -right-36";
      case "bottom_left":
        return "-bottom-36 -left-36";
      case "bottom_right":
        return "-bottom-36 -right-36";
      case "center":
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case "asymmetric":
        return "-top-28 -right-28";
      default:
        return "-bottom-32 -right-32";
    }
  };

  // Decorative shapes rendering
  const renderDecorativeShapes = () => {
    if (!shapes || shapes.style === "none") return null;

    const primaryColor = shapes.color || theme.colors.primary;
    const secColor = shapes.secondaryColor || theme.colors.accent || primaryColor;
    const opacity = shapes.opacity ?? 0.15;

    switch (shapes.style) {
      case "geometric_circles": {
        const isRight = shapes.position.includes("right");
        return (
          <div
            className={cn(
              "absolute pointer-events-none z-0",
              isRight ? "-top-24 -right-24" : "-bottom-24 -left-24"
            )}
            style={{ opacity }}
          >
            <svg width="340" height="340" viewBox="0 0 340 340" fill="none">
              <circle cx="170" cy="170" r="150" stroke={primaryColor} strokeWidth="1.5" strokeDasharray="4 6" />
              <circle cx="170" cy="170" r="105" stroke={secColor} strokeWidth="1" />
              <circle cx="170" cy="170" r="60" stroke={primaryColor} strokeWidth="1.5" />
              <line x1="170" y1="10" x2="170" y2="330" stroke={primaryColor} strokeWidth="0.8" strokeOpacity="0.5" />
              <line x1="10" y1="170" x2="330" y2="170" stroke={secColor} strokeWidth="0.8" strokeOpacity="0.5" />
            </svg>
          </div>
        );
      }

      case "accent_rail": {
        const isLeft = shapes.position === "bottom_left" || shapes.position === "top_left" || shapes.position === "side_rails";
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity }}>
            {isLeft && (
              <div
                className="absolute top-10 bottom-10 left-6 w-[2px] rounded-full"
                style={{
                  background: `linear-gradient(to bottom, transparent, ${primaryColor}, ${secColor}, transparent)`,
                }}
              />
            )}
            <div
              className="absolute top-10 bottom-10 right-6 w-[2px] rounded-full"
              style={{
                background: `linear-gradient(to bottom, transparent, ${secColor}, ${primaryColor}, transparent)`,
              }}
            />
          </div>
        );
      }

      case "tech_brackets": {
        return (
          <div className="absolute inset-4 pointer-events-none z-0" style={{ opacity }}>
            {/* Top-Left Reticle */}
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: primaryColor }} />
            {/* Top-Right Reticle */}
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: secColor }} />
            {/* Bottom-Left Reticle */}
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: secColor }} />
            {/* Bottom-Right Reticle */}
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: primaryColor }} />
          </div>
        );
      }

      case "corner_frame": {
        return (
          <div className="absolute inset-6 pointer-events-none z-0" style={{ opacity }}>
            <div
              className="absolute top-0 left-0 w-12 h-12 border-t border-l rounded-tl-lg"
              style={{ borderColor: primaryColor }}
            />
            <div
              className="absolute bottom-0 right-0 w-12 h-12 border-b border-r rounded-br-lg"
              style={{ borderColor: secColor }}
            />
          </div>
        );
      }

      case "editorial_lines": {
        return (
          <div className="absolute inset-0 pointer-events-none z-0" style={{ opacity }}>
            <div
              className="absolute top-14 left-8 right-8 h-[1px]"
              style={{
                background: `linear-gradient(to right, transparent, ${primaryColor}60, ${secColor}60, transparent)`,
              }}
            />
            <div
              className="absolute bottom-12 left-8 right-8 h-[1px]"
              style={{
                background: `linear-gradient(to right, transparent, ${secColor}40, ${primaryColor}40, transparent)`,
              }}
            />
          </div>
        );
      }

      case "aurora_ribbon": {
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity: opacity * 1.5 }}>
            <div
              className="absolute -top-32 -left-20 w-[120%] h-64 blur-3xl transform -rotate-12 rounded-[50%]"
              style={{
                background: `linear-gradient(90deg, ${primaryColor}30 0%, ${secColor}40 50%, transparent 100%)`,
              }}
            />
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {/* 1. Dynamic Gradient Layer */}
      {gradientCss && (
        <div
          className="absolute inset-0 z-0 transition-opacity duration-300"
          style={{ background: gradientCss }}
        />
      )}

      {/* 2. Dynamic Ambient Glow Layer */}
      {glow && (
        <>
          <div
            className={cn(
              "absolute w-[500px] h-[500px] rounded-full pointer-events-none z-0 transition-all",
              getGlowPositionClasses(glow.position)
            )}
            style={{
              opacity: glow.opacity ?? 0.25,
              filter: `blur(${glow.blur}px)`,
              transform: `scale(${glow.scale ?? 1.2})`,
              background: `radial-gradient(circle, ${glow.color} 0%, ${
                glow.secondaryColor || theme.colors.accent || "transparent"
              } 45%, transparent 75%)`,
            }}
          />
          {glow.position === "asymmetric" && (
            <div
              className="absolute -bottom-28 -left-28 w-[400px] h-[400px] rounded-full pointer-events-none z-0"
              style={{
                opacity: (glow.opacity ?? 0.25) * 0.7,
                filter: `blur(${glow.blur * 0.8}px)`,
                background: `radial-gradient(circle, ${
                  glow.secondaryColor || theme.colors.accent || glow.color
                } 0%, transparent 70%)`,
              }}
            />
          )}
        </>
      )}

      {/* 3. Fallback Glow if no explicit glow exists and theme is dark */}
      {!glow && theme.mode === "dark" && (
        <div
          className="absolute -bottom-28 -right-28 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl z-0"
          style={{
            background: `radial-gradient(circle, ${theme.colors.secondary || "#818CF8"} 0%, ${theme.colors.accent || "#F43F5E"} 45%, transparent 70%)`,
          }}
        />
      )}

      {/* 4. Dynamic Patterns */}
      {pattern && pattern !== "none" && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            opacity: patternOpacity,
            backgroundImage:
              pattern === "subtle_grid"
                ? `radial-gradient(${theme.colors.textSecondary || "#94A3B8"} 1px, transparent 1px)`
                : pattern === "dots"
                ? `radial-gradient(circle, ${theme.colors.textSecondary || "#94A3B8"} 1.5px, transparent 1.5px)`
                : pattern === "mesh"
                ? `linear-gradient(45deg, ${theme.colors.primary}15 25%, transparent 25%), linear-gradient(-45deg, ${theme.colors.secondary}15 25%, transparent 25%)`
                : pattern === "editorial_lines"
                ? `repeating-linear-gradient(0deg, ${theme.colors.textSecondary || "#94A3B8"}25 0px, ${theme.colors.textSecondary || "#94A3B8"}25 1px, transparent 1px, transparent 24px)`
                : pattern === "diagonal_stripes" || (pattern as string) === "crosshatch"
                ? `repeating-linear-gradient(45deg, ${theme.colors.textSecondary || "#94A3B8"}20 0px, ${theme.colors.textSecondary || "#94A3B8"}20 1px, transparent 1px, transparent 18px)`
                : `radial-gradient(${theme.colors.textSecondary || "#94A3B8"} 1px, transparent 1px)`,
            backgroundSize: pattern === "dots" ? "20px 20px" : "24px 24px",
          }}
        />
      )}

      {/* 5. Dynamic Decorative Shapes */}
      {renderDecorativeShapes()}

      {/* 6. Image Background Spec Overlay */}
      {backgroundSpec?.image && (
        <div
          className={cn(
            "absolute pointer-events-none z-0 overflow-hidden",
            backgroundSpec.image.mode === "side_panel"
              ? "top-0 right-0 w-1/3 h-full"
              : "inset-0"
          )}
          style={{
            opacity: backgroundSpec.image.opacity ?? 1,
            filter: `blur(${backgroundSpec.image.blurPx ?? 0}px) brightness(${backgroundSpec.image.brightness ?? 1}) contrast(${backgroundSpec.image.contrast ?? 1})`,
          }}
        >
          <img
            src={backgroundSpec.image.url}
            alt="Slide Background"
            className="w-full h-full object-cover"
          />
          {backgroundSpec.image.overlayColor && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: backgroundSpec.image.overlayColor,
                opacity: backgroundSpec.image.overlayOpacity ?? 0.5,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
