import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import { colors as C } from "../theme";
import { useFirebase } from "../contexts/FirebaseContext";

type PhaseKey = "preparation" | "buildPhase" | "finishing";

type ImageItem =
  | { kind: "existing"; url: string }
  | { kind: "new"; file: File; preview: string };

interface ProjectPicturesPageProps {
  onLogout: () => void;
}

const PHASES: PhaseKey[] = ["preparation", "buildPhase", "finishing"];

const PHASE_LABELS: Record<PhaseKey, string> = {
  preparation: "Preparation",
  buildPhase: "Build Phase",
  finishing: "Finishing",
};

const sectionCard: React.CSSProperties = {
  background: C.surface,
  borderRadius: 10,
  border: `1px solid ${C.outlineVar}`,
  padding: "24px",
};

const sectionTitle: React.CSSProperties = {
  color: C.onSurfaceVar,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginBottom: 16,
};

const ProjectPicturesPage: React.FC<ProjectPicturesPageProps> = ({
  onLogout,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { app } = useFirebase();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Main cover
  const [coverItem, setCoverItem] = useState<ImageItem | null>(null);
  const [coverDragOver, setCoverDragOver] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Gallery
  const [galleryItems, setGalleryItems] = useState<ImageItem[]>([]);
  const [galleryDragOver, setGalleryDragOver] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Phases
  const [phaseItems, setPhaseItems] = useState<Record<PhaseKey, ImageItem[]>>({
    preparation: [],
    buildPhase: [],
    finishing: [],
  });
  const [phaseDragOver, setPhaseDragOver] = useState<Record<PhaseKey, boolean>>(
    {
      preparation: false,
      buildPhase: false,
      finishing: false,
    },
  );
  const phaseInputRefs = useRef<Record<PhaseKey, HTMLInputElement | null>>({
    preparation: null,
    buildPhase: null,
    finishing: null,
  });
  const removedUrls = useRef<string[]>([]);

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
        if (d.mainPicture)
          setCoverItem({ kind: "existing", url: d.mainPicture });
        setGalleryItems(
          (d.gallery ?? []).map((url: string) => ({ kind: "existing", url })),
        );
        setPhaseItems({
          preparation: (d.phases?.preparation ?? []).map((url: string) => ({
            kind: "existing",
            url,
          })),
          buildPhase: (d.phases?.buildPhase ?? []).map(
            (url: string) => ({ kind: "existing", url }),
          ),
          finishing: (d.phases?.finishing ?? []).map((url: string) => ({
            kind: "existing",
            url,
          })),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, app]);

  const handleCoverFile = (file: File) => {
    if (coverItem?.kind === "new") URL.revokeObjectURL(coverItem.preview);
    else if (coverItem?.kind === "existing") removedUrls.current.push(coverItem.url);
    setCoverItem({ kind: "new", file, preview: URL.createObjectURL(file) });
  };

  const handleGalleryFiles = (files: FileList) => {
    const newItems: ImageItem[] = Array.from(files).map((f) => ({
      kind: "new",
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setGalleryItems((prev) => [...prev, ...newItems]);
  };

  const removeGalleryItem = (index: number) => {
    setGalleryItems((prev) => {
      const item = prev[index];
      if (item.kind === "new") URL.revokeObjectURL(item.preview);
      else removedUrls.current.push(item.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handlePhaseFiles = (phase: PhaseKey, files: FileList) => {
    const newItems: ImageItem[] = Array.from(files).map((f) => ({
      kind: "new",
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setPhaseItems((prev) => ({
      ...prev,
      [phase]: [...prev[phase], ...newItems],
    }));
  };

  const removePhaseItem = (phase: PhaseKey, index: number) => {
    setPhaseItems((prev) => {
      const item = prev[phase][index];
      if (item.kind === "new") URL.revokeObjectURL(item.preview);
      else removedUrls.current.push(item.url);
      return { ...prev, [phase]: prev[phase].filter((_, i) => i !== index) };
    });
  };

  const uploadFile = async (
    storage: ReturnType<typeof getStorage>,
    path: string,
    file: File,
  ) => getDownloadURL((await uploadBytes(ref(storage, path), file)).ref);

  const storagePath = (url: string) =>
    decodeURIComponent(url.split("/o/")[1].split("?")[0]);

  const resolveItems = async (
    storage: ReturnType<typeof getStorage>,
    items: ImageItem[],
    basePath: string,
    onProgress?: (i: number, total: number) => void,
  ): Promise<string[]> => {
    const urls: string[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      onProgress?.(i + 1, items.length);
      if (item.kind === "existing") {
        urls.push(item.url);
      } else {
        urls.push(
          await uploadFile(storage, `${basePath}/${item.file.name}`, item.file),
        );
      }
    }
    return urls;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const storage = getStorage(app);
      const db = getFirestore(app);
      const base = `projects/${id}`;

      // Main picture
      let mainPicture = "";
      if (coverItem) {
        if (coverItem.kind === "existing") {
          mainPicture = coverItem.url;
        } else {
          setSaveStatus("Uploading main picture…");
          mainPicture = await uploadFile(
            storage,
            `${base}/cover/${coverItem.file.name}`,
            coverItem.file,
          );
        }
      }

      // Gallery
      const hasNewGallery = galleryItems.some((i) => i.kind === "new");
      let gallery: string[];
      if (hasNewGallery) {
        gallery = await resolveItems(
          storage,
          galleryItems,
          `${base}/gallery`,
          (i, total) => setSaveStatus(`Uploading gallery (${i} / ${total})…`),
        );
      } else {
        gallery = galleryItems.map(
          (i) => (i as { kind: "existing"; url: string }).url,
        );
      }

      // Phases
      const phases: Record<PhaseKey, string[]> = {
        preparation: [],
        buildPhase: [],
        finishing: [],
      };
      for (const phase of PHASES) {
        const hasNew = phaseItems[phase].some((i) => i.kind === "new");
        if (hasNew) {
          phases[phase] = await resolveItems(
            storage,
            phaseItems[phase],
            `${base}/phases/${phase}`,
            (i, total) =>
              setSaveStatus(`Uploading ${phase} (${i} / ${total})…`),
          );
        } else {
          phases[phase] = phaseItems[phase].map(
            (i) => (i as { kind: "existing"; url: string }).url,
          );
        }
      }

      setSaveStatus("Saving…");
      await updateDoc(doc(db, "projects", id!), { mainPicture, gallery, phases });

      if (removedUrls.current.length > 0) {
        setSaveStatus("Cleaning up old files…");
        await Promise.allSettled(
          removedUrls.current.map((url) => deleteObject(ref(storage, storagePath(url)))),
        );
        removedUrls.current = [];
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
      setSaveStatus(null);
    }
  };

  const previewSrc = (item: ImageItem) =>
    item.kind === "existing" ? item.url : item.preview;

  const ImageGrid = ({
    items,
    onRemove,
    onAdd,
    dragOver,
    onDragOver,
    onDragLeave,
    onDrop,
  }: {
    items: ImageItem[];
    onRemove: (i: number) => void;
    onAdd: () => void;
    dragOver: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
  }) => (
    <>
      {items.length === 0 ? (
        <div
          onClick={onAdd}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          style={{
            borderRadius: 6,
            border: `1px dashed ${dragOver ? C.primaryContainer : C.outlineVar}`,
            background: dragOver ? "rgba(255,255,255,0.06)" : C.surfaceLow,
            padding: "28px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            transition: "border-color 0.15s, background 0.15s",
          }}
        >
          <Icon
            name="add_photo_alternate"
            size={24}
            style={{ color: C.outline }}
          />
          <span
            style={{
              color: C.outline,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {dragOver ? "Drop images" : "Drag & drop or click"}
          </span>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: 6,
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                aspectRatio: "1",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <img
                src={previewSrc(item)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
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
          <div
            onClick={onAdd}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            style={{
              aspectRatio: "1",
              borderRadius: 6,
              background: dragOver ? "rgba(255,255,255,0.06)" : C.surfaceLow,
              border: `1px dashed ${dragOver ? C.primaryContainer : C.outlineVar}`,
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
            <span
              style={{
                color: C.outline,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Add
            </span>
          </div>
        </div>
      )}
    </>
  );

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
            onClick={() => navigate(`/project-details/${id}`)}
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
            Back to details
          </button>
          <span style={{ color: C.outlineVar }}>·</span>
          <h1
            style={{
              color: C.onSurface,
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
            }}
          >
            Edit Pictures
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 720,
          }}
        >
          {/* Main cover */}
          <div style={sectionCard}>
            <div style={sectionTitle}>Main Cover Image</div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleCoverFile(f);
                e.target.value = "";
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
                const f = e.dataTransfer.files?.[0];
                if (f) handleCoverFile(f);
              }}
              style={{
                borderRadius: 8,
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
              {coverItem ? (
                <>
                  <img
                    src={previewSrc(coverItem)}
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
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
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
                    {coverDragOver ? "Drop to upload" : "Drag & drop or click"}
                  </div>
                </div>
              )}
            </div>
            {coverItem && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (coverItem.kind === "new") URL.revokeObjectURL(coverItem.preview);
                  else removedUrls.current.push(coverItem.url);
                  setCoverItem(null);
                }}
                style={{
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: C.error,
                  fontSize: 12,
                  fontFamily: "Inter, sans-serif",
                  padding: 0,
                }}
              >
                <Icon name="delete" size={14} />
                Remove
              </button>
            )}
          </div>

          {/* Gallery */}
          <div style={sectionCard}>
            <div style={sectionTitle}>Project Gallery</div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files) handleGalleryFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <ImageGrid
              items={galleryItems}
              onRemove={removeGalleryItem}
              onAdd={() => galleryInputRef.current?.click()}
              dragOver={galleryDragOver}
              onDragOver={(e) => {
                e.preventDefault();
                setGalleryDragOver(true);
              }}
              onDragLeave={() => setGalleryDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setGalleryDragOver(false);
                if (e.dataTransfer.files)
                  handleGalleryFiles(e.dataTransfer.files);
              }}
            />
          </div>

          {/* Phases */}
          {PHASES.map((phase) => (
            <div key={phase} style={sectionCard}>
              <div style={sectionTitle}>{PHASE_LABELS[phase]}</div>
              <input
                ref={(el) => {
                  phaseInputRefs.current[phase] = el;
                }}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files) handlePhaseFiles(phase, e.target.files);
                  e.target.value = "";
                }}
              />
              <ImageGrid
                items={phaseItems[phase]}
                onRemove={(i) => removePhaseItem(phase, i)}
                onAdd={() => phaseInputRefs.current[phase]?.click()}
                dragOver={phaseDragOver[phase]}
                onDragOver={(e) => {
                  e.preventDefault();
                  setPhaseDragOver((p) => ({ ...p, [phase]: true }));
                }}
                onDragLeave={() =>
                  setPhaseDragOver((p) => ({ ...p, [phase]: false }))
                }
                onDrop={(e) => {
                  e.preventDefault();
                  setPhaseDragOver((p) => ({ ...p, [phase]: false }));
                  if (e.dataTransfer.files)
                    handlePhaseFiles(phase, e.dataTransfer.files);
                }}
              />
            </div>
          ))}

          {/* Save */}
          <div style={{ paddingBottom: 40 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: "100%",
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
                (saveStatus ?? "Saving…")
              ) : saved ? (
                <>
                  <Icon name="check" size={18} />
                  Saved!
                </>
              ) : (
                "Save Pictures"
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectPicturesPage;
