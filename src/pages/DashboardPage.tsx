import { useState } from "react";
import Sidebar from "../components/Sidebar";
import MilestoneItem from "../components/MilestoneItem";
import Icon from "../components/Icon";
import { colors as C } from "../theme";
import type { Milestone, PhaseItem } from "../types";

const PHASES: PhaseItem[] = [
  { icon: "engineering", label: "Preparation", num: 1 },
  { icon: "construction", label: "Build Phase", num: 2 },
  { icon: "brush", label: "Finishing", num: 3 },
];

const FIELD_INPUTS: {
  label: string;
  stateKey: "rooms" | "squareMeters" | "scheduledCompletion" | "location";
  placeholder: string;
  icon: string;
  type: string;
}[] = [
  {
    label: "Number of Rooms",
    stateKey: "rooms",
    placeholder: "0",
    icon: "meeting_room",
    type: "number",
  },
  {
    label: "Square Meters (m²)",
    stateKey: "squareMeters",
    placeholder: "0",
    icon: "square_foot",
    type: "number",
  },
  {
    label: "Scheduled Completion",
    stateKey: "scheduledCompletion",
    placeholder: "mm/dd/yyyy",
    icon: "calendar_today",
    type: "date",
  },
  {
    label: "Location",
    stateKey: "location",
    placeholder: "City, Country",
    icon: "location_on",
    type: "text",
  },
];

const PROJECT_TYPES = ["Renovations", "New constructions", "Huge scale"] as const;
type ProjectType = (typeof PROJECT_TYPES)[number];

const SUB_OPTIONS: Record<ProjectType, string[]> = {
  Renovations: ["Bathrooms", "Homes", "Annexes", "Luxury finishes"],
  "New constructions": ["Newly built homes", "Luxury finishes", "Annexes"],
  "Huge scale": ["Offices", "Public facilities"],
};

let nextId = 3;

interface DashboardPageProps {
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [projectType, setProjectType] = useState<ProjectType | "">("");
  const [projectSubtype, setProjectSubtype] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectOverview, setProjectOverview] = useState("");
  const [fieldValues, setFieldValues] = useState({
    rooms: "",
    squareMeters: "",
    scheduledCompletion: "",
    location: "",
  });
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newStep, setNewStep] = useState("");
  const [published, setPublished] = useState(false);

  const setField = (key: keyof typeof fieldValues, value: string) =>
    setFieldValues((prev) => ({ ...prev, [key]: value }));

  const addStep = () => {
    const trimmed = newStep.trim();
    if (!trimmed) return;
    setMilestones((m) => [...m, { id: nextId++, text: trimmed }]);
    setNewStep("");
  };

  const deleteStep = (id: number) =>
    setMilestones((m) => m.filter((ms) => ms.id !== id));

  // ── Shared style helpers ──
  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: C.surfaceLow,
    borderRadius: 6,
    padding: "10px 14px",
    color: C.onSurface,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "Inter, sans-serif",
    transition: "border-color 0.2s",
    border: `1px solid ${C.outlineVar}`,
  };

  const iconInputStyle: React.CSSProperties = {
    ...inputStyle,
    paddingLeft: 42,
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%23888'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    paddingRight: 36,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: C.onSurfaceVar,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 6,
  };

  const cardStyle: React.CSSProperties = {
    background: C.surface,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden",
    marginBottom: 20,
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Inter, sans-serif",
        backgroundColor: C.bg,
        overflow: "hidden",
      }}
    >
      <Sidebar onLogout={onLogout} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Scrollable main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            {["DASHBOARD", "PROJECTS"].map((crumb, i) => (
              <span
                key={crumb}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {i > 0 && (
                  <Icon
                    name="chevron_right"
                    size={14}
                    style={{ color: C.outline }}
                  />
                )}
                <span
                  style={{
                    color: i === 1 ? C.onSurface : C.outline,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                  }}
                >
                  {crumb}
                </span>
              </span>
            ))}
          </div>

          <h1
            style={{
              color: C.onSurface,
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 2,
            }}
          >
            New Project
          </h1>
          <p style={{ color: C.onSurfaceVar, fontSize: 13, marginBottom: 24 }}>
            Configure project specifications, architectural details, and phased
            milestones.
          </p>

          {/* Two-column layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 260px",
              gap: 20,
            }}
          >
            {/* ── Left column ── */}
            <div>
              {/* Core Specs Card */}
              <div style={cardStyle}>
                <div style={{ height: 3, background: C.primaryContainer }} />
                <div style={{ padding: 24 }}>
                  <h2
                    style={{
                      color: C.onSurface,
                      fontSize: 18,
                      fontWeight: 600,
                      marginBottom: 20,
                    }}
                  >
                    Core Specifications
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <div>
                      <label style={labelStyle}>Project Type</label>
                      <select
                        style={selectStyle}
                        value={projectType}
                        onChange={(e) => {
                          setProjectType(e.target.value as ProjectType);
                          setProjectSubtype("");
                        }}
                        onFocus={(e) => (e.target.style.borderColor = C.primaryContainer)}
                        onBlur={(e) => (e.target.style.borderColor = C.outlineVar)}
                      >
                        <option value="" disabled>Select a project type...</option>
                        {PROJECT_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {projectType && (
                      <div>
                        <label style={labelStyle}>Project Subtype</label>
                        <select
                          style={selectStyle}
                          value={projectSubtype}
                          onChange={(e) => setProjectSubtype(e.target.value)}
                          onFocus={(e) => (e.target.style.borderColor = C.primaryContainer)}
                          onBlur={(e) => (e.target.style.borderColor = C.outlineVar)}
                        >
                          <option value="" disabled>Select a subtype...</option>
                          {SUB_OPTIONS[projectType].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label style={labelStyle}>Project Title</label>
                      <input
                        style={inputStyle}
                        placeholder="e.g. Skyline Residence Phase II"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onFocus={(e) =>
                          (e.target.style.borderColor = C.primaryContainer)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = C.outlineVar)
                        }
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Detailed Description</label>
                      <textarea
                        rows={4}
                        style={{ ...inputStyle, resize: "vertical" }}
                        placeholder="Describe the project scope, design philosophy, and key deliverables..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onFocus={(e) =>
                          (e.target.style.borderColor = C.primaryContainer)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = C.outlineVar)
                        }
                      />
                    </div>

                    {/* 2x2 grid of fields */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                      }}
                    >
                      {FIELD_INPUTS.map(
                        ({ label, stateKey, placeholder, icon, type }) => (
                          <div key={label}>
                            <label style={labelStyle}>{label}</label>
                            <div style={{ position: "relative" }}>
                              <Icon
                                name={icon}
                                size={16}
                                style={{
                                  position: "absolute",
                                  left: 12,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: C.outline,
                                  pointerEvents: "none",
                                }}
                              />
                              <input
                                type={type}
                                placeholder={placeholder}
                                style={iconInputStyle}
                                value={fieldValues[stateKey]}
                                onChange={(e) =>
                                  setField(stateKey, e.target.value)
                                }
                                onFocus={(e) =>
                                  (e.target.style.borderColor =
                                    C.primaryContainer)
                                }
                                onBlur={(e) =>
                                  (e.target.style.borderColor = C.outlineVar)
                                }
                              />
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technologies Card */}
              <div style={cardStyle}>
                <div style={{ height: 3, background: C.tertiaryContainer }} />
                <div style={{ padding: 24 }}>
                  <h2
                    style={{
                      color: C.onSurface,
                      fontSize: 18,
                      fontWeight: 600,
                      marginBottom: 20,
                    }}
                  >
                    Technologies & Execution Steps
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
                    <div>
                      <label style={labelStyle}>Project overview</label>
                      <textarea
                        rows={2}
                        style={{ ...inputStyle, resize: "vertical" }}
                        placeholder="List software, materials, or hardware utilized (e.g. BIM, Solar Glass, Recycled Steel)..."
                        value={projectOverview}
                        onChange={(e) => setProjectOverview(e.target.value)}
                        onFocus={(e) =>
                          (e.target.style.borderColor = C.primaryContainer)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = C.outlineVar)
                        }
                      />
                    </div>

                    {/* Milestones */}
                    <div>
                      <label style={labelStyle}>Completed Milestones</label>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {milestones.map((ms) => (
                          <MilestoneItem
                            key={ms.id}
                            text={ms.text}
                            onDelete={() => deleteStep(ms.id)}
                          />
                        ))}

                        {/* Add step row */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginTop: 4,
                          }}
                        >
                          <input
                            value={newStep}
                            onChange={(e) => setNewStep(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addStep()}
                            placeholder="Add a new completed step..."
                            style={{
                              flex: 1,
                              background: "transparent",
                              border: "none",
                              borderBottom: `1px solid ${C.outlineVar}`,
                              padding: "6px 0",
                              color: C.onSurface,
                              fontSize: 13,
                              outline: "none",
                              fontFamily: "Inter, sans-serif",
                            }}
                          />
                          <button
                            type="button"
                            onClick={addStep}
                            style={{
                              background: "none",
                              border: "none",
                              color: C.primaryContainer,
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              padding: 0,
                              whiteSpace: "nowrap",
                              fontFamily: "Inter, sans-serif",
                            }}
                          >
                            <Icon name="add" size={18} />
                            Add Step
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase Gallery */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                }}
              >
                {PHASES.map(({ icon, label, num }) => (
                  <div
                    key={label}
                    style={{
                      background: C.surface,
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.08)",
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 14,
                        color: C.onSurfaceVar,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      <Icon name={icon} size={16} />
                      {label}
                    </div>
                    <div
                      style={{
                        aspectRatio: "1",
                        borderRadius: 8,
                        border: `2px dashed ${C.outlineVar}`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.04)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <Icon
                        name="upload_file"
                        size={28}
                        style={{ color: C.outline }}
                      />
                      <span
                        style={{
                          color: C.outline,
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        Upload Phase {num}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right column ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Master Assets */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: 20,
                }}
              >
                <div
                  style={{
                    color: C.onSurfaceVar,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  Master Assets
                </div>

                {/* Cover image */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ ...labelStyle, marginBottom: 10 }}>
                    Main Cover Image
                  </label>
                  <div
                    style={{
                      borderRadius: 6,
                      overflow: "hidden",
                      border: `1px solid ${C.outlineVar}`,
                      aspectRatio: "16/9",
                      background: C.surfaceLow,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.04)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = C.surfaceLow)
                    }
                  >
                    <div style={{ textAlign: "center", color: C.outline }}>
                      <Icon name="add_photo_alternate" size={28} />
                      <div
                        style={{
                          fontSize: 10,
                          marginTop: 6,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Upload Cover
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gallery */}
                <div>
                  <label style={{ ...labelStyle, marginBottom: 10 }}>
                    Project Gallery
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 6,
                    }}
                  >
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          aspectRatio: "1",
                          borderRadius: 4,
                          background: C.surfaceLow,
                          border: `1px solid ${C.outlineVar}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.06)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = C.surfaceLow)
                        }
                      >
                        <Icon
                          name="add_photo_alternate"
                          size={20}
                          style={{ color: C.outline }}
                        />
                      </div>
                    ))}
                    <div
                      style={{
                        aspectRatio: "1",
                        borderRadius: 4,
                        background: C.surfaceLow,
                        border: `1px solid ${C.outlineVar}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          color: C.outline,
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        + More
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Site Context */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: 20,
                }}
              >
                <div
                  style={{
                    color: C.onSurfaceVar,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Site Context
                </div>
                <div
                  style={{
                    borderRadius: 6,
                    height: 120,
                    background: C.surfaceLow,
                    border: `1px solid ${C.outlineVar}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Map grid pattern */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0.15,
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: C.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1,
                      boxShadow: "0 0 0 8px rgba(255,211,205,0.15)",
                    }}
                  >
                    <Icon
                      name="location_on"
                      size={18}
                      style={{ color: C.bg }}
                    />
                  </div>
                </div>
                <p
                  style={{
                    marginTop: 8,
                    textAlign: "center",
                    color: C.outline,
                    fontSize: 9,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Geographic verification pending for site coordinates.
                </p>
              </div>

              {/* Actions */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <button
                  type="button"
                  onClick={() => setPublished(true)}
                  style={{
                    width: "100%",
                    background: published
                      ? C.tertiaryContainer
                      : C.primaryContainer,
                    color: published ? "#002019" : C.bg,
                    border: "none",
                    borderRadius: 8,
                    padding: "14px 0",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "filter 0.2s, background 0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontFamily: "Inter, sans-serif",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.filter = "brightness(1.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.filter = "brightness(1)")
                  }
                >
                  <Icon
                    name={published ? "check_circle" : "publish"}
                    size={20}
                    fill={published ? 1 : 0}
                  />
                  {published ? "Published!" : "Publish Project"}
                </button>

                <button
                  type="button"
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: `1px solid ${C.outlineVar}`,
                    borderRadius: 8,
                    padding: "11px 0",
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.onSurface,
                    cursor: "pointer",
                    transition: "background 0.15s",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: `${C.error}80`,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    padding: "6px 0",
                    transition: "color 0.15s",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.error)}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = `${C.error}80`)
                  }
                >
                  Discard Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
