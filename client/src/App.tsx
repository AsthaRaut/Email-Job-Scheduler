
import { useEffect, useMemo, useState, type ChangeEvent, type SubmitEvent } from "react";import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  LayoutDashboard,
  Mail,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Users,
  Zap,
  X,
} from "lucide-react";
import "./App.css";

const API_BASE_URL = "http://localhost:5000";

const USER_ID = "46e6aa56-6e3f-4751-a204-db01e4022824";

const SENDER_ID = "b6a282b3-9304-4785-862b-a4e220eb6238";

type EmailStatus = "Scheduled" | "Sent" | "Failed";

type EmailRecord = {
  id: string | number;
  email: string;
  subject: string;
  status: EmailStatus;
  time: string;
};

type PageName =
  | "Dashboard"
  | "Compose email"
  | "Scheduled emails"
  | "Sent emails"
  | "Search emails"
  | "Slack integration";

const initialEmails: EmailRecord[] = [
  {
    id: 1,
    email: "john.doe@example.com",
    subject: "Product launch campaign",
    status: "Scheduled",
    time: "Today, 2:30 PM",
  },
  {
    id: 2,
    email: "sarah@company.com",
    subject: "June newsletter",
    status: "Scheduled",
    time: "Today, 5:00 PM",
  },
  {
    id: 3,
    email: "mike@company.com",
    subject: "Welcome to our platform",
    status: "Sent",
    time: "Yesterday, 11:20 AM",
  },
  {
    id: 4,
    email: "lisa@domain.com",
    subject: "Your weekly update",
    status: "Failed",
    time: "Yesterday, 4:10 PM",
  },
];

const navigation: {
  label: PageName;
  icon: typeof LayoutDashboard;
}[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Compose email", icon: Send },
  { label: "Scheduled emails", icon: CalendarClock },
  { label: "Sent emails", icon: CheckCircle2 },
  { label: "Search emails", icon: Search },
  { label: "Slack integration", icon: Zap },
];

function Stat({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof Mail;
  label: string;
  value: string | number;
  detail: string;
  tone: string;
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={19} />
      </div>
      <p className="stat-label">{label}</p>
      <div className="stat-number">{value}</div>
      <p className="stat-detail">{detail}</p>
    </article>
  );
}

function EmailTable({ emails }: { emails: EmailRecord[] }) {
  if (emails.length === 0) {
    return (
      <div className="empty-state">
        <Mail size={28} />
        <p>No emails to display.</p>
      </div>
    );
  }

  return (
    <div className="email-table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Recipient</th>
            <th>Subject</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {emails.map((email) => (
            <tr key={email.id}>
              <td>{email.email}</td>
              <td>
                <strong>{email.subject}</strong>
                <small>{email.time}</small>
              </td>
              <td>
                <span className={`status ${email.status.toLowerCase()}`}>
                  {email.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Upcoming({ email }: { email: EmailRecord }) {
  return (
    <div className="upcoming-item">
      <div className="upcoming-icon">
        <Mail size={16} />
      </div>
      <div className="upcoming-copy">
        <strong>{email.subject}</strong>
        <p>{email.time}</p>
        <small>{email.email}</small>
      </div>
      <span className="upcoming-dot" />
    </div>
  );
}

function Dashboard({
  emails,
  onNavigate,
}: {
  emails: EmailRecord[];
  onNavigate: (page: PageName) => void;
}) {
  const scheduled = emails.filter((email) => email.status === "Scheduled");
  const sent = emails.filter((email) => email.status === "Sent");

  return (
    <>
      <section className="welcome-row">
        <div>
          <p className="eyebrow">YOUR EMAIL WORKSPACE</p>
          <h1>
            Make every email
            <br />
            <span className="accent-text">count.</span>
          </h1>
          <p className="welcome-description">
            Schedule thoughtfully. Send confidently.
            <br />
            Let your next great conversation begin.
          </p>
          <button
            className="primary-btn"
            onClick={() => onNavigate("Compose email")}
          >
            <Send size={15} />
            Compose new email
            <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="hero-art">
          <div className="art-disc" />
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="envelope-3d">
            <Mail size={66} strokeWidth={1.2} />
          </div>
          <span className="art-note">Send something<br />worth opening.</span>
          <span className="art-caption">
            <Sparkles size={12} />
            A little more intention.
          </span>
        </div>
      </section>

      <div className="section-heading">
        <div>
          <h2>Your overview</h2>
          <p>A clear view of what is happening with your emails.</p>
        </div>
        <button
          className="secondary-btn"
          onClick={() => onNavigate("Scheduled emails")}
        >
          View schedule <ChevronRight size={14} />
        </button>
      </div>

      <section className="stats-grid">
        <Stat
          icon={CalendarClock}
          label="Scheduled emails"
          value={scheduled.length}
          detail="Prepared for delivery"
          tone="orange"
        />
        <Stat
          icon={Send}
          label="Emails sent"
          value={sent.length}
          detail="Demo records"
          tone="green"
        />
        <Stat
          icon={Activity}
          label="Delivery rate"
          value="—"
          detail="Available after backend integration"
          tone="purple"
        />
        <Stat
          icon={Clock3}
          label="Next delivery"
          value={scheduled.length ? "Scheduled" : "None"}
          detail="See your upcoming campaigns"
          tone="sand"
        />
      </section>

      <section className="content-grid">
        <article className="email-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent emails</h2>
              <p>Your latest email activity</p>
            </div>
            <button
              className="icon-button"
              aria-label="Search emails"
              onClick={() => onNavigate("Search emails")}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>

          <EmailTable emails={emails.slice(0, 4)} />

          <button
            className="text-link"
            onClick={() => onNavigate("Search emails")}
          >
            Explore all emails <ArrowUpRight size={13} />
          </button>
        </article>

        <div className="right-column">
          <article className="upcoming-panel">
            <div className="panel-heading">
              <div>
                <h2>Coming up</h2>
                <p>On your sending calendar</p>
              </div>
              <CalendarClock size={17} className="help-icon" />
            </div>

            {scheduled.length ? (
              scheduled.slice(0, 3).map((email) => (
                <Upcoming key={email.id} email={email} />
              ))
            ) : (
              <div className="empty-state">No upcoming emails.</div>
            )}
          </article>

          <article className="slack-card">
            <div className="slack-icon">
              <Zap size={20} />
            </div>
            <div>
              <p className="eyebrow">STAY IN THE LOOP</p>
              <h2>Good things,<br />straight to Slack.</h2>
              <p>Get notified when your sending limits are reached.</p>
              <button
                className="secondary-btn"
                onClick={() => onNavigate("Slack integration")}
              >
                Connect Slack <ArrowUpRight size={13} />
              </button>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}

function ComposeEmail({
  onSchedule,
}: {
  onSchedule: (data: {
    recipients: string[];
    subject: string;
    body: string;
    date: string;
    delay: number;
    hourlyLimit: number;
  }) =>  Promise<void>;
}) {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState("");
  const [delay, setDelay] = useState(30);
  const [hourlyLimit, setHourlyLimit] = useState(100);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const text = String(reader.result || "");
      const matches =
        text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];

      const unique = [...new Set(matches.map((email) => email.toLowerCase()))];

      setRecipients(unique);
      setNotice(`${unique.length} unique recipient(s) detected.`);
      setError("");
    };

    reader.onerror = () => {
      setError("Unable to read this file. Please try another CSV or TXT file.");
    };

    reader.readAsText(file);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!recipients.length) {
      setError("Please upload a CSV or TXT file containing email addresses.");
      return;
    }

    if (!subject.trim() || !body.trim()) {
      setError("Please enter both a subject and an email message.");
      return;
    }

    if (!date) {
      setError("Please choose a date and time for your campaign.");
      return;
    }

    if (new Date(date).getTime() <= Date.now()) {
      setError("Please choose a future date and time.");
      return;
    }

    if (delay < 1 || hourlyLimit < 1) {
      setError("Delay and hourly sending limit must be greater than zero.");
      return;
    }

    try {
      await onSchedule({
        recipients,
        subject: subject.trim(),
        body: body.trim(),
        date,
        delay,
        hourlyLimit,
      });

      setNotice(
        `Campaign successfully scheduled for ${recipients.length} recipient(s).`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to schedule campaign. Please try again."
      );
    }
  }

  function clearForm() {
    setRecipients([]);
    setSubject("");
    setBody("");
    setDate("");
    setDelay(30);
    setHourlyLimit(100);
    setNotice("");
    setError("");
  }

  return (
    <div className="compose-page">
      <div className="compose-heading">
        <p className="eyebrow">CAMPAIGN WORKSPACE</p>
        <h1>
          Compose with
          <br />
          <span className="accent-text">intention.</span>
        </h1>
        <p>Prepare your message and choose when it should reach your audience.</p>
      </div>

      <form className="compose-form" onSubmit={handleSubmit}>
        <section className="compose-card">
          <div className="panel-heading">
            <div>
              <h2>01 — Your recipients</h2>
              <p>Upload your list to get started.</p>
            </div>
            <Users size={18} className="help-icon" />
          </div>

          <label className="upload-area">
            <Upload size={23} />
            <strong>Choose your recipient file</strong>
            <p>CSV or TXT · Email addresses detected automatically</p>
            <input
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              onChange={handleFile}
            />
          </label>

          <div className="recipient-count">
            <Users size={15} />
            {recipients.length} unique recipient(s) detected
          </div>

          {recipients.length > 0 && (
            <div className="recipient-preview">
              {recipients.slice(0, 5).map((email) => (
                <span key={email}>{email}</span>
              ))}
              {recipients.length > 5 && (
                <span>+{recipients.length - 5} more</span>
              )}
            </div>
          )}
        </section>

        <section className="compose-card">
          <div className="panel-heading">
            <div>
              <h2>02 — Write your email</h2>
              <p>Keep your message clear and relevant.</p>
            </div>
            <Sparkles size={18} className="help-icon" />
          </div>

          <label className="field-label" htmlFor="email-subject">
            Subject line
          </label>
          <input
            id="email-subject"
            className="compose-input"
            type="text"
            placeholder="A subject your audience will want to open"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />

          <label className="field-label body-label" htmlFor="email-body">
            Email body
          </label>
          <textarea
            id="email-body"
            className="compose-textarea"
            placeholder="Write your email message here..."
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={8}
          />

          <p className="character-count">{body.length} characters</p>
        </section>

        <section className="compose-card">
          <div className="panel-heading">
            <div>
              <h2>03 — Delivery settings</h2>
              <p>Control the timing and pace of your campaign.</p>
            </div>
            <CalendarClock size={18} className="help-icon" />
          </div>

          <div className="compose-settings-grid">
            <div className="full-width-field">
              <label className="field-label" htmlFor="delivery-date">
                Start date and time
              </label>
              <input
                id="delivery-date"
                className="compose-input"
                type="datetime-local"
                value={date}
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                  .toISOString()
                  .slice(0, 16)}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="email-delay">
                Delay between emails (seconds)
              </label>
              <input
                id="email-delay"
                className="compose-input"
                type="number"
                min={1}
                value={delay}
                onChange={(event) => setDelay(Number(event.target.value))}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="hourly-limit">
                Hourly sending limit
              </label>
              <input
                id="hourly-limit"
                className="compose-input"
                type="number"
                min={1}
                value={hourlyLimit}
                onChange={(event) =>
                  setHourlyLimit(Number(event.target.value))
                }
              />
            </div>
          </div>

          <div className="delivery-summary">
            <Clock3 size={16} />
            Up to {hourlyLimit} emails per hour, with a {delay}-second delay
            between emails.
          </div>
        </section>

        {error && <div className="compose-error">{error}</div>}
        {notice && <div className="compose-notice">{notice}</div>}

        <div className="compose-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={clearForm}
          >
            <X size={14} />
            Clear form
          </button>

          <button type="submit" className="primary-btn">
            <CalendarClock size={15} />
            Schedule campaign
            <ArrowUpRight size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}

function EmailListPage({
  title,
  description,
  emails,
  search,
  setSearch,
  emptyMessage,
  onCompose,
}: {
  title: string;
  description: string;
  emails: EmailRecord[];
  search: string;
  setSearch: (value: string) => void;
  emptyMessage: string;
  onCompose: () => void;
}) {
  return (
    <div className="page-placeholder">
      <div className="section-heading">
        <div>
          <p className="eyebrow">EMAIL WORKSPACE</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <button className="primary-btn" onClick={onCompose}>
          <Send size={15} />
          Compose email
          <ArrowUpRight size={15} />
        </button>
      </div>

      <section className="email-panel">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by recipient, subject or status..."
            aria-label="Search emails"
          />
        </div>

        {emails.length > 0 ? (
          <EmailTable emails={emails} />
        ) : (
          <div className="email-empty-state">
            <div className="empty-state-icon">
              <Mail size={24} />
            </div>
            <h3>No emails found</h3>
            <p>{emptyMessage}</p>
            <button className="secondary-btn" onClick={onCompose}>
              Compose an email <ArrowUpRight size={14} />
            </button>
          </div>
        )}

        <div className="email-list-footer">
          <span>{emails.length} records shown</span>
          <span>Email workspace</span>
        </div>
      </section>
    </div>
  );
}

function SlackIntegration() {
  const [connected, setConnected] = useState(false);

  return (
    <div className="page-placeholder integration-page">
      <p className="eyebrow">WORKSPACE INTEGRATIONS</p>
      <h1>Stay in the loop.</h1>
      <p className="integration-description">
        Keep your team informed about campaign activity and sending limits.
      </p>

      <section className="integration-card">
        <div className="integration-icon">
          <Zap size={28} />
        </div>

        <div className="integration-copy">
          <h2>Slack notifications</h2>
          <p>
            Receive campaign updates and sending-limit alerts in your Slack
            workspace.
          </p>
          <span className={`integration-status ${connected ? "connected" : ""}`}>
            <span className="online-dot" />
            {connected ? "Demo connection enabled" : "Not connected"}
          </span>
        </div>

        <button
          className={connected ? "secondary-btn" : "primary-btn"}
          onClick={() => setConnected((value) => !value)}
        >
          {connected ? "Disconnect demo" : "Connect Slack"}
          <ArrowUpRight size={14} />
        </button>
      </section>

      <p className="integration-note">
        <ShieldCheck size={15} />
        This is a frontend demonstration. Actual Slack notifications require
        backend integration and Slack OAuth configuration.
      </p>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState<PageName>("Dashboard");
  const [emails, setEmails] = useState<EmailRecord[]>(initialEmails);
    useEffect(() => {
    async function fetchEmails() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/emails?userId=${USER_ID}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch emails.");
        }

        const records: EmailRecord[] = result.data.map((item: {
          id: string;
          recipient: string;
          subject: string;
          status: string;
          scheduled_at: string;
          sent_at: string | null;
        }) => ({
          id: item.id,
          email: item.recipient,
          subject: item.subject,
          status:
            item.status === "sent"
              ? "Sent"
              : item.status === "failed"
                ? "Failed"
                : "Scheduled",
          time: new Date(
            item.sent_at || item.scheduled_at
          ).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
          }),
        }));

        setEmails(records);
      } catch (error) {
        console.error("Fetch emails error:", error);
      }
    }

    fetchEmails();
  }, []);
  
  const [query, setQuery] = useState("");

  const scheduledEmails = emails.filter(
    (email) => email.status === "Scheduled"
  );

  const sentEmails = emails.filter((email) => email.status === "Sent");

  const visibleEmails = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return emails;

    return emails.filter((email) =>
      [email.email, email.subject, email.status, email.time]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [emails, query]);

  function navigateTo(page: PageName) {
    setActive(page);
    setQuery("");
  }

 async function handleSchedule(data: {
  recipients: string[];
  subject: string;
  body: string;
  date: string;
  delay: number;
  hourlyLimit: number;
}) {
  const response = await fetch(`${API_BASE_URL}/api/emails/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: USER_ID,
      senderId: SENDER_ID,
      subject: data.subject,
      body: data.body,
      recipients: data.recipients,
      startAt: new Date(data.date).toISOString(),
      delayMs: data.delay * 1000,
      hourlyLimit: data.hourlyLimit,
    }),
  });

  const result: {
    success: boolean;
    message: string;
    data?: {
      campaignId: string;
      totalEmails: number;
      startAt: string;
    };
  } = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "Failed to schedule campaign.");
  }

  const campaignId = result.data.campaignId;
  const startTime = new Date(result.data.startAt).getTime();

  const newRecords: EmailRecord[] = data.recipients.map((email, index) => ({
    id: `${campaignId}-${index}`,
    email,
    subject: data.subject,
    status: "Scheduled",
    time: new Date(
      startTime + index * data.delay * 1000
    ).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  }));

  setEmails((current) => [...newRecords, ...current]);
}

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="brand">
          <Send size={19} />
          <span>ReachInbox</span>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav>
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${active === label ? "active" : ""}`}
              onClick={() => navigateTo(label)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <CircleHelp size={17} className="help-icon" />
          <strong>Need a hand?</strong>
          <p>Make your email workflow work smarter.</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={13} />
            <span>{active}</span>
          </div>

          <div className="topbar-right">
            <span className="online-dot" />
            <span>Frontend preview</span>
            <div className="avatar">AR</div>
          </div>
        </header>

        {active === "Dashboard" && (
          <Dashboard emails={emails} onNavigate={navigateTo} />
        )}

        {active === "Compose email" && (
          <ComposeEmail onSchedule={handleSchedule} />
        )}

        {active === "Scheduled emails" && (
          <EmailListPage
            title="Scheduled emails"
            description="Campaigns prepared for future delivery."
            emails={scheduledEmails.filter((email) =>
              [email.email, email.subject, email.status, email.time]
                .join(" ")
                .toLowerCase()
                .includes(query.trim().toLowerCase())
            )}
            search={query}
            setSearch={setQuery}
            emptyMessage="No scheduled emails found."
            onCompose={() => navigateTo("Compose email")}
          />
        )}

        {active === "Sent emails" && (
          <EmailListPage
            title="Sent emails"
            description="Review your email sending history."
            emails={sentEmails.filter((email) =>
              [email.email, email.subject, email.status, email.time]
                .join(" ")
                .toLowerCase()
                .includes(query.trim().toLowerCase())
            )}
            search={query}
            setSearch={setQuery}
            emptyMessage="No sent emails found."
            onCompose={() => navigateTo("Compose email")}
          />
        )}

        {active === "Search emails" && (
          <EmailListPage
            title="Search emails"
            description="Find email records by recipient, subject or status."
            emails={visibleEmails}
            search={query}
            setSearch={setQuery}
            emptyMessage="No matching emails. Try another search."
            onCompose={() => navigateTo("Compose email")}
          />
        )}

        {active === "Slack integration" && <SlackIntegration />}

        <footer className="footer">
          <span>ReachInbox · Thoughtful email, at scale.</span>
          <span>
            <ShieldCheck size={12} />
            Frontend preview
          </span>
        </footer>
      </main>
    </div>
  );
}
