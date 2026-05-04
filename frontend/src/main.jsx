import React from "react";
import ReactDOM from "react-dom/client";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Droplets,
  FileImage,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  MessageCircle,
  Moon,
  PackagePlus,
  PauseCircle,
  PlayCircle,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Truck,
  Trash2,
  UserRoundSearch,
  UserPlus,
  UploadCloud,
  XCircle
} from "lucide-react";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
const PHONE_RULE_TEXT = "Phone must be exactly 10 digits.";
const PASSWORD_RULE_TEXT = "Password must be at least 6 characters and include at least 1 number and 1 special character.";
const PHONE_REGEX = /^\d{10}$/;
const STRONG_PASSWORD_REGEX = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

const initialLoginForm = { loginId: "", password: "" };
const initialCustomerForm = { name: "", phone: "", email: "", password: "" };
const initialDriverForm = { name: "", phone: "", email: "", password: "" };
const initialAdminForm = { username: "", currentPassword: "", newPassword: "" };
const initialOrderForm = {
  deliveryAddress: "",
  quantityOption: "2000",
  customLitres: "",
  notes: "",
  preferredDriverId: ""
};
const initialSubscriptionForm = {
  deliveryAddress: "",
  quantityOption: "2000",
  customLitres: "",
  notes: "",
  frequency: "weekly",
  startDate: new Date().toISOString().slice(0, 10)
};
const initialComplaintForm = {
  orderId: "",
  message: ""
};
const subscriptionFrequencies = [
  { value: "daily", label: "Daily" },
  { value: "alternate_day", label: "Alternate day" },
  { value: "weekly", label: "Weekly" }
];
const sliderImages = [
  "https://res.cloudinary.com/dilsongvx/image/upload/q_auto/f_auto/v1777907124/Shilloi_Lake_trvwxh_1506059926t_ea5r77.jpg",
  "https://res.cloudinary.com/dilsongvx/image/upload/q_auto/f_auto/v1777907124/Nagaland_s8jvs6.avif",
  "https://res.cloudinary.com/dilsongvx/image/upload/q_auto/f_auto/v1777907124/Doyang_reservoir_and_its_suroundings_in_Nagaland_JEG5803_hcy9sm.jpg"
];
const defaultSlideImage = sliderImages[0];
const guestSlides = [
  {
    badge: "Water Suite",
    title: "Manage customers, drivers, and orders together",
    copy: "Unified control with role-based dashboards and real-time updates.",
    image: sliderImages[0]
  },
  {
    badge: "Smart Operations",
    title: "Recurring plans and live delivery visibility",
    copy: "Use scheduled runs and location updates to reduce manual follow-up.",
    image: sliderImages[1]
  },
  {
    badge: "Service Quality",
    title: "Reviews, complaints, and analytics in one loop",
    copy: "Track service quality and improve operations with measurable insights.",
    image: sliderImages[2]
  }
];

const roleSlides = {
  customer: [
    {
      badge: "Customer Console",
      title: "Place orders and repeat in seconds",
      copy: "Create fresh orders quickly, repeat past deliveries, and confirm handoff with short-lived arrival codes.",
      icon: PackagePlus,
      image: sliderImages[0]
    },
    {
      badge: "Plan Ahead",
      title: "Run reliable recurring delivery schedules",
      copy: "Create daily, alternate-day, or weekly plans and control them anytime.",
      icon: CalendarClock,
      image: sliderImages[1]
    },
    {
      badge: "Stay Informed",
      title: "Track driver progress and raise issues fast",
      copy: "Follow live location updates and file complaints with full order context.",
      icon: UserRoundSearch,
      image: sliderImages[2]
    }
  ],
  driver: [
    {
      badge: "Driver Board",
      title: "Focus on one active delivery pipeline",
      copy: "Request assignments, update progress, and keep statuses accurate for customers and admins.",
      icon: Truck,
      image: sliderImages[0]
    },
    {
      badge: "Live Presence",
      title: "Share location updates with one tap",
      copy: "Use GPS or manual coordinates to provide customers a dependable delivery ETA.",
      icon: MapPin,
      image: sliderImages[1]
    },
    {
      badge: "Trust Signals",
      title: "Grow with ratings and completion history",
      copy: "Monitor feedback and maintain strong service quality over time.",
      icon: Star,
      image: sliderImages[2]
    }
  ],
  admin: [
    {
      badge: "Ops Center",
      title: "Approve drivers and assign orders with control",
      copy: "Review documents, assign requests, and verify arrivals with proof-backed completion.",
      icon: ShieldCheck,
      image: sliderImages[0]
    },
    {
      badge: "Command Metrics",
      title: "Track orders, litres, complaints, and trends",
      copy: "Use analytics snapshots to catch bottlenecks before they impact service quality.",
      icon: BarChart3,
      image: sliderImages[1]
    },
    {
      badge: "Quality Desk",
      title: "Resolve complaints with clear visibility",
      copy: "Prioritize open issues and keep customer support turnaround consistent.",
      icon: Sparkles,
      image: sliderImages[2]
    }
  ]
};

const roleCommandConfigs = {
  customer: {
    label: "Customer Control Desk",
    headline: "Manage your water service like a pro",
    summary: "Everything from new orders to complaints stays organized in one command flow.",
    metrics: [
      { label: "Service", value: "Active" },
      { label: "Support", value: "Realtime" },
      { label: "Coverage", value: "Citywide" }
    ],
    checklist: ["Place or repeat orders", "Track drivers live", "Submit complaints quickly"]
  },
  driver: {
    label: "Driver Operations Deck",
    headline: "Stay fast, visible, and reliable",
    summary: "Request assignments, update location, and keep delivery quality high.",
    metrics: [
      { label: "Tracking", value: "Live" },
      { label: "Dispatch", value: "Synced" },
      { label: "Status", value: "Realtime" }
    ],
    checklist: ["Set availability", "Update live GPS", "Complete and review runs"]
  },
  admin: {
    label: "Operations Command Center",
    headline: "Control dispatch, quality, and growth",
    summary: "Approve drivers, assign orders, monitor complaints, and optimize from one premium console.",
    metrics: [
      { label: "Command", value: "24/7" },
      { label: "Escalation", value: "Structured" },
      { label: "Insights", value: "Actionable" }
    ],
    checklist: ["Approve drivers", "Assign and verify arrivals", "Resolve complaints with analytics"]
  }
};

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function normalizePhoneInput(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
}

function isValidPhoneNumber(value) {
  return PHONE_REGEX.test(String(value || "").trim());
}

function isStrongPassword(value) {
  return STRONG_PASSWORD_REGEX.test(String(value || ""));
}

async function readApiResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text
    };
  }
}

function getRequestErrorMessage(error, fallbackMessage) {
  const rawMessage = String(error?.message || fallbackMessage || "Request failed.");
  if (/failed to fetch/i.test(rawMessage)) {
    return "Unable to reach server. Check frontend API URL, backend deploy status, and CORS CLIENT_URL setting.";
  }
  return rawMessage;
}

function resolveLitres(quantityOption, customLitres) {
  return quantityOption === "more" ? customLitres : quantityOption;
}

function formatDateTime(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleString();
}

function getCoordinate(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildMapUrl(location) {
  if (!location) return "";
  const latitude = getCoordinate(location.latitude);
  const longitude = getCoordinate(location.longitude);
  if (latitude === null || longitude === null) return "";
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function formatCoordinates(location) {
  if (!location) return "";
  const latitude = getCoordinate(location.latitude);
  const longitude = getCoordinate(location.longitude);
  if (latitude === null || longitude === null) return "";
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

function calculateDistanceKm(fromLocation, toLocation) {
  if (!fromLocation || !toLocation) return null;

  const fromLatitude = getCoordinate(fromLocation.latitude);
  const fromLongitude = getCoordinate(fromLocation.longitude);
  const toLatitude = getCoordinate(toLocation.latitude);
  const toLongitude = getCoordinate(toLocation.longitude);

  if (fromLatitude === null || fromLongitude === null || toLatitude === null || toLongitude === null) {
    return null;
  }

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(toLatitude - fromLatitude);
  const longitudeDelta = toRadians(toLongitude - fromLongitude);
  const fromLatitudeRadians = toRadians(fromLatitude);
  const toLatitudeRadians = toRadians(toLatitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.sin(longitudeDelta / 2) ** 2 * Math.cos(fromLatitudeRadians) * Math.cos(toLatitudeRadians);
  const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return Number((earthRadiusKm * arc).toFixed(2));
}

function formatDistance(distanceKm) {
  if (distanceKm === null || distanceKm === undefined || Number.isNaN(Number(distanceKm))) return "N/A";
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${Number(distanceKm).toFixed(2)} km`;
}

function formatChatTime(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const roleSectionNav = {
  customer: [
    { id: "new-order", label: "New order" },
    { id: "subscriptions", label: "Recurring plans" },
    { id: "orders", label: "Order history" },
    { id: "complaints", label: "Complaints" }
  ],
  admin: [
    { id: "overview", label: "Overview" },
    { id: "drivers", label: "Drivers" },
    { id: "orders", label: "Orders" },
    { id: "complaints", label: "Complaints" },
    { id: "account", label: "Account" }
  ],
  driver: [
    { id: "active-orders", label: "Active orders" },
    { id: "completed-orders", label: "Completed" },
    { id: "reviews", label: "Reviews" }
  ]
};

const roleDefaultSection = {
  customer: "new-order",
  admin: "overview",
  driver: "active-orders"
};

const roleUiPrefix = {
  customer: "portal/customer",
  admin: "portal/admin",
  driver: "portal/driver"
};

function normalizePathname(pathname) {
  if (typeof pathname !== "string") return "/";
  const trimmed = pathname.trim();
  if (!trimmed || trimmed === "/") return "/";
  const normalized = trimmed.replace(/\/+$/, "");
  return normalized || "/";
}

function getPublicViewFromPathname(pathname) {
  return normalizePathname(pathname) === "/signup" ? "signup" : "login";
}

function getRoleSectionFromPathname(role, pathname) {
  const normalizedRole = typeof role === "string" ? role : "";
  const defaultSection = roleDefaultSection[normalizedRole] || "";
  const sections = roleSectionNav[normalizedRole] || [];
  const pathParts = normalizePathname(pathname).split("/").filter(Boolean);

  const uiPrefixParts = String(roleUiPrefix[normalizedRole] || normalizedRole)
    .split("/")
    .filter(Boolean);
  const legacyPrefixParts = [normalizedRole];

  let sectionIndex = -1;
  if (
    uiPrefixParts.length > 0 &&
    uiPrefixParts.every((part, index) => pathParts[index] === part)
  ) {
    sectionIndex = uiPrefixParts.length;
  } else if (
    legacyPrefixParts.length > 0 &&
    legacyPrefixParts.every((part, index) => pathParts[index] === part)
  ) {
    sectionIndex = legacyPrefixParts.length;
  } else {
    return defaultSection;
  }

  const candidate = pathParts[sectionIndex] || defaultSection;
  return sections.some((section) => section.id === candidate) ? candidate : defaultSection;
}

function buildRoleSectionPath(role, section) {
  const resolvedRole = typeof role === "string" ? role : "";
  const resolvedSection = section || roleDefaultSection[resolvedRole] || "";
  const uiPrefix = roleUiPrefix[resolvedRole] || resolvedRole;
  return `/${uiPrefix}/${resolvedSection}`;
}

function navigateWithReload(path) {
  const targetPath = normalizePathname(path);
  if (normalizePathname(window.location.pathname) === targetPath) return;
  window.location.assign(targetPath);
}

function App() {
  const activeView = getPublicViewFromPathname(window.location.pathname);
  const [signupRole, setSignupRole] = React.useState("customer");
  const [currentUser, setCurrentUser] = React.useState(null);
  const [isAuthResolved, setIsAuthResolved] = React.useState(
    () => !localStorage.getItem("token")
  );
  const [theme, setTheme] = React.useState(() => localStorage.getItem("theme") || "dark");

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  React.useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthResolved(true);
      return () => {
        cancelled = true;
      };
    }

    fetch(apiUrl("/auth/me"), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (response) => {
        const data = await readApiResponse(response);
        if (!response.ok) throw new Error(data.message || "Session expired.");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setCurrentUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => {
        if (cancelled) return;
        setIsAuthResolved(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleLogin({ token, user }) {
    localStorage.setItem("token", token);
    const section = getRoleSectionFromPathname(user.role, window.location.pathname);
    const nextPath = buildRoleSectionPath(user.role, section);
    if (normalizePathname(window.location.pathname) !== nextPath) {
      navigateWithReload(nextPath);
      return;
    }
    setCurrentUser(user);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setIsAuthResolved(true);
    navigateWithReload("/login");
  }

  if (!isAuthResolved) {
    return (
      <main className="page-shell">
        <ThemeToggle theme={theme} onToggle={() => setTheme(theme === "dark" ? "light" : "dark")} />
        <LiveDateTime />
        <section className="application-panel application-panel-compact">
          <div className="dashboard-stack">
            <StatusMessage status={{ type: "loading", message: "Restoring your session..." }} />
            <button type="button" className="submit-button" disabled>
              <Loader2 size={18} className="spin" />
              Loading dashboard
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (currentUser) {
    return (
      <main className="page-shell">
        <ThemeToggle theme={theme} onToggle={() => setTheme(theme === "dark" ? "light" : "dark")} />
        <LiveDateTime />
        <section className="application-panel">
          <Dashboard user={currentUser} onLogout={handleLogout} onUserChange={setCurrentUser} />
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell page-shell-home">
      <ThemeToggle theme={theme} onToggle={() => setTheme(theme === "dark" ? "light" : "dark")} />
      <LiveDateTime />
      <section className="application-panel application-panel-compact">
        <div className="home-hero">
          <span className="avatar-mark hero-mark">
            <Droplets size={44} />
          </span>
          <div className="panel-heading">
            <p>Water delivery platform</p>
            <h1>KOHIMA</h1>
          </div>
        </div>

        <VisualSlider slides={guestSlides} sliderId="guest" />

        <div className="role-tabs">
          <button
            type="button"
            className={activeView === "login" ? "active" : ""}
            onClick={() => navigateWithReload("/login")}
          >
            Login
          </button>
          <button
            type="button"
            className={activeView === "signup" ? "active" : ""}
            onClick={() => navigateWithReload("/signup")}
          >
            Signup
          </button>
        </div>

        {activeView === "login" && <LoginForm onLogin={handleLogin} />}
        {activeView === "signup" && (
          <SignupPanel signupRole={signupRole} onRoleChange={setSignupRole} />
        )}
      </section>
    </main>
  );
}

function LiveDateTime() {
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const timeText = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateText = now.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="live-clock" role="status" aria-live="polite">
      <strong>{timeText}</strong>
      <span>{dateText}</span>
    </div>
  );
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button type="button" className="theme-toggle" onClick={onToggle} aria-label="Toggle dark mode">
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}

function SignupPanel({ signupRole, onRoleChange }) {
  return (
    <div className="dashboard-stack">
      <div className="signup-role-card">
        <SectionTitle
          title="Choose signup role"
          caption="Customers can order immediately. Drivers submit documents and wait for admin approval."
        />
        <div className="role-tabs compact-tabs">
          <button type="button" className={signupRole === "customer" ? "active" : ""} onClick={() => onRoleChange("customer")}>
            Customer
          </button>
          <button type="button" className={signupRole === "driver" ? "active" : ""} onClick={() => onRoleChange("driver")}>
            Driver
          </button>
        </div>
      </div>
      {signupRole === "customer" ? <CustomerRegistrationForm /> : <DriverApplicationForm />}
    </div>
  );
}

function Dashboard({ user, onLogout, onUserChange }) {
  const slides = roleSlides[user.role] || guestSlides;
  const roleConfig = roleCommandConfigs[user.role] || roleCommandConfigs.customer;
  const activeSection = getRoleSectionFromPathname(user.role, window.location.pathname);

  React.useEffect(() => {
    const canonicalPath = buildRoleSectionPath(user.role, activeSection);
    if (normalizePathname(window.location.pathname) !== canonicalPath) {
      navigateWithReload(canonicalPath);
    }
  }, [user.role, activeSection]);

  return (
    <>
      <div className="dashboard-header">
        <div className="panel-heading">
          <p>{roleConfig.label}</p>
          <h1>{roleConfig.headline}</h1>
          <span className="dashboard-subtitle">{roleConfig.summary}</span>
        </div>
        <button type="button" className="secondary-button" onClick={onLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="command-shell">
        <aside className="command-rail">
          <div className="user-summary profile-strip">
            <span className="avatar-mark">
              <Droplets size={22} />
            </span>
            <span>
              <strong>{user.email || user.username}</strong>
              <small>Role: {user.role}</small>
            </span>
            <StatusBadge status={user.isApproved ? "approved" : "pending approval"} />
          </div>

          <div className="command-metrics">
            {roleConfig.metrics.map((metric) => (
              <article className="command-metric" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </div>

          <div className="command-checklist">
            <h3>Workflow Focus</h3>
            <ul>
              {roleConfig.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="command-stage">
          <VisualSlider slides={slides} sliderId={`role-${user.role}`} />
          <div className="command-module">
            {user.role === "customer" && <CustomerOrderForm activeSection={activeSection} />}
            {user.role === "driver" && <DriverOrderBoard user={user} activeSection={activeSection} />}
            {user.role === "admin" && (
              <AdminDashboard user={user} onUserChange={onUserChange} activeSection={activeSection} />
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function VisualSlider({ slides, sliderId }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const safeSlides = Array.isArray(slides) ? slides : [];
  const total = safeSlides.length;

  React.useEffect(() => {
    setActiveIndex(0);
  }, [sliderId, total]);

  React.useEffect(() => {
    if (total < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, 4800);

    return () => window.clearInterval(timer);
  }, [total]);

  if (!total) return null;

  const activeSlide = safeSlides[activeIndex];
  const Icon = activeSlide.icon || Droplets;

  function goPrevious() {
    setActiveIndex((current) => (current - 1 + total) % total);
  }

  function goNext() {
    setActiveIndex((current) => (current + 1) % total);
  }

  return (
    <section className="visual-slider" aria-label="Platform highlights">
      <div className="visual-slider-media">
        <img src={activeSlide.image || defaultSlideImage} alt={activeSlide.title} loading="lazy" />
        <div className="visual-slider-badge">
          <Icon size={16} />
          {activeSlide.badge}
        </div>
      </div>
      <div className="visual-slider-copy">
        <h3>{activeSlide.title}</h3>
        <p>{activeSlide.copy}</p>
        {total > 1 && (
          <div className="visual-slider-controls">
            <button type="button" onClick={goPrevious} aria-label="Previous slide">
              <ChevronLeft size={17} />
            </button>
            <div className="visual-slider-dots" role="tablist" aria-label="Slide selector">
              {safeSlides.map((slide, index) => (
                <button
                  type="button"
                  key={`${slide.badge}-${index}`}
                  className={index === activeIndex ? "active" : ""}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-selected={index === activeIndex}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
            <button type="button" onClick={goNext} aria-label="Next slide">
              <ChevronRight size={17} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function LoginForm({ onLogin }) {
  const [form, setForm] = React.useState(initialLoginForm);
  const [status, setStatus] = React.useState({ type: "idle", message: "" });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitLogin(event) {
    event.preventDefault();
    try {
      setStatus({ type: "loading", message: "Checking account..." });
      const response = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.loginId, password: form.password })
      });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.message || "Login failed.");
      setForm(initialLoginForm);
      onLogin(data);
    } catch (error) {
      setStatus({ type: "error", message: getRequestErrorMessage(error, "Customer registration failed.") });
    }
  }

  return (
    <form className="application-form" onSubmit={submitLogin}>
      <div className="field-grid">
        <label>
          Username or email
          <input name="loginId" value={form.loginId} onChange={updateField} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={updateField} required />
        </label>
      </div>
      <StatusMessage status={status} />
      <button type="submit" className="submit-button" disabled={status.type === "loading"}>
        {status.type === "loading" ? <Loader2 size={18} className="spin" /> : <LogIn size={18} />}
        Login
      </button>
    </form>
  );
}

function CustomerRegistrationForm() {
  const [form, setForm] = React.useState(initialCustomerForm);
  const [status, setStatus] = React.useState({ type: "idle", message: "" });

  function updateField(event) {
    const nextValue = event.target.name === "phone"
      ? normalizePhoneInput(event.target.value)
      : event.target.value;
    setForm((current) => ({ ...current, [event.target.name]: nextValue }));
  }

  async function submitCustomer(event) {
    event.preventDefault();
    if (!isValidPhoneNumber(form.phone)) {
      setStatus({ type: "error", message: PHONE_RULE_TEXT });
      return;
    }

    if (!isStrongPassword(form.password)) {
      setStatus({ type: "error", message: PASSWORD_RULE_TEXT });
      return;
    }

    try {
      setStatus({ type: "loading", message: "Creating customer account..." });
      const response = await fetch(apiUrl("/auth/register-customer"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.message || "Customer registration failed.");
      setForm(initialCustomerForm);
      setStatus({ type: "success", message: "Customer account created. You can log in immediately." });
    } catch (error) {
      setStatus({ type: "error", message: getRequestErrorMessage(error, "Application submission failed.") });
    }
  }

  return (
    <form className="application-form" onSubmit={submitCustomer}>
      <div className="field-grid">
        <TextInput label="Name" name="name" value={form.name} onChange={updateField} />
        <TextInput
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={updateField}
          inputMode="numeric"
          maxLength="10"
          pattern="[0-9]{10}"
          title={PHONE_RULE_TEXT}
        />
        <TextInput label="Email" name="email" type="email" value={form.email} onChange={updateField} />
        <TextInput
          label="Password"
          name="password"
          type="password"
          minLength="6"
          pattern="(?=.*[0-9])(?=.*[^A-Za-z0-9]).{6,}"
          title={PASSWORD_RULE_TEXT}
          value={form.password}
          onChange={updateField}
        />
      </div>
      <StatusMessage status={status} />
      <button type="submit" className="submit-button" disabled={status.type === "loading"}>
        {status.type === "loading" ? <Loader2 size={18} className="spin" /> : <UserPlus size={18} />}
        Create customer
      </button>
    </form>
  );
}

function DriverApplicationForm() {
  const [form, setForm] = React.useState(initialDriverForm);
  const [files, setFiles] = React.useState({ aadhaar: null, license: null });
  const [previews, setPreviews] = React.useState({ aadhaar: "", license: "" });
  const [status, setStatus] = React.useState({ type: "idle", message: "" });

  React.useEffect(() => {
    return () => {
      Object.values(previews).forEach((preview) => {
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, [previews]);

  function updateField(event) {
    const nextValue = event.target.name === "phone"
      ? normalizePhoneInput(event.target.value)
      : event.target.value;
    setForm((current) => ({ ...current, [event.target.name]: nextValue }));
  }

  function updateFile(field, file) {
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      setStatus({ type: "error", message: "Only jpg, jpeg, and png image files are allowed." });
      return;
    }
    setFiles((current) => ({ ...current, [field]: file }));
    setPreviews((current) => {
      if (current[field]) URL.revokeObjectURL(current[field]);
      return { ...current, [field]: URL.createObjectURL(file) };
    });
  }

  async function uploadImage(file) {
    const body = new FormData();
    body.append("image", file);
    const response = await fetch(apiUrl("/upload"), { method: "POST", body });
    const data = await readApiResponse(response);
    if (!response.ok) throw new Error(data.message || "Image upload failed.");
    return data.secure_url;
  }

  async function submitApplication(event) {
    event.preventDefault();
    if (!isValidPhoneNumber(form.phone)) {
      setStatus({ type: "error", message: PHONE_RULE_TEXT });
      return;
    }

    if (!isStrongPassword(form.password)) {
      setStatus({ type: "error", message: PASSWORD_RULE_TEXT });
      return;
    }

    if (!files.aadhaar || !files.license) {
      setStatus({ type: "error", message: "Please upload both Aadhaar and Driving License images." });
      return;
    }

    try {
      setStatus({ type: "loading", message: "Uploading documents..." });
      const [aadhaarUrl, licenseUrl] = await Promise.all([
        uploadImage(files.aadhaar),
        uploadImage(files.license)
      ]);
      setStatus({ type: "loading", message: "Submitting application..." });
      const response = await fetch(apiUrl("/drivers/apply"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, aadhaarUrl, licenseUrl })
      });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.message || "Application submission failed.");
      setForm(initialDriverForm);
      setFiles({ aadhaar: null, license: null });
      setPreviews({ aadhaar: "", license: "" });
      setStatus({ type: "success", message: "Application submitted. Your access unlocks after admin approval." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  return (
    <form className="application-form" onSubmit={submitApplication}>
      <div className="field-grid">
        <TextInput label="Name" name="name" value={form.name} onChange={updateField} />
        <TextInput
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={updateField}
          inputMode="numeric"
          maxLength="10"
          pattern="[0-9]{10}"
          title={PHONE_RULE_TEXT}
        />
        <TextInput label="Email" name="email" type="email" value={form.email} onChange={updateField} wide />
        <TextInput
          label="Password"
          name="password"
          type="password"
          minLength="6"
          pattern="(?=.*[0-9])(?=.*[^A-Za-z0-9]).{6,}"
          title={PASSWORD_RULE_TEXT}
          value={form.password}
          onChange={updateField}
          wide
        />
      </div>
      <div className="upload-grid">
        <DocumentUpload id="aadhaar" title="Aadhaar image" file={files.aadhaar} preview={previews.aadhaar} onChange={(file) => updateFile("aadhaar", file)} />
        <DocumentUpload id="license" title="Driving License image" file={files.license} preview={previews.license} onChange={(file) => updateFile("license", file)} />
      </div>
      <StatusMessage status={status} />
      <button type="submit" className="submit-button" disabled={status.type === "loading"}>
        {status.type === "loading" ? <Loader2 size={18} className="spin" /> : <UploadCloud size={18} />}
        Submit driver application
      </button>
    </form>
  );
}

function AdminDashboard({ user, onUserChange, activeSection }) {
  const [drivers, setDrivers] = React.useState([]);
  const [approvedDrivers, setApprovedDrivers] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [complaints, setComplaints] = React.useState([]);
  const [analytics, setAnalytics] = React.useState(null);
  const [orderFilter, setOrderFilter] = React.useState("all");
  const [orderSearch, setOrderSearch] = React.useState("");
  const [orderSort, setOrderSort] = React.useState("newest");
  const [ordersPerPage, setOrdersPerPage] = React.useState(2);
  const [orderPage, setOrderPage] = React.useState(1);
  const [form, setForm] = React.useState({ ...initialAdminForm, username: user.username || user.name });
  const [status, setStatus] = React.useState({ type: "idle", message: "" });

  React.useEffect(() => {
    loadAdminData();
  }, []);

  async function adminFetch(url, options = {}) {
    const token = localStorage.getItem("token");
    const response = await fetch(apiUrl(url), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });
    const data = await readApiResponse(response);
    if (!response.ok) throw new Error(data.message || "Admin request failed.");
    return data;
  }

  async function loadAdminData() {
    try {
      const [driversData, approvedDriversData, ordersData, complaintsData, analyticsData] = await Promise.all([
        adminFetch("/admin/drivers/pending"),
        adminFetch("/admin/drivers/approved"),
        adminFetch("/admin/orders"),
        adminFetch("/admin/complaints"),
        adminFetch("/admin/analytics")
      ]);
      setDrivers(driversData.drivers);
      setApprovedDrivers(approvedDriversData.drivers);
      setOrders(ordersData.orders);
      setComplaints(complaintsData.complaints);
      setAnalytics(analyticsData);
      return true;
    } catch (error) {
      setStatus({ type: "error", message: error.message });
      return false;
    }
  }

  async function refreshAdminData() {
    setStatus({ type: "loading", message: "Refreshing command center data..." });
    const loaded = await loadAdminData();
    if (loaded) {
      setStatus({ type: "success", message: "Admin data refreshed." });
    }
  }

  async function approveDriver(driverId) {
    try {
      setStatus({ type: "loading", message: "Approving driver..." });
      await adminFetch(`/admin/drivers/${driverId}/approve`, { method: "PATCH", body: JSON.stringify({}) });
      await loadAdminData();
      setStatus({ type: "success", message: "Driver approved." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function approveOrderRequest(orderId, driverId) {
    try {
      setStatus({ type: "loading", message: "Approving order request..." });
      const data = await adminFetch(`/admin/orders/${orderId}/approve-request`, {
        method: "PATCH",
        body: JSON.stringify({ driverId })
      });
      setOrders((current) => current.map((order) => (order._id === data.order._id ? data.order : order)));
      setStatus({ type: "success", message: "Order assigned to driver." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function updateAdmin(event) {
    event.preventDefault();
    if (form.newPassword && !isStrongPassword(form.newPassword)) {
      setStatus({ type: "error", message: PASSWORD_RULE_TEXT });
      return;
    }

    try {
      setStatus({ type: "loading", message: "Updating admin account..." });
      const data = await adminFetch("/admin/profile", {
        method: "PATCH",
        body: JSON.stringify(form)
      });
      setForm({ ...initialAdminForm, username: data.admin.username });
      onUserChange((current) => ({ ...current, name: data.admin.username, username: data.admin.username }));
      setStatus({ type: "success", message: "Admin account updated." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function updateComplaintStatus(complaintId, nextStatus) {
    try {
      setStatus({ type: "loading", message: "Updating complaint..." });
      const data = await adminFetch(`/admin/complaints/${complaintId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus })
      });
      setComplaints((current) =>
        current.map((complaint) => (complaint._id === data.complaint._id ? data.complaint : complaint))
      );
      setStatus({ type: "success", message: "Complaint updated." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  const filteredOrders = orderFilter === "all" ? orders : orders.filter((order) => order.status === orderFilter);
  const searchedOrders = filteredOrders.filter((order) => {
    const haystack = [
      order.deliveryAddress,
      order.status,
      order.customer?.name,
      order.customer?.email,
      order.customer?.phone,
      order.driver?.name,
      order.driver?.email,
      order.driver?.phone
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(orderSearch.trim().toLowerCase());
  });
  const sortedOrders = [...searchedOrders].sort((first, second) => {
    const firstTime = new Date(first.createdAt || 0).getTime();
    const secondTime = new Date(second.createdAt || 0).getTime();
    return orderSort === "oldest" ? firstTime - secondTime : secondTime - firstTime;
  });
  const totalOrderPages = Math.max(1, Math.ceil(sortedOrders.length / ordersPerPage));
  const currentOrderPage = Math.min(orderPage, totalOrderPages);
  const paginatedOrders = sortedOrders.slice(
    (currentOrderPage - 1) * ordersPerPage,
    currentOrderPage * ordersPerPage
  );

  React.useEffect(() => {
    setOrderPage(1);
  }, [orderFilter, orderSearch, orderSort, ordersPerPage]);

  React.useEffect(() => {
    if (orderPage > totalOrderPages) {
      setOrderPage(totalOrderPages);
    }
  }, [orderPage, totalOrderPages]);
  const complaintStats = analytics?.complaintCounts || {
    open: 0,
    in_progress: 0,
    resolved: 0
  };
  const stats = {
    total: analytics?.totals?.orders ?? orders.length,
    pending: analytics?.statusCounts
      ? (analytics.statusCounts.pending || 0) + (analytics.statusCounts.requested || 0)
      : orders.filter((order) => ["pending", "requested"].includes(order.status)).length,
    active: analytics?.statusCounts
      ? (analytics.statusCounts.assigned || 0) +
        (analytics.statusCounts.out_for_delivery || 0) +
        (analytics.statusCounts.arrived || 0)
      : orders.filter((order) => ["assigned", "out_for_delivery", "arrived"].includes(order.status)).length,
    completed: analytics?.statusCounts?.completed ?? orders.filter((order) => order.status === "completed").length,
    litres:
      analytics?.totals?.completedLitres ??
      orders.filter((order) => order.status === "completed").reduce((sum, order) => sum + Number(order.litres || 0), 0),
    customers: analytics?.totals?.customers ?? 0,
    activeSubscriptions: analytics?.totals?.activeSubscriptions ?? 0
  };
  const overviewStats = [
    { label: "Total orders", value: stats.total, tone: "primary" },
    { label: "Pending", value: stats.pending, tone: "warning" },
    { label: "Active", value: stats.active, tone: "active" },
    { label: "Completed", value: stats.completed, tone: "success" },
    { label: "Litres delivered", value: `${stats.litres}L`, tone: "info" },
    { label: "Customers", value: stats.customers, tone: "info" },
    { label: "Active plans", value: stats.activeSubscriptions, tone: "active" },
    { label: "Open complaints", value: complaintStats.open + complaintStats.in_progress, tone: "warning" }
  ];
  const monthlyLitres = analytics?.monthlyLitres || [];
  const unresolvedComplaints = complaints.filter((complaint) => complaint.status !== "resolved").length;
  const pendingAssignments = orders.filter((order) => ["pending", "requested"].includes(order.status)).length;
  const pendingDrivers = drivers.length;
  const currentlyAvailableDrivers = approvedDrivers.filter((driver) => driver.isAvailable).length;

  return (
    <div className="dashboard-stack admin-stack">
      <div className="admin-command-bar">
        <div>
          <strong>Admin Operations Console</strong>
          <small>Use one place to manage drivers, orders, and complaint resolution.</small>
        </div>
        <div className="admin-kpi-row">
          <span className="admin-kpi-chip">Pending drivers: {pendingDrivers}</span>
          <span className="admin-kpi-chip">Available drivers: {currentlyAvailableDrivers}</span>
          <span className="admin-kpi-chip">Pending assignments: {pendingAssignments}</span>
          <span className="admin-kpi-chip">Unresolved complaints: {unresolvedComplaints}</span>
          <button type="button" className="secondary-button" onClick={refreshAdminData}>
            Refresh
          </button>
        </div>
      </div>

      <nav className="dashboard-nav" aria-label="Admin sections">
        {roleSectionNav.admin.map((section) => (
          <button
            type="button"
            key={section.id}
            className={activeSection === section.id ? "active" : ""}
            onClick={() => navigateWithReload(buildRoleSectionPath("admin", section.id))}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <StatusMessage status={status} />

      {activeSection === "overview" && (
        <>
          <section className="admin-stats-nav" aria-label="Admin overview statistics">
            {overviewStats.map((item) => (
              <article className={`admin-stat-tile ${item.tone}`} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </section>
          <AdminVisualStats stats={stats} complaintStats={complaintStats} monthlyLitres={monthlyLitres} />
        </>
      )}

      {activeSection === "account" && (
        <form className="application-form" onSubmit={updateAdmin}>
          <div className="field-grid">
            <TextInput label="Admin username" name="username" value={form.username} onChange={(e) => setForm((c) => ({ ...c, username: e.target.value }))} />
            <TextInput label="Current password" name="currentPassword" type="password" value={form.currentPassword} onChange={(e) => setForm((c) => ({ ...c, currentPassword: e.target.value }))} />
            <TextInput
              label="New password"
              name="newPassword"
              type="password"
              minLength="6"
              pattern="(?=.*[0-9])(?=.*[^A-Za-z0-9]).{6,}"
              title={PASSWORD_RULE_TEXT}
              value={form.newPassword}
              onChange={(e) => setForm((c) => ({ ...c, newPassword: e.target.value }))}
              wide
            />
          </div>
          <button type="submit" className="submit-button" disabled={status.type === "loading"}>
            {status.type === "loading" ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
            Update admin
          </button>
        </form>
      )}

      {activeSection === "drivers" && (
        <div className="orders-list">
          <SectionTitle title="Pending driver approvals" caption="Review documents before enabling driver access." />
          {drivers.length === 0 ? <p>No pending drivers.</p> : drivers.map((driver) => (
            <article className="order-item" key={driver._id}>
              <div className="item-head"><strong>{driver.name}</strong><StatusBadge status="pending approval" /></div>
              <div className="detail-grid"><span>Email: {driver.email}</span><span>Phone: {driver.phone}</span></div>
              <a href={driver.documents.aadhaarUrl} target="_blank" rel="noreferrer">View Aadhaar</a>
              <a href={driver.documents.licenseUrl} target="_blank" rel="noreferrer">View Driving License</a>
              <button type="button" className="inline-action" onClick={() => approveDriver(driver._id)}><CheckCircle2 size={17} />Approve driver</button>
            </article>
          ))}

          <SectionTitle title="Approved drivers availability" caption="Live availability from driver app toggle." />
          {approvedDrivers.length === 0 ? <p>No approved drivers yet.</p> : approvedDrivers.map((driver) => (
            <article className="order-item" key={`approved-${driver._id}`}>
              <div className="item-head">
                <strong>{driver.name}</strong>
                <StatusBadge status={driver.isAvailable ? "available" : "unavailable"} />
              </div>
              <div className="detail-grid">
                <span>Email: {driver.email}</span>
                <span>Phone: {driver.phone}</span>
                <span>Joined: {formatDateTime(driver.createdAt)}</span>
                <span>Last profile update: {formatDateTime(driver.updatedAt)}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {activeSection === "orders" && (
        <div className="orders-list">
          <SectionTitle title="All customer orders" caption="Track requests, assignment, arrival verification, and completion proof." />
          <div className="orders-toolbar">
            <input
              type="search"
              placeholder="Search by customer, driver, address, status..."
              value={orderSearch}
              onChange={(event) => setOrderSearch(event.target.value)}
            />
            <label>
              Sort by date
              <select value={orderSort} onChange={(event) => setOrderSort(event.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
            <label>
              Per page
              <select value={ordersPerPage} onChange={(event) => setOrdersPerPage(Number(event.target.value))}>
                <option value="2">2</option>
                <option value="6">6</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </label>
          </div>
          <div className="filter-row">
            {["all", "pending", "requested", "assigned", "out_for_delivery", "arrived", "completed", "cancelled"].map((filter) => (
              <button type="button" className={orderFilter === filter ? "active" : ""} key={filter} onClick={() => setOrderFilter(filter)}>
                {filter.replaceAll("_", " ")}
              </button>
            ))}
          </div>
          <p>
            Showing {paginatedOrders.length} of {sortedOrders.length} matching orders. Page {currentOrderPage} of {totalOrderPages}.
          </p>
          {sortedOrders.length === 0 ? <p>No customer orders match your filters.</p> : paginatedOrders.map((order) => (
            <OrderCard key={order._id} order={order}>
              {order.sourceSubscription && (
                <span className="delivery-key">
                  Recurring plan: {order.sourceSubscription.frequency.replaceAll("_", " ")}
                </span>
              )}
              {order.driverLocation && (
                <a
                  href={buildMapUrl(order.driverLocation)}
                  target="_blank"
                  rel="noreferrer"
                  className="location-pill"
                  title={formatCoordinates(order.driverLocation)}
                >
                  <MapPin size={14} />
                  Driver live map
                </a>
              )}
              {!order.driver && <span>Driver requests: {order.driverRequests?.length || 0}</span>}
              {order.preferredDriver && (
                <span className="delivery-key">
                  Preferred driver: {order.preferredDriver.name} ({order.preferredDriver.isAvailable ? "available" : "unavailable"})
                </span>
              )}
              {!order.driver && order.driverRequests?.map((driver) => (
                <button type="button" className="inline-action" key={driver._id} onClick={() => approveOrderRequest(order._id, driver._id)}>
                  <CheckCircle2 size={17} />Approve {driver.name} ({driver.isAvailable ? "available" : "unavailable"})
                </button>
              ))}
              {order.status === "arrived" && (
                <span className="delivery-key">
                  Awaiting customer completion code confirmation since {formatDateTime(order.arrivedAt)}.
                </span>
              )}
              {order.completionProof?.verifiedAt && (
                <span className="delivery-key">
                  Verified at {formatDateTime(order.completionProof.verifiedAt)} | Distance {order.completionProof.distanceMeters ?? "-"}m
                </span>
              )}
            </OrderCard>
          ))}
          {totalOrderPages > 1 && (
            <div className="pagination-controls">
              <button type="button" onClick={() => setOrderPage((current) => Math.max(1, current - 1))} disabled={currentOrderPage === 1}>
                Previous
              </button>
              {Array.from({ length: totalOrderPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={pageNumber === currentOrderPage ? "active" : ""}
                  onClick={() => setOrderPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setOrderPage((current) => Math.min(totalOrderPages, current + 1))}
                disabled={currentOrderPage === totalOrderPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {activeSection === "complaints" && (
        <div className="orders-list">
          <SectionTitle
            title="Customer complaints"
            caption="See full customer, order, and driver context before changing complaint status."
          />
          {complaints.length === 0 ? (
            <p>No complaints yet.</p>
          ) : (
            complaints.map((complaint) => (
              <article className="order-item complaint-card" key={complaint._id}>
                <div className="item-head">
                  <strong>{complaint.customer?.name || "Customer complaint"}</strong>
                  <StatusBadge status={complaint.status} />
                </div>
                <div className="detail-grid">
                  <span>Complaint date: {formatDateTime(complaint.createdAt)}</span>
                  <span>Last update: {formatDateTime(complaint.updatedAt)}</span>
                  <span>Customer email: {complaint.customer?.email || "N/A"}</span>
                  <span>Customer phone: {complaint.customer?.phone || "N/A"}</span>
                  <span>Order address: {complaint.order?.deliveryAddress || "General issue"}</span>
                  <span>Order status: {complaint.order?.status?.replaceAll("_", " ") || "N/A"}</span>
                  <span>Order quantity: {complaint.order?.litres ? `${complaint.order.litres} litres` : "N/A"}</span>
                  <span>Scheduled for: {formatDateTime(complaint.order?.scheduledFor)}</span>
                  <span>Order placed: {formatDateTime(complaint.order?.createdAt)}</span>
                  <span>Driver: {complaint.order?.driver?.name || "Not assigned"}</span>
                  <span>Driver phone: {complaint.order?.driver?.phone || "N/A"}</span>
                  <span>Driver email: {complaint.order?.driver?.email || "N/A"}</span>
                </div>
                {complaint.order?.notes && <p className="meta-block">Order notes: {complaint.order.notes}</p>}
                <p className="complaint-message">Complaint: {complaint.message}</p>
                {complaint.resolutionNote && <p className="meta-block">Resolution: {complaint.resolutionNote}</p>}
                <p className="complaint-state-text">
                  Current status: <strong>{complaint.status.replaceAll("_", " ")}</strong>
                </p>
                <div className="filter-row admin-actions-row">
                  <button
                    type="button"
                    className={`action-open ${complaint.status === "open" ? "active" : ""}`}
                    aria-pressed={complaint.status === "open"}
                    disabled={complaint.status === "open"}
                    onClick={() => updateComplaintStatus(complaint._id, "open")}
                  >
                    Mark open
                  </button>
                  <button
                    type="button"
                    className={`action-progress ${complaint.status === "in_progress" ? "active" : ""}`}
                    aria-pressed={complaint.status === "in_progress"}
                    disabled={complaint.status === "in_progress"}
                    onClick={() => updateComplaintStatus(complaint._id, "in_progress")}
                  >
                    In progress
                  </button>
                  <button
                    type="button"
                    className={`action-resolved ${complaint.status === "resolved" ? "active" : ""}`}
                    aria-pressed={complaint.status === "resolved"}
                    disabled={complaint.status === "resolved"}
                    onClick={() => updateComplaintStatus(complaint._id, "resolved")}
                  >
                    Resolve
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function CustomerOrderForm({ activeSection }) {
  const [form, setForm] = React.useState(initialOrderForm);
  const [subscriptionForm, setSubscriptionForm] = React.useState(initialSubscriptionForm);
  const [complaintForm, setComplaintForm] = React.useState(initialComplaintForm);
  const [orders, setOrders] = React.useState([]);
  const [publicDrivers, setPublicDrivers] = React.useState([]);
  const [subscriptions, setSubscriptions] = React.useState([]);
  const [complaints, setComplaints] = React.useState([]);
  const [locations, setLocations] = React.useState({});
  const [orderLocation, setOrderLocation] = React.useState(null);
  const [completionCodes, setCompletionCodes] = React.useState({});
  const [reviewForms, setReviewForms] = React.useState({});
  const [historyPage, setHistoryPage] = React.useState(1);
  const [historyPerPage, setHistoryPerPage] = React.useState(2);
  const [chatByOrder, setChatByOrder] = React.useState({});
  const [chatDrafts, setChatDrafts] = React.useState({});
  const [chatOpenByOrder, setChatOpenByOrder] = React.useState({});
  const [chatLoadingByOrder, setChatLoadingByOrder] = React.useState({});
  const [chatMetaByOrder, setChatMetaByOrder] = React.useState({});
  const [status, setStatus] = React.useState({ type: "idle", message: "" });

  React.useEffect(() => {
    loadOrders();
    loadPublicDrivers();
    loadSubscriptions();
    loadComplaints();
  }, []);

  React.useEffect(() => {
    if (activeSection !== "orders") return undefined;

    const trackableOrders = orders.filter(
      (order) => order.driver && ["assigned", "out_for_delivery", "arrived"].includes(order.status)
    );
    if (!trackableOrders.length) return undefined;

    const refreshLocations = () => {
      trackableOrders.forEach((order) => {
        loadOrderLocation(order._id, { silent: true });
      });
    };

    refreshLocations();
    const timerId = window.setInterval(refreshLocations, 15000);
    return () => window.clearInterval(timerId);
  }, [activeSection, orders]);

  React.useEffect(() => {
    if (activeSection !== "orders") return undefined;
    const openedOrderIds = Object.keys(chatOpenByOrder).filter((orderId) => chatOpenByOrder[orderId]);
    if (!openedOrderIds.length) return undefined;

    const refreshChats = () => {
      openedOrderIds.forEach((orderId) => {
        loadOrderChat(orderId, { silent: true });
      });
    };

    refreshChats();
    const timerId = window.setInterval(refreshChats, 8000);
    return () => window.clearInterval(timerId);
  }, [activeSection, chatOpenByOrder]);

  async function customerFetch(url, options = {}) {
    const token = localStorage.getItem("token");
    const response = await fetch(apiUrl(url), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });
    const data = await readApiResponse(response);
    if (!response.ok) throw new Error(data.message || "Request failed.");
    return data;
  }

  async function loadOrders() {
    try {
      const data = await customerFetch("/orders/mine");
      setOrders(data.orders);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function loadPublicDrivers() {
    try {
      const data = await customerFetch("/drivers/public");
      setPublicDrivers(data.drivers || []);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function loadSubscriptions() {
    try {
      const data = await customerFetch("/subscriptions/mine");
      setSubscriptions(data.subscriptions);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function loadComplaints() {
    try {
      const data = await customerFetch("/complaints/mine");
      setComplaints(data.complaints);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function captureOrderLocation() {
    if (!("geolocation" in navigator)) {
      setStatus({ type: "error", message: "Geolocation is not supported in this browser." });
      return;
    }

    setStatus({ type: "loading", message: "Capturing your location for this order..." });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setOrderLocation({ latitude, longitude });
        setStatus({ type: "success", message: "Location captured. Driver can now see your distance." });
      },
      (error) => {
        setStatus({ type: "error", message: error.message || "Could not capture your current location." });
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 5000
      }
    );
  }

  function updateExistingOrderLocation(orderId) {
    if (!("geolocation" in navigator)) {
      setStatus({ type: "error", message: "Geolocation is not supported in this browser." });
      return;
    }

    setStatus({ type: "loading", message: "Capturing GPS and updating order location..." });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const data = await customerFetch(`/orders/${orderId}/customer-location`, {
            method: "PATCH",
            body: JSON.stringify({ latitude, longitude })
          });
          setOrders((current) => current.map((order) => (order._id === data.order._id ? data.order : order)));
          setLocations((current) => ({
            ...current,
            [orderId]: {
              ...(current[orderId] || {}),
              customerLocation: data.order.customerLocation || { latitude, longitude }
            }
          }));
          setStatus({ type: "success", message: "Order GPS updated successfully." });
        } catch (error) {
          setStatus({ type: "error", message: error.message });
        }
      },
      (error) => {
        setStatus({ type: "error", message: error.message || "Could not capture current location." });
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 5000
      }
    );
  }

  async function submitOrder(event) {
    event.preventDefault();
    if (!orderLocation) {
      setStatus({
        type: "error",
        message: "Live customer location is mandatory. Tap 'Use current GPS for this order' first."
      });
      return;
    }
    try {
      setStatus({ type: "loading", message: "Creating order..." });
      const litres = resolveLitres(form.quantityOption, form.customLitres);
      const data = await customerFetch("/orders", {
        method: "POST",
        body: JSON.stringify({
          deliveryAddress: form.deliveryAddress,
          litres,
          notes: form.notes,
          customerLocation: orderLocation,
          preferredDriverId: form.preferredDriverId || ""
        })
      });
      setOrders((current) => [data.order, ...current]);
      setForm(initialOrderForm);
      setOrderLocation(null);
      setStatus({ type: "success", message: "Order created successfully." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  function repeatOrder(order) {
    setForm({
      deliveryAddress: order.deliveryAddress,
      quantityOption: ["2000", "5000"].includes(String(order.litres)) ? String(order.litres) : "more",
      customLitres: ["2000", "5000"].includes(String(order.litres)) ? "" : String(order.litres),
      notes: order.notes || "",
      preferredDriverId: order.preferredDriver?._id || ""
    });
    setStatus({ type: "success", message: "Order details copied. Review and place the order." });
  }

  async function confirmDelivery(orderId) {
    try {
      setStatus({ type: "loading", message: "Confirming delivery..." });
      const data = await customerFetch(`/orders/${orderId}/confirm-delivery`, {
        method: "PATCH",
        body: JSON.stringify({ completionCode: completionCodes[orderId] })
      });
      setOrders((current) => current.map((order) => (order._id === data.order._id ? data.order : order)));
      setCompletionCodes((current) => ({ ...current, [orderId]: "" }));
      setStatus({ type: "success", message: "Delivery confirmed. Order completed." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function cancelOrder(orderId) {
    try {
      setStatus({ type: "loading", message: "Cancelling order..." });
      const data = await customerFetch(`/orders/${orderId}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({})
      });
      setOrders((current) => current.map((order) => (order._id === data.order._id ? data.order : order)));
      setStatus({ type: "success", message: "Order cancelled." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function createSubscription(event) {
    event.preventDefault();
    try {
      setStatus({ type: "loading", message: "Creating recurring plan..." });
      const litres = resolveLitres(subscriptionForm.quantityOption, subscriptionForm.customLitres);
      const data = await customerFetch("/subscriptions", {
        method: "POST",
        body: JSON.stringify({
          deliveryAddress: subscriptionForm.deliveryAddress,
          litres,
          notes: subscriptionForm.notes,
          frequency: subscriptionForm.frequency,
          startDate: subscriptionForm.startDate
        })
      });
      setSubscriptions((current) => [data.subscription, ...current]);
      setSubscriptionForm(initialSubscriptionForm);
      setStatus({ type: "success", message: "Recurring plan created." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function pauseSubscription(subscriptionId) {
    try {
      const data = await customerFetch(`/subscriptions/${subscriptionId}/pause`, {
        method: "PATCH",
        body: JSON.stringify({})
      });
      setSubscriptions((current) =>
        current.map((subscription) =>
          subscription._id === data.subscription._id ? data.subscription : subscription
        )
      );
      setStatus({ type: "success", message: "Recurring plan paused." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function resumeSubscription(subscriptionId) {
    try {
      const data = await customerFetch(`/subscriptions/${subscriptionId}/resume`, {
        method: "PATCH",
        body: JSON.stringify({})
      });
      setSubscriptions((current) =>
        current.map((subscription) =>
          subscription._id === data.subscription._id ? data.subscription : subscription
        )
      );
      setStatus({ type: "success", message: "Recurring plan resumed." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function removeSubscription(subscriptionId) {
    try {
      await customerFetch(`/subscriptions/${subscriptionId}`, { method: "DELETE" });
      setSubscriptions((current) => current.filter((subscription) => subscription._id !== subscriptionId));
      setStatus({ type: "success", message: "Recurring plan deleted." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function submitComplaint(event) {
    event.preventDefault();
    try {
      setStatus({ type: "loading", message: "Submitting complaint..." });
      const data = await customerFetch("/complaints", {
        method: "POST",
        body: JSON.stringify(complaintForm)
      });
      setComplaints((current) => [data.complaint, ...current]);
      setComplaintForm(initialComplaintForm);
      setStatus({ type: "success", message: "Complaint submitted." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function loadOrderLocation(orderId, options = {}) {
    const { silent = false } = options;
    try {
      const data = await customerFetch(`/orders/${orderId}/location`);
      setLocations((current) => ({
        ...current,
        [orderId]: {
          driverLocation: data.driverLocation || null,
          customerLocation: data.customerLocation || null,
          distanceKm: data.distanceKm ?? null
        }
      }));
      if (silent) {
        return;
      }
      if (!data.driverLocation) {
        setStatus({ type: "success", message: "Driver location is not available yet." });
      } else {
        setStatus({
          type: "success",
          message:
            data.distanceKm !== null && data.distanceKm !== undefined
              ? `Live location loaded. Distance: ${formatDistance(data.distanceKm)}`
              : "Live location loaded. Tap Open live map."
        });
      }
    } catch (error) {
      if (!silent) {
        setStatus({ type: "error", message: error.message });
      }
    }
  }

  async function viewLiveLocation(orderId) {
    await loadOrderLocation(orderId);
  }

  async function loadOrderChat(orderId, options = {}) {
    const { silent = false } = options;
    setChatLoadingByOrder((current) => ({ ...current, [orderId]: true }));
    try {
      const data = await customerFetch(`/orders/${orderId}/chat`);
      setChatByOrder((current) => ({ ...current, [orderId]: data.messages || [] }));
      setChatMetaByOrder((current) => ({
        ...current,
        [orderId]: {
          canSend: Boolean(data.canSend),
          mutedUntil: data.mutedUntil || null,
          role: data.role || "customer",
          status: data.status || "",
          chatEscalatedAt: data.chatEscalatedAt || null
        }
      }));
    } catch (error) {
      if (!silent) {
        setStatus({ type: "error", message: error.message });
      }
    } finally {
      setChatLoadingByOrder((current) => ({ ...current, [orderId]: false }));
    }
  }

  function toggleOrderChat(orderId) {
    setChatOpenByOrder((current) => {
      const nextIsOpen = !current[orderId];
      const nextState = { ...current, [orderId]: nextIsOpen };
      if (nextIsOpen) {
        loadOrderChat(orderId);
      }
      return nextState;
    });
  }

  async function sendOrderChatMessage(orderId, presetMessage = "") {
    const message = (presetMessage || chatDrafts[orderId] || "").trim();
    if (!message) return;

    setChatLoadingByOrder((current) => ({ ...current, [orderId]: true }));
    try {
      const data = await customerFetch(`/orders/${orderId}/chat`, {
        method: "POST",
        body: JSON.stringify({ message })
      });
      setChatByOrder((current) => ({ ...current, [orderId]: data.messages || [] }));
      setChatMetaByOrder((current) => ({
        ...current,
        [orderId]: {
          ...(current[orderId] || {}),
          mutedUntil: data.mutedUntil || null,
          chatEscalatedAt: data.chatEscalatedAt || null
        }
      }));
      setChatDrafts((current) => ({ ...current, [orderId]: "" }));
    } catch (error) {
      setStatus({ type: "error", message: error.message });
      await loadOrderChat(orderId, { silent: true });
    } finally {
      setChatLoadingByOrder((current) => ({ ...current, [orderId]: false }));
    }
  }

  function updateReviewField(orderId, field, value) {
    setReviewForms((current) => ({
      ...current,
      [orderId]: {
        rating: "5",
        comment: "",
        ...(current[orderId] || {}),
        [field]: value
      }
    }));
  }

  async function submitReview(orderId) {
    try {
      const review = reviewForms[orderId] || { rating: "5", comment: "" };
      setStatus({ type: "loading", message: "Submitting review..." });
      const data = await customerFetch("/reviews", {
        method: "POST",
        body: JSON.stringify({
          orderId,
          rating: review.rating,
          comment: review.comment
        })
      });

      setReviewForms((current) => ({
        ...current,
        [orderId]: { rating: "5", comment: "", submitted: true }
      }));
      setStatus({ type: "success", message: "Driver review submitted." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  const activeOrders = orders.filter(
    (order) => !["completed", "cancelled"].includes(order.status)
  );
  const historyOrders = orders.filter((order) =>
    ["completed", "cancelled"].includes(order.status)
  );
  const totalHistoryPages = Math.max(1, Math.ceil(historyOrders.length / historyPerPage));
  const currentHistoryPage = Math.min(historyPage, totalHistoryPages);
  const paginatedHistoryOrders = historyOrders.slice(
    (currentHistoryPage - 1) * historyPerPage,
    currentHistoryPage * historyPerPage
  );

  React.useEffect(() => {
    setHistoryPage(1);
  }, [historyPerPage, orders.length]);

  React.useEffect(() => {
    if (historyPage > totalHistoryPages) {
      setHistoryPage(totalHistoryPages);
    }
  }, [historyPage, totalHistoryPages]);

  function renderCustomerOrderCard(order) {
    const locationData = locations[order._id] || {};
    const driverLocation = locationData.driverLocation || null;
    const customerLocation = locationData.customerLocation || order.customerLocation || null;
    const distanceKm =
      locationData.distanceKm !== null && locationData.distanceKm !== undefined
        ? Number(locationData.distanceKm)
        : calculateDistanceKm(driverLocation, customerLocation);
    const isChatEnabled =
      Boolean(order.driver) && ["assigned", "out_for_delivery", "arrived"].includes(order.status);
    const chatMeta = chatMetaByOrder[order._id] || {};
    const isChatOpen = Boolean(chatOpenByOrder[order._id]);

    return (
      <OrderCard key={order._id} order={order}>
        {order.sourceSubscription && (
          <span className="delivery-key">
            Recurring: {order.sourceSubscription.frequency.replaceAll("_", " ")}
          </span>
        )}
        {order.scheduledFor && <span>Scheduled for: {formatDateTime(order.scheduledFor)}</span>}
        {order.customerLocation && <span className="delivery-key">Order GPS saved for driver</span>}
        {!order.customerLocation && !["completed", "cancelled"].includes(order.status) && (
          <button type="button" className="inline-action" onClick={() => updateExistingOrderLocation(order._id)}>
            <MapPin size={17} />
            Share GPS now
          </button>
        )}
        {order.preferredDriver && (
          <span className="delivery-key">Preferred driver: {order.preferredDriver.name}</span>
        )}
        {order.status === "out_for_delivery" && (
          <span className="delivery-key">
            Driver is on the way. Completion input unlocks when driver marks arrival.
          </span>
        )}
        {order.status === "arrived" && (
          <div className="inline-form">
            <input
              value={completionCodes[order._id] || ""}
              onChange={(event) =>
                setCompletionCodes((current) => ({ ...current, [order._id]: event.target.value }))
              }
              placeholder="Completion code"
            />
            <button type="button" className="inline-action" onClick={() => confirmDelivery(order._id)}>
              <CheckCircle2 size={17} />
              Confirm delivery
            </button>
          </div>
        )}
        {order.driver && ["assigned", "out_for_delivery", "arrived"].includes(order.status) && (
          <button type="button" className="inline-action" onClick={() => viewLiveLocation(order._id)}>
            <MapPin size={17} />
            View live location
          </button>
        )}
        {driverLocation && (
          <a
            href={buildMapUrl(driverLocation)}
            target="_blank"
            rel="noreferrer"
            className="location-pill"
            title={formatCoordinates(driverLocation)}
          >
            <MapPin size={14} />
            Open live map
          </a>
        )}
        {distanceKm !== null && <span className="delivery-key">Driver distance: {formatDistance(distanceKm)}</span>}
        {order.status === "arrived" && order.arrivedAt && (
          <span className="delivery-key">Driver marked arrived at: {formatDateTime(order.arrivedAt)}</span>
        )}
        {order.completionProof?.verifiedAt && (
          <span className="delivery-key">
            Verified at {formatDateTime(order.completionProof.verifiedAt)} | Distance {order.completionProof.distanceMeters ?? "-"}m
          </span>
        )}
        {isChatEnabled && (
          <button type="button" className="inline-action" onClick={() => toggleOrderChat(order._id)}>
            <MessageCircle size={17} />
            {isChatOpen ? "Hide chat" : "Open chat"}
          </button>
        )}
        {isChatEnabled && isChatOpen && (
          <OrderChatPanel
            role="customer"
            messages={chatByOrder[order._id] || []}
            draft={chatDrafts[order._id] || ""}
            canSend={Boolean(chatMeta.canSend)}
            mutedUntil={chatMeta.mutedUntil || null}
            loading={Boolean(chatLoadingByOrder[order._id])}
            onDraftChange={(value) =>
              setChatDrafts((current) => ({ ...current, [order._id]: value }))
            }
            onSend={() => sendOrderChatMessage(order._id)}
            quickReplies={[]}
          />
        )}
        <button type="button" className="inline-action" onClick={() => repeatOrder(order)}><PackagePlus size={17} />Repeat order</button>
        {["pending", "requested"].includes(order.status) && !order.driver && <button type="button" className="secondary-button danger-button" onClick={() => cancelOrder(order._id)}>Cancel order</button>}
        {order.status === "completed" && order.driver && (
          <ReviewBox
            form={reviewForms[order._id] || { rating: "5", comment: "" }}
            onChange={(field, value) => updateReviewField(order._id, field, value)}
            onSubmit={() => submitReview(order._id)}
          />
        )}
      </OrderCard>
    );
  }

  return (
    <div className="dashboard-stack">
      <nav className="dashboard-nav" aria-label="Customer sections">
        {roleSectionNav.customer.map((section) => (
          <button
            type="button"
            key={section.id}
            className={activeSection === section.id ? "active" : ""}
            onClick={() => navigateWithReload(buildRoleSectionPath("customer", section.id))}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <StatusMessage status={status} />

      {activeSection === "new-order" && (
        <form className="application-form" onSubmit={submitOrder}>
          <div className="field-grid">
            <TextInput label="Delivery address" name="deliveryAddress" value={form.deliveryAddress} onChange={updateField} wide />
            <label>
              Quantity
              <select name="quantityOption" value={form.quantityOption} onChange={updateField} required>
                <option value="2000">2000L</option>
                <option value="5000">5000L</option>
                <option value="more">More</option>
              </select>
            </label>
            {form.quantityOption === "more" && <TextInput label="Custom litres" name="customLitres" type="number" min="5001" value={form.customLitres} onChange={updateField} />}
            <TextInput label="Notes" name="notes" value={form.notes} onChange={updateField} wide required={false} />
            <label>
              Preferred driver (optional)
              <select
                name="preferredDriverId"
                value={form.preferredDriverId}
                onChange={updateField}
              >
                <option value="">Any eligible driver (public order)</option>
                {publicDrivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} - {driver.averageRating ? `${driver.averageRating}/5` : "New"} ({driver.reviewCount} reviews)
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="filter-row">
            <button type="button" onClick={captureOrderLocation}>
              <MapPin size={16} />
              Use current GPS for this order
            </button>
            {orderLocation && (
              <span className="delivery-key">GPS saved: {formatCoordinates(orderLocation)}</span>
            )}
            {!orderLocation && (
              <span className="delivery-key">GPS required before placing order.</span>
            )}
          </div>
          <button type="submit" className="submit-button" disabled={status.type === "loading" || !orderLocation}><PackagePlus size={18} />Place order</button>
        </form>
      )}

      {activeSection === "subscriptions" && (
        <>
          <form className="application-form" onSubmit={createSubscription}>
            <SectionTitle
              title="Recurring plans"
              caption="Set fixed delivery schedules (daily, alternate day, or weekly)."
            />
            <div className="field-grid">
              <TextInput label="Plan delivery address" name="deliveryAddress" value={subscriptionForm.deliveryAddress} onChange={(event) => setSubscriptionForm((current) => ({ ...current, deliveryAddress: event.target.value }))} wide />
              <label>
                Plan quantity
                <select
                  name="quantityOption"
                  value={subscriptionForm.quantityOption}
                  onChange={(event) => setSubscriptionForm((current) => ({ ...current, quantityOption: event.target.value }))}
                  required
                >
                  <option value="2000">2000L</option>
                  <option value="5000">5000L</option>
                  <option value="more">More</option>
                </select>
              </label>
              {subscriptionForm.quantityOption === "more" && (
                <TextInput
                  label="Custom litres"
                  name="customLitres"
                  type="number"
                  min="5001"
                  value={subscriptionForm.customLitres}
                  onChange={(event) => setSubscriptionForm((current) => ({ ...current, customLitres: event.target.value }))}
                />
              )}
              <label>
                Frequency
                <select
                  name="frequency"
                  value={subscriptionForm.frequency}
                  onChange={(event) => setSubscriptionForm((current) => ({ ...current, frequency: event.target.value }))}
                  required
                >
                  {subscriptionFrequencies.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
              <TextInput
                label="First run date"
                name="startDate"
                type="date"
                value={subscriptionForm.startDate}
                onChange={(event) => setSubscriptionForm((current) => ({ ...current, startDate: event.target.value }))}
              />
              <TextInput
                label="Plan notes"
                name="notes"
                value={subscriptionForm.notes}
                onChange={(event) => setSubscriptionForm((current) => ({ ...current, notes: event.target.value }))}
                wide
                required={false}
              />
            </div>
            <button type="submit" className="submit-button" disabled={status.type === "loading"}>
              <CalendarClock size={18} />
              Create recurring plan
            </button>
          </form>

          <div className="orders-list">
            {subscriptions.length === 0 ? <p>No recurring plans yet.</p> : subscriptions.map((subscription) => (
              <article className="order-item" key={subscription._id}>
                <div className="item-head">
                  <strong>{subscription.deliveryAddress}</strong>
                  <StatusBadge status={subscription.isPaused ? "paused" : "active"} />
                </div>
                <div className="detail-grid">
                  <span>Quantity: {subscription.litres} litres</span>
                  <span>Frequency: {subscription.frequency.replaceAll("_", " ")}</span>
                  <span>Next run: {formatDateTime(subscription.nextRunAt)}</span>
                  <span>Last run: {formatDateTime(subscription.lastRunAt)}</span>
                </div>
                <div className="filter-row">
                  {subscription.isPaused ? (
                    <button type="button" onClick={() => resumeSubscription(subscription._id)}>
                      <PlayCircle size={16} />Resume
                    </button>
                  ) : (
                    <button type="button" onClick={() => pauseSubscription(subscription._id)}>
                      <PauseCircle size={16} />Pause
                    </button>
                  )}
                  <button type="button" onClick={() => removeSubscription(subscription._id)}>
                    <Trash2 size={16} />Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {activeSection === "orders" && (
        <>
          <div className="orders-list">
            <SectionTitle title="Active orders" caption="Current pending and in-progress orders." />
            {activeOrders.length === 0 ? <p>No active orders right now.</p> : activeOrders.map(renderCustomerOrderCard)}
          </div>
          <div className="orders-list">
            <SectionTitle title="Order history" caption="Completed and cancelled orders with pagination." />
            <div className="orders-toolbar">
              <label>
                Per page
                <select value={historyPerPage} onChange={(event) => setHistoryPerPage(Number(event.target.value))}>
                  <option value="2">2</option>
                  <option value="6">6</option>
                  <option value="10">10</option>
                </select>
              </label>
            </div>
            <p>
              Showing {paginatedHistoryOrders.length} of {historyOrders.length} history orders. Page {currentHistoryPage} of {totalHistoryPages}.
            </p>
            {historyOrders.length === 0 ? <p>No order history yet.</p> : paginatedHistoryOrders.map(renderCustomerOrderCard)}
            {totalHistoryPages > 1 && (
              <div className="pagination-controls">
                <button type="button" onClick={() => setHistoryPage((current) => Math.max(1, current - 1))} disabled={currentHistoryPage === 1}>
                  Previous
                </button>
                {Array.from({ length: totalHistoryPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    type="button"
                    key={pageNumber}
                    className={pageNumber === currentHistoryPage ? "active" : ""}
                    onClick={() => setHistoryPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setHistoryPage((current) => Math.min(totalHistoryPages, current + 1))}
                  disabled={currentHistoryPage === totalHistoryPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {activeSection === "complaints" && (
        <>
          <form className="application-form" onSubmit={submitComplaint}>
            <SectionTitle
              title="Raise complaint"
              caption="Report delivery/service issues and track resolution from your dashboard."
            />
            <div className="field-grid">
              <label>
                Related order (optional)
                <select
                  value={complaintForm.orderId}
                  onChange={(event) => setComplaintForm((current) => ({ ...current, orderId: event.target.value }))}
                >
                  <option value="">General issue</option>
                  {orders.map((order) => (
                    <option key={order._id} value={order._id}>
                      {order.deliveryAddress} - {order.status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <TextInput
                label="Complaint details"
                name="message"
                value={complaintForm.message}
                onChange={(event) => setComplaintForm((current) => ({ ...current, message: event.target.value }))}
                wide
              />
            </div>
            <button type="submit" className="submit-button" disabled={status.type === "loading"}>
              <AlertTriangle size={18} />
              Submit complaint
            </button>
          </form>

          <div className="orders-list">
            <SectionTitle title="Complaint history" caption="Open tickets stay visible until resolved by admin." />
            {complaints.length === 0 ? <p>No complaints raised yet.</p> : complaints.map((complaint) => (
              <article className="order-item" key={complaint._id}>
                <div className="item-head">
                  <strong>{complaint.order?.deliveryAddress || "General complaint"}</strong>
                  <StatusBadge status={complaint.status} />
                </div>
                <p>{complaint.message}</p>
                {complaint.resolutionNote && <small>Resolution: {complaint.resolutionNote}</small>}
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DriverOrderBoard({ user, activeSection }) {
  const [orders, setOrders] = React.useState([]);
  const [reviews, setReviews] = React.useState([]);
  const [averageRating, setAverageRating] = React.useState(0);
  const [isAvailable, setIsAvailable] = React.useState(Boolean(user.isAvailable));
  const [autoTrackingOrderId, setAutoTrackingOrderId] = React.useState(null);
  const [arrivalCodes, setArrivalCodes] = React.useState({});
  const [chatByOrder, setChatByOrder] = React.useState({});
  const [chatDrafts, setChatDrafts] = React.useState({});
  const [chatOpenByOrder, setChatOpenByOrder] = React.useState({});
  const [chatLoadingByOrder, setChatLoadingByOrder] = React.useState({});
  const [chatMetaByOrder, setChatMetaByOrder] = React.useState({});
  const [status, setStatus] = React.useState({ type: "idle", message: "" });
  const trackingWatchRef = React.useRef(null);
  const trackingOrderIdRef = React.useRef(null);
  const locationUploadInFlightRef = React.useRef(false);
  const lastTrackingPushRef = React.useRef(0);
  const hasAutoSyncedRef = React.useRef(false);
  const myDriverId = user.id || user._id;
  const AUTO_TRACKING_INTERVAL_MS = 15000;
  const driverQuickReplies = [
    "I am on the way.",
    "Reached near your location.",
    "Please keep completion code ready.",
    "Delivery completed, thank you."
  ];

  React.useEffect(() => {
    loadDriverOrders();
    loadDriverReviews();
    const intervalId = window.setInterval(loadDriverOrders, 10000);
    return () => {
      window.clearInterval(intervalId);
      stopAutoTracking(false);
    };
  }, []);

  React.useEffect(() => {
    if (!autoTrackingOrderId) return;

    const trackedOrder = orders.find((order) => order._id === autoTrackingOrderId);
    const isStillTrackable =
      trackedOrder &&
      trackedOrder.driver?._id === myDriverId &&
      ["assigned", "out_for_delivery", "arrived"].includes(trackedOrder.status);

    if (!isStillTrackable) {
      stopAutoTracking(false);
    }
  }, [orders, autoTrackingOrderId, myDriverId]);

  React.useEffect(() => {
    if (activeSection !== "active-orders") return undefined;
    const openedOrderIds = Object.keys(chatOpenByOrder).filter((orderId) => chatOpenByOrder[orderId]);
    if (!openedOrderIds.length) return undefined;

    const refreshChats = () => {
      openedOrderIds.forEach((orderId) => {
        loadDriverOrderChat(orderId, { silent: true });
      });
    };

    refreshChats();
    const timerId = window.setInterval(refreshChats, 8000);
    return () => window.clearInterval(timerId);
  }, [activeSection, chatOpenByOrder]);

  async function driverFetch(url, options = {}) {
    const token = localStorage.getItem("token");
    const response = await fetch(apiUrl(url), {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) }
    });
    const data = await readApiResponse(response);
    if (!response.ok) throw new Error(data.message || "Driver request failed.");
    return data;
  }

  async function loadDriverOrders() {
    try {
      const data = await driverFetch("/orders/driver");
      setOrders(data.orders);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function loadDriverReviews() {
    try {
      const data = await driverFetch("/reviews/driver/mine");
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function toggleAvailability() {
    try {
      const nextValue = !isAvailable;
      const token = localStorage.getItem("token");
      const response = await fetch(apiUrl("/drivers/availability"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isAvailable: nextValue })
      });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.message || "Could not update availability.");
      setIsAvailable(data.driver.isAvailable);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function requestOrder(orderId) {
    try {
      setStatus({ type: "loading", message: "Sending order request..." });
      const data = await driverFetch(`/orders/${orderId}/request`, { method: "POST", body: JSON.stringify({}) });
      setOrders((current) => current.map((order) => (order._id === data.order._id ? data.order : order)));
      await loadDriverOrders();
      setStatus({ type: "success", message: "Request sent. Admin will approve the assignment." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function markOutForDelivery(orderId) {
    try {
      setStatus({ type: "loading", message: "Marking out for delivery..." });
      const data = await driverFetch(`/orders/${orderId}/driver-status`, { method: "PATCH", body: JSON.stringify({ status: "out_for_delivery" }) });
      setOrders((current) => current.map((order) => (order._id === data.order._id ? data.order : order)));
      setArrivalCodes((current) => ({ ...current, [orderId]: null }));
      startAutoTracking(orderId);
      setStatus({
        type: "success",
        message: "Order marked out for delivery. Auto GPS updates are now active."
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function markArrived(orderId) {
    try {
      setStatus({ type: "loading", message: "Verifying arrival and generating completion code..." });
      const data = await driverFetch(`/orders/${orderId}/driver-status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "arrived" })
      });
      setOrders((current) => current.map((order) => (order._id === data.order._id ? data.order : order)));
      setArrivalCodes((current) => ({
        ...current,
        [orderId]: {
          code: data.completionCode || "",
          expiresAt: data.completionCodeExpiresAt || null,
          distanceMeters: data.readiness?.distanceMeters ?? null,
          driverLocationAgeSeconds: data.readiness?.driverLocationAgeSeconds ?? null
        }
      }));
      stopAutoTracking(false);
      setStatus({
        type: "success",
        message: data.message || "Arrival verified. Share completion code with customer now."
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function updateDriverLocation(orderId, latitude, longitude, options = {}) {
    const { silentSuccess = false, silentError = false } = options;
    try {
      const data = await driverFetch(`/orders/${orderId}/location`, {
        method: "PATCH",
        body: JSON.stringify({ latitude, longitude })
      });
      setOrders((current) => current.map((order) => (order._id === data.order._id ? data.order : order)));
      if (!silentSuccess) {
        setStatus({ type: "success", message: "Live location updated." });
      }
      return data;
    } catch (error) {
      if (!silentError) {
        setStatus({ type: "error", message: error.message });
      }
      return null;
    }
  }

  function stopAutoTracking(showMessage = true) {
    if (trackingWatchRef.current !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(trackingWatchRef.current);
    }
    trackingWatchRef.current = null;
    trackingOrderIdRef.current = null;
    locationUploadInFlightRef.current = false;
    lastTrackingPushRef.current = 0;
    hasAutoSyncedRef.current = false;
    setAutoTrackingOrderId(null);
    if (showMessage) {
      setStatus({ type: "success", message: "Auto GPS tracking stopped." });
    }
  }

  function startAutoTracking(orderId) {
    if (!("geolocation" in navigator)) {
      setStatus({ type: "error", message: "Geolocation is not supported in this browser." });
      return;
    }

    if (trackingWatchRef.current !== null && trackingOrderIdRef.current === orderId) {
      return;
    }

    stopAutoTracking(false);
    trackingOrderIdRef.current = orderId;
    setAutoTrackingOrderId(orderId);
    setStatus({ type: "loading", message: "Starting auto GPS tracking..." });

    trackingWatchRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        if (trackingOrderIdRef.current !== orderId) return;
        const now = Date.now();
        if (locationUploadInFlightRef.current) return;
        if (lastTrackingPushRef.current && now - lastTrackingPushRef.current < AUTO_TRACKING_INTERVAL_MS) return;

        locationUploadInFlightRef.current = true;
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const updateResult = await updateDriverLocation(orderId, latitude, longitude, {
          silentSuccess: true,
          silentError: true
        });

        if (updateResult) {
          lastTrackingPushRef.current = now;
          if (!hasAutoSyncedRef.current) {
            hasAutoSyncedRef.current = true;
            setStatus({ type: "success", message: "Auto GPS tracking is live." });
          }
        }

        locationUploadInFlightRef.current = false;
      },
      (error) => {
        stopAutoTracking(false);
        setStatus({
          type: "error",
          message: error.message || "GPS tracking stopped. Allow location access to continue."
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 12000
      }
    );
  }

  function useCurrentLocation(orderId) {
    if (!("geolocation" in navigator)) {
      setStatus({ type: "error", message: "Geolocation is not supported in this browser." });
      return;
    }

    setStatus({ type: "loading", message: "Getting your location..." });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        await updateDriverLocation(orderId, latitude, longitude);
      },
      (error) => {
        setStatus({ type: "error", message: error.message || "Could not access current location." });
      }
    );
  }

  async function loadDriverOrderChat(orderId, options = {}) {
    const { silent = false } = options;
    setChatLoadingByOrder((current) => ({ ...current, [orderId]: true }));
    try {
      const data = await driverFetch(`/orders/${orderId}/chat`);
      setChatByOrder((current) => ({ ...current, [orderId]: data.messages || [] }));
      setChatMetaByOrder((current) => ({
        ...current,
        [orderId]: {
          canSend: Boolean(data.canSend),
          mutedUntil: data.mutedUntil || null,
          role: data.role || "driver",
          status: data.status || "",
          chatEscalatedAt: data.chatEscalatedAt || null
        }
      }));
    } catch (error) {
      if (!silent) {
        setStatus({ type: "error", message: error.message });
      }
    } finally {
      setChatLoadingByOrder((current) => ({ ...current, [orderId]: false }));
    }
  }

  function toggleDriverOrderChat(orderId) {
    setChatOpenByOrder((current) => {
      const nextIsOpen = !current[orderId];
      const nextState = { ...current, [orderId]: nextIsOpen };
      if (nextIsOpen) {
        loadDriverOrderChat(orderId);
      }
      return nextState;
    });
  }

  async function sendDriverOrderChatMessage(orderId, presetMessage = "") {
    const message = (presetMessage || chatDrafts[orderId] || "").trim();
    if (!message) return;

    setChatLoadingByOrder((current) => ({ ...current, [orderId]: true }));
    try {
      const data = await driverFetch(`/orders/${orderId}/chat`, {
        method: "POST",
        body: JSON.stringify({ message })
      });
      setChatByOrder((current) => ({ ...current, [orderId]: data.messages || [] }));
      setChatMetaByOrder((current) => ({
        ...current,
        [orderId]: {
          ...(current[orderId] || {}),
          mutedUntil: data.mutedUntil || null,
          chatEscalatedAt: data.chatEscalatedAt || null
        }
      }));
      setChatDrafts((current) => ({ ...current, [orderId]: "" }));
    } catch (error) {
      setStatus({ type: "error", message: error.message });
      await loadDriverOrderChat(orderId, { silent: true });
    } finally {
      setChatLoadingByOrder((current) => ({ ...current, [orderId]: false }));
    }
  }

  async function cancelDriverOrder(orderId) {
    try {
      setStatus({ type: "loading", message: "Cancelling this order engagement..." });
      const data = await driverFetch(`/orders/${orderId}/driver-cancel`, {
        method: "PATCH",
        body: JSON.stringify({})
      });
      if (trackingOrderIdRef.current === orderId) {
        stopAutoTracking(false);
      }
      await loadDriverOrders();
      setArrivalCodes((current) => ({ ...current, [orderId]: null }));
      setStatus({
        type: "success",
        message: data.message || "Order released. You can take another order now."
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  const activeOrders = orders.filter((order) => order.status !== "completed");
  const completedOrders = orders.filter((order) => order.status === "completed");
  const hasDriverLink = (order) =>
    order.driver?._id === myDriverId ||
    order.driverRequests?.some((driver) => driver._id === myDriverId);
  const hasActiveEngagement = activeOrders.some(
    (order) => hasDriverLink(order) && ["requested", "assigned", "out_for_delivery", "arrived"].includes(order.status)
  );
  const visibleActiveOrders = activeOrders;

  function renderDriverOrder(order) {
    const isAssignedToMe = order.driver?._id === myDriverId;
    const hasRequested = order.driverRequests?.some((driver) => driver._id === myDriverId);
    const isTrackingThisOrder = autoTrackingOrderId === order._id;
    const distanceToCustomerKm = calculateDistanceKm(order.driverLocation, order.customerLocation);
    const customerMapUrl = buildMapUrl(order.customerLocation);
    const isChatEnabled = isAssignedToMe && ["assigned", "out_for_delivery", "arrived"].includes(order.status);
    const chatMeta = chatMetaByOrder[order._id] || {};
    const isChatOpen = Boolean(chatOpenByOrder[order._id]);
    const arrivalCodeMeta = arrivalCodes[order._id];
    const preferredDriverId = order.preferredDriver?._id || "";
    const isPreferredForMe = Boolean(preferredDriverId) && preferredDriverId === myDriverId;
    const isPreferredForOther = Boolean(preferredDriverId) && preferredDriverId !== myDriverId;

    return (
      <OrderCard key={order._id} order={order}>
        {isAssignedToMe && <span>Assigned to you</span>}
        {isAssignedToMe && order.status === "assigned" && (
          <button type="button" className="inline-action" onClick={() => markOutForDelivery(order._id)}>
            <PackagePlus size={17} />
            Out for delivery
          </button>
        )}
        {isAssignedToMe && ["assigned", "out_for_delivery", "arrived"].includes(order.status) && (
          <div className="location-actions">
            <div className="filter-row">
              {(order.status === "out_for_delivery" || order.status === "arrived") && (
                <button type="button" onClick={() => markArrived(order._id)}>
                  <CheckCircle2 size={16} />
                  {order.status === "arrived" ? "Refresh completion code" : "Mark arrived"}
                </button>
              )}
              {order.status === "out_for_delivery" && (
                <button type="button" onClick={() => startAutoTracking(order._id)}>
                  <PlayCircle size={16} />
                  {isTrackingThisOrder ? "Auto GPS on" : "Start auto GPS"}
                </button>
              )}
              {order.status === "out_for_delivery" && isTrackingThisOrder && (
                <button type="button" onClick={() => stopAutoTracking()}>
                  <PauseCircle size={16} />
                  Stop auto GPS
                </button>
              )}
              <button type="button" onClick={() => useCurrentLocation(order._id)}>
                <MapPin size={16} />
                Sync now
              </button>
            </div>
            <span className="meta-block">
              Manual latitude/longitude entry is disabled for trust and anti-fraud safety.
            </span>
            {order.driverLocation && (
              <a
                href={buildMapUrl(order.driverLocation)}
                target="_blank"
                rel="noreferrer"
                className="location-pill"
                title={formatCoordinates(order.driverLocation)}
              >
                <MapPin size={14} />
                Open shared map
              </a>
            )}
            {customerMapUrl && (
              <a
                href={customerMapUrl}
                target="_blank"
                rel="noreferrer"
                className="location-pill"
                title={formatCoordinates(order.customerLocation)}
              >
                <MapPin size={14} />
                Customer map pin
              </a>
            )}
            {distanceToCustomerKm !== null && (
              <span className="delivery-key">Distance to customer: {formatDistance(distanceToCustomerKm)}</span>
            )}
            {arrivalCodeMeta?.code && (
              <span className="completion-code-callout">
                Completion code: {arrivalCodeMeta.code} (expires {formatDateTime(arrivalCodeMeta.expiresAt)})
              </span>
            )}
            {arrivalCodeMeta?.distanceMeters !== null && arrivalCodeMeta?.distanceMeters !== undefined && (
              <span className="delivery-key">
                Arrival check: {arrivalCodeMeta.distanceMeters}m away, GPS age {arrivalCodeMeta.driverLocationAgeSeconds ?? "-"}s
              </span>
            )}
            {!customerMapUrl && <span className="delivery-key">Customer GPS not shared. Use address navigation.</span>}
          </div>
        )}
        {isChatEnabled && (
          <button type="button" className="inline-action" onClick={() => toggleDriverOrderChat(order._id)}>
            <MessageCircle size={17} />
            {isChatOpen ? "Hide chat" : "Open chat"}
          </button>
        )}
        {isChatEnabled && isChatOpen && (
          <OrderChatPanel
            role="driver"
            messages={chatByOrder[order._id] || []}
            draft={chatDrafts[order._id] || ""}
            canSend={Boolean(chatMeta.canSend)}
            mutedUntil={chatMeta.mutedUntil || null}
            loading={Boolean(chatLoadingByOrder[order._id])}
            onDraftChange={(value) =>
              setChatDrafts((current) => ({ ...current, [order._id]: value }))
            }
            onSend={() => sendDriverOrderChatMessage(order._id)}
            quickReplies={driverQuickReplies}
            onQuickReply={(message) => sendDriverOrderChatMessage(order._id, message)}
          />
        )}
        {!order.driver && hasRequested && <span>Your request is waiting for admin approval.</span>}
        {!order.driver && isPreferredForMe && (
          <span className="delivery-key">Customer selected you as preferred driver.</span>
        )}
        {!order.driver && isPreferredForOther && (
          <span className="meta-block">
            Customer selected {order.preferredDriver?.name || "another driver"} for this order.
          </span>
        )}
        {!order.driver && hasRequested && (
          <button type="button" className="inline-action" onClick={() => cancelDriverOrder(order._id)}>
            <Trash2 size={17} />
            Withdraw request
          </button>
        )}
        {isAssignedToMe && ["assigned", "out_for_delivery", "arrived"].includes(order.status) && (
          <button type="button" className="inline-action" onClick={() => cancelDriverOrder(order._id)}>
            <Trash2 size={17} />
            Cancel this order
          </button>
        )}
        {!order.driver && !hasRequested && !hasActiveEngagement && isAvailable && !isPreferredForOther && <button type="button" className="inline-action" onClick={() => requestOrder(order._id)}><PackagePlus size={17} />Request order</button>}
        {!order.driver && !hasRequested && !isAvailable && <span>Set yourself available before requesting orders.</span>}
        {!order.driver && !hasRequested && hasActiveEngagement && (
          <span className="meta-block">You can see all public orders, but request is locked until your active engagement is closed.</span>
        )}
      </OrderCard>
    );
  }

  return (
    <div className="dashboard-stack">
      <div className="toolbar-card">
        <span><strong>Availability</strong><small>{isAvailable ? "You can request orders." : "You are not taking orders."}</small></span>
        <button type="button" className="secondary-button" onClick={toggleAvailability}>{isAvailable ? "Set unavailable" : "Set available"}</button>
      </div>
      <nav className="dashboard-nav" aria-label="Driver sections">
        {roleSectionNav.driver.map((section) => (
          <button
            type="button"
            key={section.id}
            className={activeSection === section.id ? "active" : ""}
            onClick={() => navigateWithReload(buildRoleSectionPath("driver", section.id))}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <StatusMessage status={status} />

      {activeSection === "active-orders" && (
        <div className="orders-list">
          <SectionTitle title="Driver orders" caption="All open orders are visible publicly. You can request a new one after your active engagement is completed or cancelled." />
          {hasActiveEngagement && (
            <p className="meta-block">
              Active order lock is on for requesting only, not for visibility.
            </p>
          )}
          {visibleActiveOrders.length === 0 ? <p>No open orders right now.</p> : visibleActiveOrders.map(renderDriverOrder)}
        </div>
      )}

      {activeSection === "completed-orders" && (
        <div className="orders-list">
          <SectionTitle title="Completed deliveries" caption="Your finished delivery history." />
          {completedOrders.length === 0 ? <p>No completed deliveries yet.</p> : completedOrders.map(renderDriverOrder)}
        </div>
      )}

      {activeSection === "reviews" && (
        <div className="orders-list">
          <SectionTitle title="Customer reviews" caption={`Average rating: ${averageRating || 0}/5`} />
          {reviews.length === 0 ? <p>No reviews yet.</p> : reviews.map((review) => (
            <article className="order-item" key={review._id}>
              <div className="item-head">
                <strong>{review.customer?.name || "Customer"}</strong>
                <span className="rating-pill"><Star size={15} /> {review.rating}/5</span>
              </div>
              <div className="detail-grid">
                <span>Order: {review.order?.deliveryAddress || "Completed delivery"}</span>
                <span>Quantity: {review.order?.litres || "-"} litres</span>
              </div>
              {review.comment && <p>{review.comment}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, children }) {
  return (
    <article className="order-item">
      <div className="item-head"><strong>{order.deliveryAddress}</strong><StatusBadge status={order.status} /></div>
      <div className="detail-grid">
        <span>Order date: {formatDateTime(order.createdAt)}</span>
        <span>Last update: {formatDateTime(order.updatedAt)}</span>
        {order.scheduledFor && <span>Scheduled for: {formatDateTime(order.scheduledFor)}</span>}
        {order.customer && <span>Customer: {order.customer.name}</span>}
        {order.customer?.phone && <span>Phone: {order.customer.phone}</span>}
        {order.customer?.email && <span>Email: {order.customer.email}</span>}
        <span>Quantity: {order.litres} litres</span>
        <span>Payment: Cash on delivery</span>
        {order.driver && <span>Driver: {order.driver.name}</span>}
      </div>
      <OrderTimeline history={order.statusHistory} />
      {children}
    </article>
  );
}

function OrderChatPanel({
  role,
  messages = [],
  draft,
  canSend,
  mutedUntil,
  loading,
  onDraftChange,
  onSend,
  quickReplies = [],
  onQuickReply
}) {
  const isMuted = mutedUntil && new Date(mutedUntil).getTime() > Date.now();

  return (
    <section className="chat-panel" aria-label="Order chat">
      <div className="chat-panel-head">
        <strong>Order chat</strong>
        {isMuted && <span className="delivery-key">Muted until {formatDateTime(mutedUntil)}</span>}
      </div>
      <div className="chat-feed">
        {messages.length === 0 ? (
          <p className="meta-block">No messages yet.</p>
        ) : (
          messages.map((entry, index) => {
            const isSystem = entry.senderRole === "system";
            const isMine = entry.senderRole === role;
            return (
              <article
                key={`${entry.createdAt || "time"}-${index}`}
                className={`chat-message ${isSystem ? "system" : isMine ? "mine" : "theirs"}`}
              >
                <div>
                  <strong>{isSystem ? "System" : entry.senderName || entry.senderRole}</strong>
                  <small>{formatChatTime(entry.createdAt)}</small>
                </div>
                <p>{entry.message}</p>
              </article>
            );
          })
        )}
      </div>
      {quickReplies.length > 0 && (
        <div className="chat-quick-row">
          {quickReplies.map((reply) => (
            <button
              type="button"
              key={reply}
              onClick={() => onQuickReply && onQuickReply(reply)}
              disabled={!canSend || loading}
            >
              {reply}
            </button>
          ))}
        </div>
      )}
      <div className="chat-compose">
        <input
          placeholder={canSend ? "Type your message..." : "Chat locked for this order"}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSend();
            }
          }}
          disabled={!canSend || loading}
        />
        <button type="button" onClick={onSend} disabled={!canSend || loading}>
          <Send size={16} />
          Send
        </button>
      </div>
    </section>
  );
}

function ReviewBox({ form, onChange, onSubmit }) {
  if (form.submitted) {
    return <span className="delivery-key">Review submitted. Thank you.</span>;
  }

  return (
    <div className="review-box">
      <label>
        Driver rating
        <select value={form.rating} onChange={(event) => onChange("rating", event.target.value)}>
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Good</option>
          <option value="3">3 - Average</option>
          <option value="2">2 - Poor</option>
          <option value="1">1 - Bad</option>
        </select>
      </label>
      <label>
        Review comment
        <input
          value={form.comment}
          onChange={(event) => onChange("comment", event.target.value)}
          placeholder="Write your experience with the driver"
        />
      </label>
      <button type="button" className="inline-action" onClick={onSubmit}>
        <Star size={17} />
        Submit review
      </button>
    </div>
  );
}

function TextInput({ label, wide, required = true, ...props }) {
  return (
    <label className={wide ? "wide" : ""}>
      {label}
      <input {...props} required={required} />
    </label>
  );
}

function StatusMessage({ status }) {
  if (!status.message) return null;
  return (
    <div className={`status ${status.type}`}>
      {status.type === "loading" && <Loader2 size={18} className="spin" />}
      {status.type === "success" && <CheckCircle2 size={18} />}
      {status.type === "error" && <XCircle size={18} />}
      <span>{status.message}</span>
    </div>
  );
}

function SectionTitle({ title, caption }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      <p>{caption}</p>
    </div>
  );
}

function AdminVisualStats({ stats, complaintStats, monthlyLitres = [] }) {
  const totalOrders = Math.max(1, Number(stats.total || 0));
  const completed = Number(stats.completed || 0);
  const completionRate = Math.round((completed / totalOrders) * 100);
  const complaintOpen = Number(complaintStats.open || 0);
  const complaintProgress = Number(complaintStats.in_progress || 0);
  const complaintResolved = Number(complaintStats.resolved || 0);
  const complaintTotal = Math.max(1, complaintOpen + complaintProgress + complaintResolved);

  const orderSeries = [
    { label: "Pending", value: Number(stats.pending || 0), tone: "warning" },
    { label: "Active", value: Number(stats.active || 0), tone: "active" },
    { label: "Completed", value: completed, tone: "success" }
  ];

  const complaintSeries = [
    { label: "Open", value: complaintOpen, tone: "danger" },
    { label: "In progress", value: complaintProgress, tone: "warning" },
    { label: "Resolved", value: complaintResolved, tone: "success" }
  ];

  return (
    <section className="admin-visual-grid" aria-label="Admin visual analytics">
      <article className="admin-visual-card ring-card">
        <div className="ring-head">
          <h3>Order Completion</h3>
          <small>Live completion performance</small>
        </div>
        <div className="ring-wrap">
          <div className="progress-ring" style={{ "--value": `${completionRate}%` }}>
            <span>{completionRate}%</span>
          </div>
          <div className="ring-meta">
            <p>Completed: {completed}</p>
            <p>Total orders: {stats.total}</p>
            <p>Delivered litres: {stats.litres}L</p>
          </div>
        </div>
      </article>

      <article className="admin-visual-card">
        <div className="ring-head">
          <h3>Order Distribution</h3>
          <small>How your workload is split</small>
        </div>
        <div className="bar-stack">
          {orderSeries.map((item) => (
            <VisualBar key={item.label} label={item.label} value={item.value} total={totalOrders} tone={item.tone} />
          ))}
        </div>
      </article>

      <article className="admin-visual-card">
        <div className="ring-head">
          <h3>Complaint Health</h3>
          <small>Support ticket balance</small>
        </div>
        <div className="bar-stack">
          {complaintSeries.map((item) => (
            <VisualBar key={item.label} label={item.label} value={item.value} total={complaintTotal} tone={item.tone} />
          ))}
        </div>
      </article>

      <article className="admin-visual-card wide">
        <div className="ring-head">
          <h3>Monthly Sold Litres</h3>
          <small>Record of delivered litres per month (current month first)</small>
        </div>
        <MonthlyLitresBars monthlyLitres={monthlyLitres} />
      </article>
    </section>
  );
}

function MonthlyLitresBars({ monthlyLitres = [] }) {
  if (!monthlyLitres.length) {
    return <p className="meta-block">No monthly sales record available yet.</p>;
  }

  const highestLitres = Math.max(1, ...monthlyLitres.map((item) => Number(item.litres || 0)));

  return (
    <div className="monthly-bars-grid">
      {monthlyLitres.map((month) => {
        const litres = Number(month.litres || 0);
        const percentage = Math.max(5, Math.round((litres / highestLitres) * 100));

        return (
          <div className="monthly-bar-row" key={`${month.year}-${month.month}`}>
            <div className="monthly-bar-top">
              <strong>{month.label}</strong>
              <span>{litres}L • {month.completedOrders || 0} orders</span>
            </div>
            <div className="monthly-bar-track">
              <div className="monthly-bar-fill" style={{ width: `${percentage}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VisualBar({ label, value, total, tone }) {
  const safeTotal = Math.max(1, Number(total || 1));
  const safeValue = Number(value || 0);
  const percentage = Math.round((safeValue / safeTotal) * 100);

  return (
    <div className="visual-bar-row">
      <div className="visual-bar-top">
        <strong>{label}</strong>
        <span>{safeValue} ({percentage}%)</span>
      </div>
      <div className="visual-bar-track">
        <div className={`visual-bar-fill ${tone}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function OrderTimeline({ history = [] }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  if (!history.length) return null;
  const compactHistory = history.filter((item, index) => {
    if (index === 0) return true;
    const previous = history[index - 1];
    const sameStatus = previous?.status === item?.status;
    const sameRole = previous?.changedByRole === item?.changedByRole;
    const sameMessage = (previous?.message || "") === (item?.message || "");
    return !(sameStatus && sameRole && sameMessage);
  });
  const defaultVisibleCount = 3;
  const visibleHistory = isExpanded ? compactHistory : compactHistory.slice(0, defaultVisibleCount);

  function readableMessage(item) {
    const baseMessage = item?.message || item?.changedByRole || "";

    if (item?.changedByRole === "driver" && /requested this order/i.test(baseMessage)) {
      return "Driver requested this order.";
    }

    if (item?.changedByRole === "admin" && /approved .* for this order/i.test(baseMessage)) {
      return "Admin approved a driver for this order.";
    }

    return baseMessage;
  }

  return (
    <div className="timeline">
      {visibleHistory.map((item, index) => (
        <div className="timeline-item" key={`${item.status}-${item.changedAt}-${index}`}>
          <span />
          <p>
            <strong>{item.status.replaceAll("_", " ")}</strong>
            <small>{readableMessage(item)}</small>
          </p>
        </div>
      ))}
      {compactHistory.length > defaultVisibleCount && (
        <button
          type="button"
          className="timeline-toggle"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const label = status.replaceAll("_", " ");
  return <span className={`status-badge ${status.replaceAll("_", "-").replaceAll(" ", "-")}`}>{label}</span>;
}

function DocumentUpload({ id, title, file, preview, onChange }) {
  return (
    <label className="upload-box" htmlFor={id}>
      <input id={id} type="file" accept="image/jpeg,image/jpg,image/png" onChange={(event) => onChange(event.target.files?.[0])} />
      {preview ? <img src={preview} alt={`${title} preview`} /> : <span className="empty-preview"><FileImage size={36} /></span>}
      <span className="upload-copy">
        <strong>{title}</strong>
        <small>{file ? file.name : "JPG, JPEG, or PNG"}</small>
      </span>
    </label>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
