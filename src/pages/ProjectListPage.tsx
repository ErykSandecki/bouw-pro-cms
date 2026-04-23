import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import { colors as C } from "../theme";
import { useFirebase } from "../contexts/FirebaseContext";
import { PROJECT_TYPES } from "../constants";

interface Project {
  id: string;
  title: Record<string, string>;
  projectType: string;
  projectSubtype: string;
  location: Record<string, string>;
  published: boolean;
  createdAt: string;
  scheduledCompletion?: string;
  mainPicture?: string;
  favourite?: boolean;
}

interface ProjectListPageProps {
  onLogout: () => void;
}

const PAGE_SIZE = 10;


const inputStyle: React.CSSProperties = {
  background: C.surfaceLow,
  border: `1px solid ${C.outlineVar}`,
  borderRadius: 6,
  color: C.onSurface,
  fontSize: 13,
  padding: "8px 12px",
  fontFamily: "Inter, sans-serif",
  outline: "none",
  height: 36,
  boxSizing: "border-box",
};

const pageNavBtn = (disabled: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: 6,
  border: `1px solid ${C.outlineVar}`,
  background: "transparent",
  color: disabled ? C.outline : C.onSurfaceVar,
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.4 : 1,
  fontFamily: "Inter, sans-serif",
  transition: "background 0.15s",
});

const ProjectListPage: React.FC<ProjectListPageProps> = ({ onLogout }) => {
  const { app } = useFirebase();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [hoveredStar, setHoveredStar] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const db = getFirestore(app);
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setProjects(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Project)));
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [app]);

  const toggleFavourite = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    const db = getFirestore(app);
    const next = !project.favourite;
    await updateDoc(doc(db, "projects", project.id), { favourite: next });
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, favourite: next } : p))
    );
  };

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const title = (p.title?.nl || p.title?.en || "").toLowerCase();
      if (nameFilter && !title.includes(nameFilter.toLowerCase())) return false;
      if (typeFilter && p.projectType !== typeFilter) return false;
      if (dateFrom && (p.scheduledCompletion ?? "") < dateFrom) return false;
      if (dateTo && (p.scheduledCompletion ?? "") > dateTo) return false;
      return true;
    });
  }, [projects, nameFilter, typeFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const hasFilters = nameFilter || typeFilter || dateFrom || dateTo;

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "Inter, sans-serif" }}>
      <Sidebar onLogout={onLogout} />

      <main style={{ flex: 1, overflowY: "auto", padding: "32px 40px", minWidth: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ color: C.onSurface, fontSize: 22, fontWeight: 700, margin: 0 }}>
            Projects
          </h1>
          <p style={{ color: C.onSurfaceVar, fontSize: 13, margin: "6px 0 0" }}>
            All submitted projects
          </p>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          {/* Name search */}
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
            <Icon
              name="search"
              size={16}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: C.outline,
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search by name…"
              value={nameFilter}
              onChange={(e) => { setNameFilter(e.target.value); resetPage(); }}
              style={{ ...inputStyle, width: "100%", paddingLeft: 32 }}
            />
          </div>

          {/* Project type */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); resetPage(); }}
            style={{ ...inputStyle, flex: "0 0 auto", minWidth: 160, cursor: "pointer" }}
          >
            <option value="">All types</option>
            {PROJECT_TYPES.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Date from */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "0 0 auto" }}>
            <span style={{ color: C.outline, fontSize: 12, whiteSpace: "nowrap" }}>From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); resetPage(); }}
              style={{ ...inputStyle, width: 140, colorScheme: "dark" }}
            />
          </div>

          {/* Date to */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "0 0 auto" }}>
            <span style={{ color: C.outline, fontSize: 12, whiteSpace: "nowrap" }}>To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); resetPage(); }}
              style={{ ...inputStyle, width: 140, colorScheme: "dark" }}
            />
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={() => { setNameFilter(""); setTypeFilter(""); setDateFrom(""); setDateTo(""); resetPage(); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "transparent",
                border: `1px solid ${C.outlineVar}`,
                borderRadius: 6,
                color: C.outline,
                fontSize: 12,
                padding: "0 12px",
                height: 36,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              <Icon name="close" size={14} />
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ color: C.onSurfaceVar, fontSize: 13 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 0",
              color: C.outline,
              gap: 12,
            }}
          >
            <Icon name="folder_open" size={40} />
            <span style={{ fontSize: 14 }}>{hasFilters ? "No projects match your filters" : "No projects yet"}</span>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {paginated.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/project-details/${project.id}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    background: C.surface,
                    borderRadius: 8,
                    padding: "14px 18px",
                    border: `1px solid ${C.outlineVar}`,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceHigh)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = C.surface)}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 6,
                      overflow: "hidden",
                      flexShrink: 0,
                      background: C.surfaceLow,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {project.mainPicture ? (
                      <img
                        src={project.mainPicture}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Icon name="image" size={22} style={{ color: C.outline }} />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: C.onSurface, fontSize: 14, fontWeight: 600, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {project.title?.nl || project.title?.en || "Untitled"}
                    </div>
                    <div style={{ color: C.onSurfaceVar, fontSize: 12, display: "flex", gap: 12 }}>
                      <span>{project.projectType}</span>
                      {project.projectSubtype && <span>· {project.projectSubtype}</span>}
                      {project.location?.nl && <span>· {project.location.nl}</span>}
                    </div>
                  </div>

                  {/* Favourite */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <button
                      onClick={(e) => toggleFavourite(e, project)}
                      onMouseEnter={() => setHoveredStar(project.id)}
                      onMouseLeave={() => setHoveredStar(null)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: project.favourite || hoveredStar === project.id ? "#F5C518" : C.outline,
                        transition: "color 0.15s",
                      }}
                    >
                      <Icon name={project.favourite || hoveredStar === project.id ? "star" : "star_border"} size={20} />
                    </button>
                    {hoveredStar === project.id && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "calc(100% + 6px)",
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: C.onSurface,
                          color: C.surface,
                          fontSize: 11,
                          fontWeight: 500,
                          padding: "4px 8px",
                          borderRadius: 4,
                          whiteSpace: "nowrap",
                          pointerEvents: "none",
                          zIndex: 10,
                        }}
                      >
                        {project.favourite ? "Remove from favourites" : "Mark as favourite"}
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  <div
                    style={{
                      padding: "3px 10px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      background: project.published ? "rgba(149, 204, 187, 0.15)" : "rgba(255,255,255,0.06)",
                      color: project.published ? C.tertiaryContainer : C.outline,
                      flexShrink: 0,
                    }}
                  >
                    {project.published ? "Published" : "Draft"}
                  </div>

                  {/* Scheduled completion */}
                  <div style={{ color: C.outline, fontSize: 11, flexShrink: 0 }}>
                    {project.scheduledCompletion
                      ? new Date(project.scheduledCompletion).toLocaleDateString("nl-NL")
                      : "—"}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 24,
              }}
            >
              <span style={{ color: C.outline, fontSize: 12 }}>
                {filtered.length === 0
                  ? "0 results"
                  : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button style={pageNavBtn(page === 1)} disabled={page === 1} onClick={() => setPage(1)} title="First page">
                  <Icon name="first_page" size={16} />
                </button>
                <button style={pageNavBtn(page === 1)} disabled={page === 1} onClick={() => setPage((p) => p - 1)} title="Previous page">
                  <Icon name="chevron_left" size={16} />
                </button>
                <span style={{ color: C.onSurfaceVar, fontSize: 13, padding: "0 8px" }}>
                  {page} / {totalPages}
                </span>
                <button style={pageNavBtn(page === totalPages)} disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} title="Next page">
                  <Icon name="chevron_right" size={16} />
                </button>
                <button style={pageNavBtn(page === totalPages)} disabled={page === totalPages} onClick={() => setPage(totalPages)} title="Last page">
                  <Icon name="last_page" size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ProjectListPage;
