import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import MilestoneItem from "../components/MilestoneItem";
import Icon from "../components/Icon";
import { colors as C } from "../theme";
import { useFirebase } from "../contexts/FirebaseContext";
import type { Milestone } from "../types";
import { LOCALE_TO_LANG, PROJECT_TYPES, SUB_OPTIONS, type ProjectType } from "../constants";


const GOOGLE_TRANSLATE_KEY = import.meta.env
  .VITE_GOOGLE_TRANSLATE_KEY as string;

interface ProjectDetailsPageProps {
  onLogout: () => void;
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: C.onSurfaceVar,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: C.surfaceLow,
  border: `1px solid ${C.outlineVar}`,
  borderRadius: 6,
  color: C.onSurface,
  fontSize: 13,
  padding: "10px 12px",
  fontFamily: "Inter, sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

let nextMilestoneId = 100;

const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({
  onLogout,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { app } = useFirebase();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const [projectType, setProjectType] = useState<ProjectType | "">("");
  const [projectSubtype, setProjectSubtype] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectOverview, setProjectOverview] = useState("");
  const [rooms, setRooms] = useState("");
  const [squareMeters, setSquareMeters] = useState("");
  const [scheduledCompletion, setScheduledCompletion] = useState("");
  const [location, setLocation] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newStep, setNewStep] = useState("");
  const [published, setPublished] = useState(false);

  const newStepRef = useRef<HTMLInputElement>(null);
  const origTranslatable = useRef({ title: "", description: "", projectOverview: "", location: "", milestoneTexts: [] as string[] });

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      try {
        const db = getFirestore(app);
        const snap = await getDoc(doc(db, "projects", id));
        if (!snap.exists()) {
          navigate("/projects", { replace: true });
          return;
        }
        const d = snap.data();
        setProjectType(d.projectType ?? "");
        setProjectSubtype(d.projectSubtype ?? "");
        setTitle(d.title?.nl ?? "");
        setDescription(d.description?.nl ?? "");
        setProjectOverview(d.projectOverview?.nl ?? "");
        setRooms(d.rooms ?? "");
        setSquareMeters(d.squareMeters ?? "");
        setScheduledCompletion(d.scheduledCompletion ?? "");
        setLocation(d.location?.nl ?? "");
        const loadedMilestones = (d.milestones ?? []).map((m: Record<string, string>) => ({
          id: nextMilestoneId++,
          text: m.nl ?? m.en ?? Object.values(m)[0] ?? "",
        }));
        setMilestones(loadedMilestones);
        setPublished(d.published ?? false);

        origTranslatable.current = {
          title: d.title?.nl ?? "",
          description: d.description?.nl ?? "",
          projectOverview: d.projectOverview?.nl ?? "",
          location: d.location?.nl ?? "",
          milestoneTexts: loadedMilestones.map((m: Milestone) => m.text),
        };
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, app]);

  const isValid = () =>
    !!projectType &&
    !!projectSubtype &&
    !!title.trim() &&
    !!description.trim() &&
    !!projectOverview.trim() &&
    !!rooms.trim() &&
    !!squareMeters.trim() &&
    !!scheduledCompletion.trim() &&
    !!location.trim();

  const reqErr = (val: string) =>
    submitted && !val.trim() ? (
      <p style={{ color: "#f28b82", fontSize: 11, margin: "4px 0 0" }}>
        Required!
      </p>
    ) : null;

  const addStep = () => {
    const trimmed = newStep.trim();
    if (!trimmed) return;
    setMilestones((m) => [...m, { id: nextMilestoneId++, text: trimmed }]);
    setNewStep("");
    newStepRef.current?.focus();
  };

  const handleSave = async () => {
    setSubmitted(true);
    if (!isValid()) return;
    setSaving(true);
    try {
      const db = getFirestore(app);
      const milestoneTexts = milestones.map((m) => m.text);
      const orig = origTranslatable.current;

      const translatableChanged =
        title !== orig.title ||
        description !== orig.description ||
        projectOverview !== orig.projectOverview ||
        location !== orig.location ||
        JSON.stringify(milestoneTexts) !== JSON.stringify(orig.milestoneTexts);

      const baseUpdate = { projectType, projectSubtype, rooms, squareMeters, scheduledCompletion, published };

      if (translatableChanged) {
        const sourceTexts = [title, description, projectOverview, location, ...milestoneTexts];
        const byLang: Record<string, string[]> = { nl: sourceTexts };

        if (GOOGLE_TRANSLATE_KEY) {
          setSaveStatus("Translating content…");
          const uniqueLangs = [...new Set(Object.values(LOCALE_TO_LANG))].filter((l) => l !== "nl");
          for (const lang of uniqueLangs) {
            try {
              const res = await fetch(
                `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_KEY}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ q: sourceTexts, source: "nl", target: lang, format: "text" }),
                },
              );
              const data = await res.json();
              byLang[lang] = data.data.translations.map((t: { translatedText: string }) => t.translatedText);
            } catch {
              byLang[lang] = sourceTexts.map(() => "");
            }
          }
        }

        const locales = Object.keys(LOCALE_TO_LANG);
        const makeT = (idx: number) =>
          Object.fromEntries(locales.map((l) => [l, byLang[LOCALE_TO_LANG[l]]?.[idx] ?? ""]));

        setSaveStatus("Saving…");
        await updateDoc(doc(db, "projects", id!), {
          ...baseUpdate,
          title: makeT(0),
          description: makeT(1),
          projectOverview: makeT(2),
          location: makeT(3),
          milestones: milestoneTexts.map((_, i) => makeT(4 + i)),
        });

        origTranslatable.current = { title, description, projectOverview, location, milestoneTexts };
      } else {
        setSaveStatus("Saving…");
        await updateDoc(doc(db, "projects", id!), baseUpdate);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
      setSaveStatus(null);
    }
  };

  const sectionCard: React.CSSProperties = {
    background: C.surface,
    borderRadius: 10,
    border: `1px solid ${C.outlineVar}`,
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  };

  const sectionTitle: React.CSSProperties = {
    color: C.onSurfaceVar,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 4,
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          background: C.bg,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <Sidebar onLogout={onLogout} />
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: C.onSurfaceVar, fontSize: 13 }}>Loading…</span>
        </main>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: C.bg,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Sidebar onLogout={onLogout} />

      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px 40px",
          minWidth: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
          }}
        >
          <button
            onClick={() => navigate("/projects")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: C.onSurfaceVar,
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              padding: 0,
            }}
          >
            <Icon name="arrow_back" size={18} />
            Back
          </button>
          <span style={{ color: C.outlineVar }}>·</span>
          <h1
            style={{
              color: C.onSurface,
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
              flex: 1,
            }}
          >
            Edit Project
          </h1>
          <button
            onClick={() => navigate(`/project-pictures/${id}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: C.surfaceHigh,
              border: `1px solid ${C.outlineVar}`,
              borderRadius: 8,
              color: C.onSurfaceVar,
              fontSize: 13,
              fontWeight: 600,
              padding: "8px 16px",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            <Icon name="photo_library" size={16} />
            Edit Pictures
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 720,
          }}
        >
          {/* Type & subtype */}
          <div style={sectionCard}>
            <div style={sectionTitle}>Classification</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <div>
                <label style={labelStyle}>Project Type</label>
                <select
                  value={projectType}
                  onChange={(e) => {
                    setProjectType(e.target.value as ProjectType);
                    setProjectSubtype("");
                  }}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">Select type…</option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {submitted && !projectType && (
                  <p
                    style={{
                      color: "#f28b82",
                      fontSize: 11,
                      margin: "4px 0 0",
                    }}
                  >
                    Required!
                  </p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Subtype</label>
                <select
                  value={projectSubtype}
                  onChange={(e) => setProjectSubtype(e.target.value)}
                  disabled={!projectType}
                  style={{
                    ...inputStyle,
                    cursor: projectType ? "pointer" : "not-allowed",
                    opacity: projectType ? 1 : 0.5,
                  }}
                >
                  <option value="">Select subtype…</option>
                  {projectType &&
                    SUB_OPTIONS[projectType].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </select>
                {submitted && !projectSubtype && (
                  <p
                    style={{
                      color: "#f28b82",
                      fontSize: 11,
                      margin: "4px 0 0",
                    }}
                  >
                    Required!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Text content */}
          <div style={sectionCard}>
            <div style={sectionTitle}>
              Content (Dutch — auto-translated on save)
            </div>
            <div>
              <label style={labelStyle}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
              />
              {reqErr(title)}
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
              {reqErr(description)}
            </div>
            <div>
              <label style={labelStyle}>Project Overview</label>
              <textarea
                value={projectOverview}
                onChange={(e) => setProjectOverview(e.target.value)}
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />
              {reqErr(projectOverview)}
            </div>
          </div>

          {/* Details */}
          <div style={sectionCard}>
            <div style={sectionTitle}>Details</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <div>
                <label style={labelStyle}>Rooms</label>
                <input
                  type="number"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  style={inputStyle}
                />
                {reqErr(rooms)}
              </div>
              <div>
                <label style={labelStyle}>Square Meters (m²)</label>
                <input
                  type="number"
                  value={squareMeters}
                  onChange={(e) => setSquareMeters(e.target.value)}
                  style={inputStyle}
                />
                {reqErr(squareMeters)}
              </div>
              <div>
                <label style={labelStyle}>Scheduled Completion</label>
                <input
                  type="date"
                  value={scheduledCompletion}
                  onChange={(e) => setScheduledCompletion(e.target.value)}
                  style={{ ...inputStyle, colorScheme: "dark" }}
                />
                {reqErr(scheduledCompletion)}
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={inputStyle}
                />
                {reqErr(location)}
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div style={sectionCard}>
            <div style={sectionTitle}>Milestones</div>
            {milestones.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {milestones.map((m) => (
                  <MilestoneItem
                    key={m.id}
                    text={m.text}
                    onDelete={() =>
                      setMilestones((prev) => prev.filter((x) => x.id !== m.id))
                    }
                  />
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                ref={newStepRef}
                type="text"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addStep()}
                placeholder="Add milestone…"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={addStep}
                disabled={!newStep.trim()}
                style={{
                  background: newStep.trim()
                    ? C.primaryContainer
                    : C.surfaceLow,
                  border: "none",
                  borderRadius: 6,
                  cursor: newStep.trim() ? "pointer" : "default",
                  color: newStep.trim() ? C.onPrimaryContainer : C.outline,
                  padding: "0 16px",
                  height: 40,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "background 0.15s",
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Publish toggle */}
          <div style={sectionCard}>
            <div style={sectionTitle}>Visibility</div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
              }}
            >
              <div
                onClick={() => setPublished((p) => !p)}
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 99,
                  background: published ? C.primaryContainer : C.outlineVar,
                  position: "relative",
                  transition: "background 0.2s",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 3,
                    left: published ? 21 : 3,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: published ? C.onPrimaryContainer : C.outline,
                    transition: "left 0.2s",
                  }}
                />
              </div>
              <span style={{ color: C.onSurface, fontSize: 13 }}>
                {published ? "Published" : "Draft"}
              </span>
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingBottom: 40 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 8,
                border: "none",
                background: saved ? C.tertiaryContainer : C.primaryContainer,
                color: saved ? "#1a3530" : C.bg,
                fontSize: 14,
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "background 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {saving ? (
                <>{saveStatus ?? "Saving…"}</>
              ) : saved ? (
                <>
                  <Icon name="check" size={18} />
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetailsPage;
