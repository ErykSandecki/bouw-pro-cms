import { useState } from "react";
import Icon from "../components/Icon";
import { colors as C } from "../theme";

interface LoginPageProps {
  onLogin: () => void;
}

const SECURITY_BADGES = [
  { icon: "lock", label: "256-bit Encryption" },
  { icon: "verified_user", label: "Verified Session" },
];

const labelStyle: React.CSSProperties = {
  display: "block",
  color: C.onSurfaceVar,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  marginBottom: 6,
};

const iconStyle: React.CSSProperties = {
  position: "absolute",
  left: 14,
  top: "50%",
  transform: "translateY(-50%)",
  color: C.outline,
  pointerEvents: "none",
};

interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  placeholder: string;
  icon: string;
  focused: boolean;
  onChange: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  value,
  placeholder,
  icon,
  focused,
  onChange,
  onFocus,
  onBlur,
}) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <div style={{ position: "relative" }}>
      <Icon name={icon} size={18} style={iconStyle} />
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          width: "100%",
          background: C.surfaceHighest,
          borderRadius: 6,
          padding: "11px 14px 11px 42px",
          color: C.onSurface,
          fontSize: 14,
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "Inter, sans-serif",
          transition: "border-color 0.2s",
          border: `1px solid ${focused ? C.primaryContainer : C.outlineVar}`,
        }}
      />
    </div>
  </div>
);

const BrandingPanel: React.FC = () => (
  <div
    style={{
      backgroundColor: C.bgBrand,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: 40,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(135deg, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(0,0,0,0.5) 100%)",
        pointerEvents: "none",
      }}
    />

    <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>
      <Icon name="shield_person" size={32} style={{ color: C.primaryContainer }} />
      <span style={{ color: C.primaryContainer, fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>
        BouwPro
      </span>
    </div>

    <div style={{ position: "relative", zIndex: 1 }}>
      <h2
        style={{
          color: "#fff",
          fontSize: 36,
          fontWeight: 700,
          lineHeight: "44px",
          letterSpacing: "-0.02em",
          marginBottom: 12,
        }}
      >
        Administrative Control
      </h2>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: "24px", maxWidth: 320 }}>
        Secure access point for global project management and asset distribution.
        Enterprise-grade content governance.
      </p>
    </div>

    <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 24 }}>
      {SECURITY_BADGES.map(({ icon, label }) => (
        <div key={icon} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.45)" }}>
          <Icon name={icon} size={14} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSubmit = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: C.bgBrand,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          overflow: "hidden",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
        }}
      >
        <BrandingPanel />

        <div
          style={{
            backgroundColor: C.surface,
            borderLeft: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ color: C.onSurface, fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
              Sign In
            </h3>
            <p style={{ color: C.onSurfaceVar, fontSize: 13 }}>
              Enter your credentials to access the management suite.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <InputField
              label="Email"
              type="text"
              value={email}
              placeholder="admin@bouwpro.com"
              icon="person"
              focused={emailFocused}
              onChange={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />

            <InputField
              label="Password"
              type="password"
              value={password}
              placeholder="••••••••••••"
              icon="lock"
              focused={passwordFocused}
              onChange={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%",
                background: C.primaryContainer,
                color: C.bg,
                border: "none",
                borderRadius: 8,
                padding: "13px 0",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.02em",
                cursor: loading ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: loading ? 0.85 : 1,
                transition: "opacity 0.2s, filter 0.2s",
                fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.filter = "brightness(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      border: `2px solid ${C.onPrimaryContainer}`,
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Authenticating...
                </>
              ) : (
                <>
                  <Icon name="login" size={18} />
                  Authenticate Access
                </>
              )}
            </button>

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.07)",
                paddingTop: 20,
              }}
            >
              <p style={{ textAlign: "center", color: C.outlineVar, fontSize: 11 }}>
                Authorized Personnel Only. Access is monitored under BouwPro Compliance Policies.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoginPage;
