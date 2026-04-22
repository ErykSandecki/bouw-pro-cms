import { useState, useRef } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Sidebar from "../components/Sidebar";
import MilestoneItem from "../components/MilestoneItem";
import Icon from "../components/Icon";
import { colors as C } from "../theme";
import { useFirebase } from "../contexts/FirebaseContext";
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

const PROJECT_TYPES = [
  "Renovations",
  "New constructions",
  "Huge scale",
] as const;
type ProjectType = (typeof PROJECT_TYPES)[number];

const SUB_OPTIONS: Record<ProjectType, string[]> = {
  Renovations: ["Bathrooms", "Homes", "Annexes", "Luxury finishes"],
  "New constructions": ["Newly built homes", "Luxury finishes", "Annexes"],
  "Huge scale": ["Offices", "Public facilities"],
};

const GOOGLE_TRANSLATE_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_KEY as string;

const LOCALE_TO_LANG: Record<string, string> = {
  "en-AU": "en", "de-AT": "de", "nl-BE": "nl", "pt-BR": "pt",
  "en-BG": "en", "en-CA": "en", "en-HR": "en", "en-CY": "en",
  "en-CZ": "en", "en-DK": "en", "en-EE": "en", "en-FI": "en",
  fr: "fr", de: "de", "en-GI": "en", "en-GR": "en",
  "en-HK": "en", "en-HU": "en", "en-IN": "en", "en-IE": "en",
  it: "it", ja: "ja", "en-LV": "en", "de-LI": "de",
  "en-LT": "en", "fr-LU": "fr", "en-MY": "en", "en-MT": "en",
  "es-MX": "es", nl: "nl", "en-NZ": "en", "en-NO": "en",
  "en-PL": "en", pt: "pt", "en-RO": "en", "en-SG": "en",
  "en-SK": "en", "en-SI": "en", es: "es", "sv-SE": "sv",
  "de-CH": "de", th: "th", "en-AE": "en", "en-GB": "en", en: "en",
};

let nextId = 3;

interface DashboardPageProps {
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const { app } = useFirebase();
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
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverDragOver, setCoverDragOver] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [galleryFiles, setGalleryFiles] = useState<{ file: File; preview: string }[]>([]);
  const [galleryDragOver, setGalleryDragOver] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  type PhaseKey = "Preparation" | "Build Phase" | "Finishing";
  const [phaseFiles, setPhaseFiles] = useState<Record<PhaseKey, { file: File; preview: string }[]>>({
    Preparation: [],
    "Build Phase": [],
    Finishing: [],
  });
  const [phaseDragOver, setPhaseDragOver] = useState<Record<PhaseKey, boolean>>({
    Preparation: false,
    "Build Phase": false,
    Finishing: false,
  });
  const phaseInputRefs = useRef<Record<PhaseKey, HTMLInputElement | null>>({
    Preparation: null,
    "Build Phase": null,
    Finishing: null,
  });
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const setField = (key: keyof typeof fieldValues, value: string) =>
    setFieldValues((prev) => ({ ...prev, [key]: value }));

  const handleCoverFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleGalleryFiles = (files: FileList) => {
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setGalleryFiles((prev) => [
      ...prev,
      ...images.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  };

  const removeGalleryItem = (index: number) => {
    setGalleryFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handlePhaseFiles = (phase: PhaseKey, files: FileList) => {
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setPhaseFiles((prev) => ({
      ...prev,
      [phase]: [...prev[phase], ...images.map((file) => ({ file, preview: URL.createObjectURL(file) }))],
    }));
  };

  const removePhaseItem = (phase: PhaseKey, index: number) => {
    setPhaseFiles((prev) => {
      URL.revokeObjectURL(prev[phase][index].preview);
      return { ...prev, [phase]: prev[phase].filter((_, i) => i !== index) };
    });
  };

  const reqErr = (val: string) =>
    submitted && !val.trim() ? (
      <p style={{ color: "#f28b82", fontSize: 11, margin: "4px 0 0" }}>
        Required!
      </p>
    ) : null;

  const isValid = () =>
    !!projectType &&
    !!projectSubtype &&
    !!title.trim() &&
    !!description.trim() &&
    !!projectOverview.trim() &&
    !!fieldValues.rooms.trim() &&
    !!fieldValues.squareMeters.trim() &&
    !!fieldValues.scheduledCompletion.trim() &&
    !!fieldValues.location.trim();

  const uploadFile = async (storage: ReturnType<typeof getStorage>, path: string, file: File) => {
    const url = await getDownloadURL(await uploadBytes(ref(storage, path), file).then((s) => s.ref));
    return url;
  };

  const handleSave = async (publish: boolean) => {
    setSubmitted(true);
    if (!isValid()) return;
    setSaving(true);
    try {
      const projectId = crypto.randomUUID();
      const storage = getStorage(app);
      const db = getFirestore(app);
      const base = `projects/${projectId}`;

      // 1. Main picture
      let mainPicture = "";
      if (coverImage) {
        setUploadStatus("Uploading main picture…");
        mainPicture = await uploadFile(storage, `${base}/cover/${coverImage.name}`, coverImage);
      }

      // 2. Gallery
      const gallery: string[] = [];
      if (galleryFiles.length > 0) {
        setUploadStatus(`Uploading gallery (0 / ${galleryFiles.length})…`);
        for (let i = 0; i < galleryFiles.length; i++) {
          setUploadStatus(`Uploading gallery (${i + 1} / ${galleryFiles.length})…`);
          const url = await uploadFile(storage, `${base}/gallery/${galleryFiles[i].file.name}`, galleryFiles[i].file);
          gallery.push(url);
        }
      }

      // 3. Phase pictures
      const phases: Record<PhaseKey, string[]> = { Preparation: [], "Build Phase": [], Finishing: [] };
      for (const phase of (["Preparation", "Build Phase", "Finishing"] as PhaseKey[])) {
        const files = phaseFiles[phase];
        if (files.length > 0) {
          setUploadStatus(`Uploading ${phase} phase (0 / ${files.length})…`);
          for (let i = 0; i < files.length; i++) {
            setUploadStatus(`Uploading ${phase} phase (${i + 1} / ${files.length})…`);
            const url = await uploadFile(storage, `${base}/phases/${phase}/${files[i].file.name}`, files[i].file);
            phases[phase].push(url);
          }
        }
      }

      // 4. Translate content
      const milestoneTexts = milestones.map((m) => m.text);
      const sourceTexts = [title, description, projectOverview, fieldValues.location, ...milestoneTexts];
      const byLang: Record<string, string[]> = { nl: sourceTexts };
      if (GOOGLE_TRANSLATE_KEY) {
        setUploadStatus("Translating content…");
        const uniqueLangs = [...new Set(Object.values(LOCALE_TO_LANG))].filter((l) => l !== "nl");
        for (const lang of uniqueLangs) {
          try {
            const res = await fetch(
              `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_KEY}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ q: sourceTexts, source: "nl", target: lang, format: "text" }),
              }
            );
            const data = await res.json();
            byLang[lang] = data.translations.map((t: { translatedText: string }) => t.translatedText);
          } catch {
            byLang[lang] = sourceTexts.map(() => "");
          }
        }
      }
      const locales = Object.keys(LOCALE_TO_LANG);
      const makeT = (idx: number) =>
        Object.fromEntries(locales.map((l) => [l, byLang[LOCALE_TO_LANG[l]]?.[idx] ?? ""]));

      // 5. Save to Firestore
      setUploadStatus("Saving project…");
      await setDoc(doc(db, "projects", projectId), {
        id: projectId,
        projectType,
        projectSubtype,
        title: makeT(0),
        description: makeT(1),
        projectOverview: makeT(2),
        rooms: fieldValues.rooms,
        squareMeters: fieldValues.squareMeters,
        scheduledCompletion: fieldValues.scheduledCompletion,
        location: makeT(3),
        milestones: milestoneTexts.map((_, i) => makeT(4 + i)),
        mainPicture,
        gallery,
        phases,
        published: publish,
        createdAt: new Date().toISOString(),
      });

      if (publish) {
        setPublished(true);
        setTimeout(() => {
          setPublished(false);
          setSubmitted(false);
          setProjectType("");
          setProjectSubtype("");
          setTitle("");
          setDescription("");
          setProjectOverview("");
          setFieldValues({ rooms: "", squareMeters: "", scheduledCompletion: "", location: "" });
          setMilestones([]);
          setCoverImage(null);
          setCoverPreview(null);
          setGalleryFiles([]);
          setPhaseFiles({ Preparation: [], "Build Phase": [], Finishing: [] });
        }, 1500);
      }
    } finally {
      setSaving(false);
      setUploadStatus(null);
    }
  };

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
      {/* Upload progress modal */}
      {uploadStatus && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: "#1e1412",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14,
              padding: "36px 48px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              minWidth: 280,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 40,
                height: 40,
                border: `3px solid rgba(255,255,255,0.12)`,
                borderTopColor: C.primaryContainer,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p
              style={{
                color: C.onSurface,
                fontSize: 14,
                fontWeight: 500,
                textAlign: "center",
                margin: 0,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {uploadStatus}
            </p>
          </div>
        </div>
      )}

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
                        onFocus={(e) =>
                          (e.target.style.borderColor = C.primaryContainer)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = C.outlineVar)
                        }
                      >
                        <option value="" disabled>
                          Select a project type...
                        </option>
                        {PROJECT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      {reqErr(projectType)}
                    </div>

                    {projectType && (
                      <div>
                        <label style={labelStyle}>Project Subtype</label>
                        <select
                          style={selectStyle}
                          value={projectSubtype}
                          onChange={(e) => setProjectSubtype(e.target.value)}
                          onFocus={(e) =>
                            (e.target.style.borderColor = C.primaryContainer)
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = C.outlineVar)
                          }
                        >
                          <option value="" disabled>
                            Select a subtype...
                          </option>
                          {SUB_OPTIONS[projectType].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {reqErr(projectSubtype)}
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
                      {reqErr(title)}
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
                      {reqErr(description)}
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
                            {reqErr(fieldValues[stateKey])}
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
                      {reqErr(projectOverview)}
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
                {PHASES.map(({ icon, label }) => {
                  const phase = label as PhaseKey;
                  const files = phaseFiles[phase];
                  const dragOver = phaseDragOver[phase];
                  return (
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

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        ref={(el) => { phaseInputRefs.current[phase] = el; }}
                        onChange={(e) => { if (e.target.files) handlePhaseFiles(phase, e.target.files); e.target.value = ""; }}
                      />

                      {files.length === 0 ? (
                        <div
                          onClick={() => phaseInputRefs.current[phase]?.click()}
                          onDragOver={(e) => { e.preventDefault(); setPhaseDragOver((p) => ({ ...p, [phase]: true })); }}
                          onDragLeave={() => setPhaseDragOver((p) => ({ ...p, [phase]: false }))}
                          onDrop={(e) => { e.preventDefault(); setPhaseDragOver((p) => ({ ...p, [phase]: false })); if (e.dataTransfer.files) handlePhaseFiles(phase, e.dataTransfer.files); }}
                          style={{
                            borderRadius: 8,
                            border: `2px dashed ${dragOver ? C.primaryContainer : C.outlineVar}`,
                            background: dragOver ? "rgba(255,255,255,0.04)" : "transparent",
                            padding: "20px 0",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 8,
                            cursor: "pointer",
                            transition: "border-color 0.15s, background 0.15s",
                          }}
                        >
                          <Icon name="upload_file" size={24} style={{ color: C.outline }} />
                          <span style={{ color: C.outline, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            {dragOver ? "Drop images" : "Drag & drop or click"}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                            {files.map(({ preview }, i) => (
                              <div key={preview} style={{ position: "relative", aspectRatio: "1", borderRadius: 4, overflow: "hidden" }}>
                                <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                <button
                                  type="button"
                                  onClick={() => removePhaseItem(phase, i)}
                                  style={{
                                    position: "absolute", top: 3, right: 3,
                                    background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%",
                                    width: 20, height: 20, display: "flex", alignItems: "center",
                                    justifyContent: "center", cursor: "pointer", padding: 0,
                                  }}
                                >
                                  <Icon name="close" size={12} style={{ color: "#fff" }} />
                                </button>
                              </div>
                            ))}
                            <div
                              onClick={() => phaseInputRefs.current[phase]?.click()}
                              onDragOver={(e) => { e.preventDefault(); setPhaseDragOver((p) => ({ ...p, [phase]: true })); }}
                              onDragLeave={() => setPhaseDragOver((p) => ({ ...p, [phase]: false }))}
                              onDrop={(e) => { e.preventDefault(); setPhaseDragOver((p) => ({ ...p, [phase]: false })); if (e.dataTransfer.files) handlePhaseFiles(phase, e.dataTransfer.files); }}
                              style={{
                                aspectRatio: "1", borderRadius: 4, cursor: "pointer",
                                background: dragOver ? "rgba(255,255,255,0.06)" : C.surfaceLow,
                                border: `1px dashed ${dragOver ? C.primaryContainer : C.outlineVar}`,
                                display: "flex", flexDirection: "column", alignItems: "center",
                                justifyContent: "center", gap: 3, transition: "border-color 0.15s, background 0.15s",
                              }}
                            >
                              <Icon name="add" size={18} style={{ color: C.outline }} />
                              <span style={{ color: C.outline, fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Add</span>
                            </div>
                          </div>
                          <p style={{ color: C.onSurfaceVar, fontSize: 10, marginTop: 6 }}>
                            {files.length} image{files.length !== 1 ? "s" : ""}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
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
                  Main picture
                </div>

                {/* Cover image */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ ...labelStyle, marginBottom: 10 }}>
                    Main Cover Image
                  </label>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCoverFile(file);
                    }}
                  />
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setCoverDragOver(true);
                    }}
                    onDragLeave={() => setCoverDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setCoverDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleCoverFile(file);
                    }}
                    style={{
                      borderRadius: 6,
                      overflow: "hidden",
                      border: `1px solid ${coverDragOver ? C.primaryContainer : C.outlineVar}`,
                      aspectRatio: "16/9",
                      background: coverDragOver
                        ? "rgba(255,255,255,0.06)"
                        : C.surfaceLow,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "border-color 0.15s, background 0.15s",
                      position: "relative",
                    }}
                  >
                    {coverPreview ? (
                      <>
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,0,0,0.45)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0,
                            transition: "opacity 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.opacity = "1")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.opacity = "0")
                          }
                        >
                          <Icon
                            name="swap_horiz"
                            size={24}
                            style={{ color: "#fff" }}
                          />
                          <span
                            style={{
                              color: "#fff",
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              marginTop: 6,
                            }}
                          >
                            Replace Image
                          </span>
                        </div>
                      </>
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          color: C.outline,
                          pointerEvents: "none",
                        }}
                      >
                        <Icon name="add_photo_alternate" size={28} />
                        <div
                          style={{
                            fontSize: 10,
                            marginTop: 6,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {coverDragOver
                            ? "Drop to upload"
                            : "Drag & drop or click"}
                        </div>
                      </div>
                    )}
                  </div>
                  {coverImage && (
                    <p
                      style={{
                        color: C.onSurfaceVar,
                        fontSize: 11,
                        marginTop: 6,
                      }}
                    >
                      {coverImage.name}
                    </p>
                  )}
                </div>

                {/* Gallery */}
                <div>
                  <label style={{ ...labelStyle, marginBottom: 10 }}>
                    Project Gallery
                  </label>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => { if (e.target.files) handleGalleryFiles(e.target.files); e.target.value = ""; }}
                  />

                  {/* Drop zone — shown when empty or always as "add more" */}
                  {galleryFiles.length === 0 ? (
                    <div
                      onClick={() => galleryInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setGalleryDragOver(true); }}
                      onDragLeave={() => setGalleryDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setGalleryDragOver(false); if (e.dataTransfer.files) handleGalleryFiles(e.dataTransfer.files); }}
                      style={{
                        borderRadius: 6,
                        border: `1px dashed ${galleryDragOver ? C.primaryContainer : C.outlineVar}`,
                        background: galleryDragOver ? "rgba(255,255,255,0.06)" : C.surfaceLow,
                        padding: "24px 0",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        transition: "border-color 0.15s, background 0.15s",
                      }}
                    >
                      <Icon name="add_photo_alternate" size={24} style={{ color: C.outline }} />
                      <span style={{ color: C.outline, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {galleryDragOver ? "Drop images" : "Drag & drop or click"}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {galleryFiles.map(({ preview }, i) => (
                        <div
                          key={preview}
                          style={{ position: "relative", aspectRatio: "1", borderRadius: 4, overflow: "hidden" }}
                        >
                          <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          <button
                            type="button"
                            onClick={() => removeGalleryItem(i)}
                            style={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              background: "rgba(0,0,0,0.6)",
                              border: "none",
                              borderRadius: "50%",
                              width: 22,
                              height: 22,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            <Icon name="close" size={14} style={{ color: "#fff" }} />
                          </button>
                        </div>
                      ))}
                      {/* Always-visible add more tile */}
                      <div
                        onClick={() => galleryInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setGalleryDragOver(true); }}
                        onDragLeave={() => setGalleryDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setGalleryDragOver(false); if (e.dataTransfer.files) handleGalleryFiles(e.dataTransfer.files); }}
                        style={{
                          aspectRatio: "1",
                          borderRadius: 4,
                          background: galleryDragOver ? "rgba(255,255,255,0.06)" : C.surfaceLow,
                          border: `1px dashed ${galleryDragOver ? C.primaryContainer : C.outlineVar}`,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          cursor: "pointer",
                          transition: "border-color 0.15s, background 0.15s",
                        }}
                      >
                        <Icon name="add" size={20} style={{ color: C.outline }} />
                        <span style={{ color: C.outline, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Add more</span>
                      </div>
                    </div>
                  )}
                  {galleryFiles.length > 0 && (
                    <p style={{ color: C.onSurfaceVar, fontSize: 11, marginTop: 6 }}>
                      {galleryFiles.length} image{galleryFiles.length !== 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
