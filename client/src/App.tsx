import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import {
  ApiError,
  api,
  type Acknowledgement,
  type Attachment,
  type Batch,
  type ReferenceData,
  type User
} from "./services/api";

const demoPassword = "DemoOnly!2026";

const channelLabels: Record<string, string> = {
  physical_handover: "Physical handover",
  pickup: "Picked up by staff"
};

function formatStatus(status: string): string {
  return status.replaceAll("_", " ");
}

function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState("staff@demo.ayospapel.test");
  const [password, setPassword] = useState(demoPassword);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api.login(email, password);
      onLogin(result.user);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="welcome-panel" aria-labelledby="welcome-title">
        <div className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="eyebrow">Accounting documents, kept in order</p>
        <h1 id="welcome-title">Every paper has a place and a clear history.</h1>
        <p>
          Receive batches, track physical custody, and give clients a simple
          acknowledgement—without encoding every receipt.
        </p>
        <div className="trust-note">
          <span aria-hidden="true">✓</span>
          Synthetic local pilot. No real client data.
        </div>
      </section>

      <Card className="login-card" aria-labelledby="signin-title">
        <div>
          <p className="eyebrow">AyosPapel</p>
          <h2 id="signin-title">Welcome back</h2>
          <p className="muted">Sign in to your private workspace.</p>
        </div>
        <form onSubmit={submit}>
          <Label>
            Email address
            <Input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Label>
          <Label>
            Password
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Label>
          {error && (
            <Alert className="alert error" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button size="lg" className="primary-button" disabled={busy}>
            {busy ? "Signing in…" : "Sign in securely"}
          </Button>
        </form>
        <div className="demo-accounts">
          <p>Try a synthetic role</p>
          <div>
            {[
              ["Assigned staff", "staff@demo.ayospapel.test"],
              ["Owner", "owner@demo.ayospapel.test"],
              ["Client", "client@demo.ayospapel.test"],
              ["Unassigned staff", "unassigned@demo.ayospapel.test"]
            ].map(([label, account]) => (
              <Button
                variant="ghost"
                className="text-button"
                type="button"
                key={account}
                onClick={() => {
                  setEmail(account);
                  setPassword(demoPassword);
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </main>
  );
}

function BatchForm({
  data,
  onCreated,
  onCancel
}: {
  data: ReferenceData;
  onCreated: (batch: Batch) => void;
  onCancel: () => void;
}) {
  const firstClient = data.clients[0]?.id ?? "";
  const [clientId, setClientId] = useState(firstClient);
  const availablePeriods = useMemo(
    () => data.periods.filter((period) => period.clientId === clientId),
    [clientId, data.periods]
  );
  const [periodId, setPeriodId] = useState(
    data.periods.find((period) => period.clientId === firstClient)?.id ?? ""
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [senderName, setSenderName] = useState("");
  const [channel, setChannel] = useState("physical_handover");
  const [locationId, setLocationId] = useState(data.locations[0]?.id ?? "");
  const [count, setCount] = useState("");
  const [countUnit, setCountUnit] = useState<"items" | "pages">("items");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function updateClient(nextClientId: string) {
    setClientId(nextClientId);
    setPeriodId(
      data.periods.find((period) => period.clientId === nextClientId)?.id ?? ""
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (categories.length === 0) {
      setError("Choose at least one general document category.");
      return;
    }
    setBusy(true);
    try {
      const result = await api.createPhysicalBatch({
        clientRequestId: crypto.randomUUID(),
        clientId,
        reportingPeriodId: periodId,
        receivedAt: new Date().toISOString(),
        channel,
        senderName,
        categories,
        approximateCount: count === "" ? null : Number(count),
        countUnit: count === "" ? null : countUnit,
        notes,
        locationId
      });
      onCreated(result.batch);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "The receiving record could not be saved."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="form-card" aria-labelledby="receiving-form-title">
      <div className="form-heading">
        <div>
          <p className="eyebrow">Physical receiving</p>
          <h2 id="receiving-form-title">Record one document batch</h2>
          <p className="muted">
            Describe the envelope, folder, or box as a group. Do not encode each receipt.
          </p>
        </div>
        <Button variant="ghost" size="icon" type="button" className="icon-button" onClick={onCancel} aria-label="Close form">
          ×
        </Button>
      </div>

      <form onSubmit={submit}>
        <div className="field-grid">
          <Label>
            Client
            <NativeSelect value={clientId} onChange={(e) => updateClient(e.target.value)} required>
              {data.clients.map((client) => (
                <option value={client.id} key={client.id}>
                  {client.name}
                </option>
              ))}
            </NativeSelect>
          </Label>
          <Label>
            Reporting period
            <NativeSelect value={periodId} onChange={(e) => setPeriodId(e.target.value)} required>
              {availablePeriods.map((period) => (
                <option value={period.id} key={period.id}>
                  {period.label}
                </option>
              ))}
            </NativeSelect>
          </Label>
          <Label>
            Handed over by
            <Input
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Name of client or representative"
              maxLength={120}
              required
            />
          </Label>
          <Label>
            Receiving channel
            <NativeSelect value={channel} onChange={(e) => setChannel(e.target.value)}>
              {data.physicalChannels.map((item) => (
                <option value={item} key={item}>
                  {channelLabels[item] ?? item}
                </option>
              ))}
            </NativeSelect>
          </Label>
        </div>

        <fieldset>
          <legend>General document categories</legend>
          <p className="field-help">Choose all that apply. Receipt values are not recorded here.</p>
          <div className="category-grid">
            {data.categories.map((category) => (
              <Label className="check-card" key={category}>
                <Checkbox
                  checked={categories.includes(category)}
                  onCheckedChange={(checked) =>
                    setCategories((current) =>
                      checked === true
                        ? [...current, category]
                        : current.filter((item) => item !== category)
                    )
                  }
                />
                <span>{category}</span>
              </Label>
            ))}
          </div>
        </fieldset>

        <div className="field-grid">
          <Label>
            Approximate count <span className="optional">(optional)</span>
            <Input
              type="number"
              min="0"
              max="100000"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="e.g. 45"
            />
          </Label>
          <Label>
            Count describes
            <NativeSelect value={countUnit} onChange={(e) => setCountUnit(e.target.value as "items" | "pages")}>
              <option value="items">Items</option>
              <option value="pages">Pages</option>
            </NativeSelect>
          </Label>
          <Label className="full-field">
            Current physical location
            <NativeSelect value={locationId} onChange={(e) => setLocationId(e.target.value)} required>
              {data.locations.map((location) => (
                <option value={location.id} key={location.id}>
                  {location.name}
                </option>
              ))}
            </NativeSelect>
          </Label>
          <Label className="full-field">
            Notes <span className="optional">(optional, no confidential values)</span>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="e.g. Brown envelope; several receipts are fading"
            />
          </Label>
        </div>

        {error && (
          <Alert className="alert error" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="form-actions">
          <Button variant="outline" size="lg" type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="lg" className="primary-button" disabled={busy || availablePeriods.length === 0}>
            {busy ? "Saving securely…" : "Receive batch"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function AcknowledgementView({
  acknowledgement,
  onClose
}: {
  acknowledgement: Acknowledgement;
  onClose: () => void;
}) {
  return (
    <section className="acknowledgement" aria-labelledby="ack-title">
      <div className="ack-toolbar no-print">
        <Button variant="outline" size="lg" className="secondary-button" onClick={onClose}>
          ← Back to batches
        </Button>
        <Button size="lg" className="primary-button" onClick={() => window.print()}>
          Print acknowledgement
        </Button>
      </div>
      <article className="paper">
        <header>
          <div className="brand-small">AP</div>
          <div>
            <p className="eyebrow">AyosPapel</p>
            <h2 id="ack-title">Document receiving acknowledgement</h2>
          </div>
        </header>
        <div className="reference-block">
          <span>Batch reference</span>
          <strong>{acknowledgement.referenceNumber}</strong>
          <em>{formatStatus(acknowledgement.status)}</em>
        </div>
        <dl className="ack-grid">
          <div><dt>Client</dt><dd>{acknowledgement.clientName}</dd></div>
          <div><dt>Reporting period</dt><dd>{acknowledgement.reportingPeriod}</dd></div>
          <div><dt>Received</dt><dd>{new Date(acknowledgement.receivedAt).toLocaleString()}</dd></div>
          <div><dt>Channel</dt><dd>{channelLabels[acknowledgement.channel]}</dd></div>
          <div><dt>Handed over by</dt><dd>{acknowledgement.senderName}</dd></div>
          <div><dt>Received by</dt><dd>{acknowledgement.receiverName}</dd></div>
          <div><dt>Current location</dt><dd>{acknowledgement.currentLocation}</dd></div>
          <div>
            <dt>Approximate count</dt>
            <dd>
              {acknowledgement.approximateCount === null
                ? "Not recorded"
                : `${acknowledgement.approximateCount} ${acknowledgement.countUnit}`}
            </dd>
          </div>
        </dl>
        <div className="ack-categories">
          <h3>Document groups received</h3>
          <ul>{acknowledgement.categories.map((item) => <li key={item}>✓ {item}</li>)}</ul>
        </div>
        <p className="notice">{acknowledgement.confidentialityNotice}</p>
        <footer>
          <span>Keep this reference for follow-up.</span>
          <span>Generated {new Date().toLocaleString()}</span>
        </footer>
      </article>
    </section>
  );
}

type WorkspaceView =
  | "overview"
  | "receive"
  | "upload"
  | "batches"
  | "clients"
  | "locations"
  | "guide";

function DigitalUploadForm({
  data,
  user,
  onCreated,
  onCancel
}: {
  data: ReferenceData;
  user: User;
  onCreated: (batch: Batch) => void;
  onCancel: () => void;
}) {
  const firstClient = data.clients[0]?.id ?? "";
  const [clientId, setClientId] = useState(firstClient);
  const periods = data.periods.filter((period) => period.clientId === clientId);
  const [periodId, setPeriodId] = useState(periods[0]?.id ?? "");
  const [senderName, setSenderName] = useState(user.displayName);
  const [categories, setCategories] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function changeClient(next: string) {
    setClientId(next);
    setPeriodId(data.periods.find((period) => period.clientId === next)?.id ?? "");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (categories.length === 0 || files.length === 0) {
      setError("Choose at least one category and one synthetic PDF or image.");
      return;
    }
    setBusy(true);
    setError("");
    const form = new FormData();
    form.append("clientRequestId", crypto.randomUUID());
    form.append("clientId", clientId);
    form.append("reportingPeriodId", periodId);
    form.append("receivedAt", new Date().toISOString());
    form.append("senderName", senderName);
    form.append("categories", JSON.stringify(categories));
    form.append("notes", notes);
    files.forEach((file) => form.append("files", file));
    try {
      const result = await api.createDigitalBatch(form);
      onCreated(result.batch);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="form-card" aria-labelledby="upload-title">
      <div className="form-heading">
        <div>
          <p className="eyebrow">Phone-friendly submission</p>
          <h2 id="upload-title">Upload a document batch</h2>
          <p className="muted">
            Mag-upload ng photos o PDF bilang isang batch—hindi kailangang i-encode ang bawat resibo.
          </p>
        </div>
        <Button variant="ghost" size="icon" className="icon-button" type="button" onClick={onCancel} aria-label="Close upload form">×</Button>
      </div>
      <Alert className="alert warning">
        <AlertTitle>Pilot safety</AlertTitle>
        <AlertDescription>
          Use dummy files only. Never upload a real client document here.
        </AlertDescription>
      </Alert>
      <form onSubmit={submit}>
        <div className="field-grid">
          <Label>
            Client
            <NativeSelect
              value={clientId}
              onChange={(event) => changeClient(event.target.value)}
              disabled={user.role === "client"}
              required
            >
              {data.clients.map((client) => <option value={client.id} key={client.id}>{client.name}</option>)}
            </NativeSelect>
          </Label>
          <Label>
            Reporting period
            <NativeSelect value={periodId} onChange={(event) => setPeriodId(event.target.value)} required>
              {periods.map((period) => <option value={period.id} key={period.id}>{period.label}</option>)}
            </NativeSelect>
          </Label>
          <Label className="full-field">
            Submitted by
            <Input value={senderName} onChange={(event) => setSenderName(event.target.value)} required maxLength={120} />
          </Label>
        </div>
        <fieldset>
          <legend>What kind of documents are these?</legend>
          <div className="category-grid">
            {data.categories.map((category) => (
              <Label className="check-card" key={category}>
                <Checkbox
                  checked={categories.includes(category)}
                  onCheckedChange={(checked) =>
                    setCategories((current) =>
                      checked === true
                        ? [...current, category]
                        : current.filter((item) => item !== category)
                    )
                  }
                />
                <span>{category}</span>
              </Label>
            ))}
          </div>
        </fieldset>
        <Label className="upload-dropzone">
          <span className="upload-icon" aria-hidden="true">⇧</span>
          <strong>{files.length ? `${files.length} file${files.length === 1 ? "" : "s"} selected` : "Choose dummy photos or PDFs"}</strong>
          <span>PDF, JPEG, or PNG · 15 MB each · up to 20 files</span>
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            required
          />
        </Label>
        {files.length > 0 && (
          <ul className="file-preview">
            {files.map((file) => <li key={`${file.name}-${file.size}`}><span>▤</span>{file.name}<small>{(file.size / 1024).toFixed(1)} KB</small></li>)}
          </ul>
        )}
        <Label>
          Short note <span className="optional">(optional)</span>
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} rows={3} />
        </Label>
        {error && (
          <Alert className="alert error" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="form-actions">
          <Button variant="outline" size="lg" className="secondary-button" type="button" onClick={onCancel}>Cancel</Button>
          <Button size="lg" className="primary-button" disabled={busy}>{busy ? "Uploading securely…" : "Submit document batch"}</Button>
        </div>
      </form>
    </Card>
  );
}

function BatchDetails({
  batch,
  onClose,
  onAcknowledgement
}: {
  batch: Batch;
  onClose: () => void;
  onAcknowledgement: () => void;
}) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(batch.attachmentCount > 0);

  useEffect(() => {
    if (batch.attachmentCount > 0) {
      api.attachments(batch.id)
        .then((result) => setAttachments(result.attachments))
        .finally(() => setLoading(false));
    }
  }, [batch]);

  const stages = batch.physical
    ? ["received", "awaiting_scan", "scanned", "under_review", "ready_for_processing", "processing", "ready_for_return", "released"]
    : ["received", "under_review", "ready_for_processing", "processing"];
  const currentIndex =
    batch.status === "incomplete"
      ? stages.indexOf("under_review")
      : stages.indexOf(batch.status);

  return (
    <div className="detail-panel-body" aria-labelledby="batch-detail-title">
      <div className="detail-header">
        <div><p className="reference">{batch.referenceNumber}</p><h2 id="batch-detail-title">{batch.clientName}</h2></div>
        <Button variant="ghost" size="icon" className="icon-button" onClick={onClose} aria-label="Close batch details">×</Button>
      </div>
      <Badge variant="outline" className="status-pill">{formatStatus(batch.status)}</Badge>
      <dl className="detail-grid">
        <div><dt>Period</dt><dd>{batch.reportingPeriodLabel}</dd></div>
        <div><dt>Received</dt><dd>{new Date(batch.receivedAt).toLocaleString()}</dd></div>
        <div><dt>Submitted by</dt><dd>{batch.senderName}</dd></div>
        <div><dt>Received by</dt><dd>{batch.receiverName}</dd></div>
        <div><dt>Channel</dt><dd>{channelLabels[batch.channel] ?? formatStatus(batch.channel)}</dd></div>
        <div><dt>Location</dt><dd>{batch.currentLocation ?? "Digital batch"}</dd></div>
      </dl>
      <section className="detail-section">
        <h3>Status journey</h3>
        <ol className="status-journey">
          {stages.map((stage, index) => (
            <li className={index <= currentIndex ? "complete" : ""} key={stage}>
              <span>{index < currentIndex ? "✓" : index + 1}</span>{formatStatus(stage)}
            </li>
          ))}
        </ol>
      </section>
      <section className="detail-section">
        <h3>Document groups</h3>
        <div className="tag-list">{batch.categories.map((item) => <span key={item}>{item}</span>)}</div>
      </section>
      <section className="detail-section">
        <h3>Files ({batch.attachmentCount})</h3>
        {loading ? <p className="muted">Loading files…</p> : attachments.length === 0 ? (
          <p className="muted">{batch.physical ? "No scans attached yet." : "This seeded demonstration record has metadata only."}</p>
        ) : (
          <ul className="attachment-list">
            {attachments.map((item) => (
              <li key={item.id}>
                <div><strong>{item.originalFilename}</strong><small>{(item.sizeBytes / 1024).toFixed(1)} KB</small></div>
                <a className="text-button" href={`/api/attachments/${item.id}/download`}>Download</a>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Button variant="outline" size="lg" className="secondary-button wide-button" onClick={onAcknowledgement}>View receiving acknowledgement</Button>
    </div>
  );
}

function Guide({ role, onNavigate }: { role: User["role"]; onNavigate: (view: WorkspaceView) => void }) {
  const staffSteps = [
    ["Receive", "When papers arrive, create one batch for the envelope, folder, or box.", "receive"],
    ["Label", "Write the generated AP reference on the physical container.", "batches"],
    ["Store", "Place it in the recorded location so anyone authorized can find it.", "locations"],
    ["Follow up", "Open Batch history to see what needs scanning, review, or return.", "batches"]
  ] as const;
  const clientSteps = [
    ["Choose period", "Select the month or quarter the documents belong to.", "upload"],
    ["Add files", "Photograph documents clearly or choose PDF files from your phone.", "upload"],
    ["Submit once", "Send them as one batch and save the generated reference.", "upload"],
    ["Track", "Open My batches to see whether the accounting team is reviewing them.", "batches"]
  ] as const;
  const steps = role === "client" ? clientSteps : staffSteps;

  return (
    <section>
      <div className="page-heading compact-heading">
        <div><p className="eyebrow">Beginner guide</p><h1>How to use AyosPapel</h1><p className="muted">A simple workflow you can follow every time.</p></div>
      </div>
      <div className="guide-hero">
        <div><span aria-hidden="true">?</span></div>
        <div>
          <h2>{role === "client" ? "For clients and representatives" : "For the accounting team"}</h2>
          <p>{role === "client" ? "Upload one group at a time. You do not need to type every receipt." : "Record the batch first, then keep its location and status updated until release."}</p>
        </div>
      </div>
      <ol className="guide-steps">
        {steps.map(([title, description, target], index) => (
          <li key={title}>
            <span>{index + 1}</span>
            <div><h3>{title}</h3><p>{description}</p><Button variant="link" className="text-button" onClick={() => onNavigate(target)}>Go to {title.toLowerCase()} →</Button></div>
          </li>
        ))}
      </ol>
      <section className="help-box">
        <h2>What the status words mean</h2>
        <div className="status-glossary">
          <p><strong>Awaiting scan</strong><span>Physical papers were received but still need digital copies.</span></p>
          <p><strong>Under review</strong><span>Staff is checking the batch against the required documents.</span></p>
          <p><strong>Incomplete</strong><span>Something is missing or unclear; the client needs to respond.</span></p>
          <p><strong>Ready for return</strong><span>Original papers can be returned to the authorized client contact.</span></p>
        </div>
      </section>
    </section>
  );
}

function Workspace({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [view, setView] = useState<WorkspaceView>("overview");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [acknowledgement, setAcknowledgement] = useState<Acknowledgement | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.referenceData(), api.batches()])
      .then(([references, batchResult]) => {
        setReferenceData(references);
        setBatches(batchResult.batches);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Loading failed."))
      .finally(() => setLoading(false));
  }, []);

  async function openAcknowledgement(id: string) {
    setError("");
    try {
      const result = await api.acknowledgement(id);
      setAcknowledgement(result.acknowledgement);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Acknowledgement unavailable.");
    }
  }

  function recordCreated(batch: Batch, message: string) {
    setBatches((current) => [batch, ...current]);
    setSuccess(message);
    setView("batches");
    setSelectedBatch(batch);
  }

  if (acknowledgement) {
    return <AcknowledgementView acknowledgement={acknowledgement} onClose={() => setAcknowledgement(null)} />;
  }

  const canReceive = user.role !== "client";
  const navItems: Array<[WorkspaceView, string, string]> = [
    ["overview", "⌂", "Overview"],
    ...(canReceive ? [["receive", "＋", "Receive papers"] as [WorkspaceView, string, string]] : []),
    ["upload", "⇧", user.role === "client" ? "Upload documents" : "Digital upload"],
    ["batches", "▤", user.role === "client" ? "My batches" : "Batch history"],
    ...(user.role === "owner" ? [["clients", "◎", "Clients"] as [WorkspaceView, string, string]] : []),
    ...(canReceive ? [["locations", "⌖", "Storage locations"] as [WorkspaceView, string, string]] : []),
    ["guide", "?", "How to use"]
  ];
  const filtered = batches.filter((batch) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      batch.referenceNumber.toLowerCase().includes(query) ||
      batch.clientName.toLowerCase().includes(query) ||
      batch.categories.some((item) => item.toLowerCase().includes(query));
    const matchesStatus =
      statusFilter === "all" ||
      batch.status === statusFilter ||
      (statusFilter === "physical_held" &&
        batch.physical &&
        !["released", "archived"].includes(batch.status)) ||
      (statusFilter === "attention_group" &&
        ["awaiting_scan", "incomplete"].includes(batch.status)) ||
      (statusFilter === "processing_group" &&
        ["under_review", "ready_for_processing", "processing"].includes(batch.status));
    return matchesSearch && matchesStatus;
  });
  const counts = {
    total: batches.length,
    newlyReceived: batches.filter((batch) => batch.status === "received").length,
    awaitingScan: batches.filter((batch) => batch.status === "awaiting_scan").length,
    missing: batches.filter((batch) => batch.status === "incomplete").length,
    physicalHeld: batches.filter(
      (batch) => batch.physical && !["released", "archived"].includes(batch.status)
    ).length,
    return: batches.filter((batch) => batch.status === "ready_for_return").length
  };

  return (
    <div className="portal-shell">
      <aside className="sidebar">
        <a className="brand sidebar-brand" href="/" aria-label="AyosPapel overview">
          <span className="brand-small">AP</span>
          <span><strong>AyosPapel</strong><small>Document tracker</small></span>
        </a>
        <nav aria-label="Main navigation">
          {navItems.map(([target, icon, label]) => (
            <Button variant="ghost" className={view === target ? "active" : ""} onClick={() => { setView(target); setSelectedBatch(null); setSuccess(""); }} key={target}>
              <span aria-hidden="true">{icon}</span>{label}
            </Button>
          ))}
        </nav>
        <div className="sidebar-help">
          <strong>Need help?</strong>
          <p>Open the beginner guide for step-by-step instructions.</p>
          <Button variant="link" onClick={() => setView("guide")}>View guide</Button>
        </div>
      </aside>

      <div className="portal-main">
        <header className="portal-topbar">
          <NativeSelect className="mobile-nav" value={view} onChange={(event) => setView(event.target.value as WorkspaceView)} aria-label="Choose page">
            {navItems.map(([target, , label]) => <option value={target} key={target}>{label}</option>)}
          </NativeSelect>
          <div className="pilot-chip"><span /> Dummy data mode</div>
          <div className="profile">
            <span><strong>{user.displayName}</strong><small>{formatStatus(user.role)}</small></span>
            <Button variant="ghost" className="text-button" onClick={onLogout}>Sign out</Button>
          </div>
        </header>

        <main className="portal-content">
          {error && (
            <Alert className="alert error" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="alert success">
              <AlertTitle>Saved successfully</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {user.role === "staff" && referenceData?.clients.length === 0 && (
            <Alert className="alert warning">
              <AlertTitle>No assigned clients</AlertTitle>
              <AlertDescription>
                Sign in as Owner to see everything or Assigned staff to test receiving.
              </AlertDescription>
            </Alert>
          )}

          {view === "overview" && (
            <>
              <section className="page-heading compact-heading">
                <div>
                  <p className="eyebrow">{user.role === "client" ? "Client workspace" : "Daily overview"}</p>
                  <h1>Good day, {user.displayName.split(" ")[0]}</h1>
                  <p className="muted">{user.role === "client" ? "Upload documents and follow each batch using one reference number." : "Here is what needs attention across your visible clients."}</p>
                </div>
                <Button size="lg" className="primary-button" onClick={() => setView(user.role === "client" ? "upload" : "receive")}>
                  {user.role === "client" ? "⇧ Upload document batch" : "＋ Receive physical batch"}
                </Button>
              </section>
              <Card className="start-card">
                <div className="start-badge">START HERE</div>
                <div>
                  <h2>New to AyosPapel?</h2>
                  <p>Follow the guided workflow first. It explains which button to use and what happens after submission.</p>
                </div>
                <Button variant="outline" size="lg" className="secondary-button" onClick={() => setView("guide")}>Show me how</Button>
              </Card>
              <section className="summary-grid" aria-label="Work queue summary">
                {[
                  ["received", "＋", counts.newlyReceived, "Newly received"],
                  ["awaiting_scan", "◷", counts.awaitingScan, "Awaiting scan"],
                  ["incomplete", "!", counts.missing, "Missing or unclear"],
                  ["physical_held", "⌖", counts.physicalHeld, "Physical batches held"],
                  ["ready_for_return", "✓", counts.return, "Ready for return"]
                ].map(([filter, icon, count, label]) => (
                  <Card className="summary-card" key={String(filter)}>
                    <Button
                      variant="ghost"
                      className="summary-card-action"
                      onClick={() => {
                        setStatusFilter(String(filter));
                        setView("batches");
                      }}
                    >
                      <span aria-hidden="true">{icon}</span>
                      <strong>{count}</strong>
                      <small>{label}</small>
                    </Button>
                  </Card>
                ))}
              </section>
              <section>
                <div className="section-heading"><div><h2>Recent activity</h2><p>Open a batch to see its full journey.</p></div><Button variant="link" className="text-button" onClick={() => setView("batches")}>View all →</Button></div>
                <Card className="batch-list compact-list">
                  {loading ? <div className="empty-state">Loading secure records…</div> : batches.slice(0, 4).map((batch) => (
                    <Button variant="ghost" className="activity-row" onClick={() => { setSelectedBatch(batch); setView("batches"); }} key={batch.id}>
                      <span className="activity-icon">{batch.physical ? "▣" : "⇧"}</span>
                      <span>
                        <strong>{batch.referenceNumber} · {batch.clientName}</strong>
                        <small>{batch.categories.join(", ")}</small>
                        <small>
                          {batch.physical
                            ? `Current location: ${batch.currentLocation ?? "Not recorded"}`
                            : `${batch.attachmentCount} digital attachment${batch.attachmentCount === 1 ? "" : "s"}`}
                        </small>
                      </span>
                      <Badge variant="outline" className="status-pill">{formatStatus(batch.status)}</Badge>
                    </Button>
                  ))}
                </Card>
              </section>
            </>
          )}

          {view === "receive" && referenceData && (
            <BatchForm data={referenceData} onCancel={() => setView("overview")} onCreated={(batch) => recordCreated(batch, `Physical batch ${batch.referenceNumber} was received and logged.`)} />
          )}
          {view === "upload" && referenceData && (
            <DigitalUploadForm data={referenceData} user={user} onCancel={() => setView("overview")} onCreated={(batch) => recordCreated(batch, `Digital batch ${batch.referenceNumber} was uploaded.`)} />
          )}
          {view === "batches" && (
            <section>
              <div className="page-heading compact-heading">
                <div><p className="eyebrow">Searchable history</p><h1>{user.role === "client" ? "My document batches" : "Document batch history"}</h1><p className="muted">Search by reference, client, or document category.</p></div>
              </div>
              <div className="filter-bar">
                <Label><span className="sr-only">Search batches</span><Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search AP-202607-0001, client, or category…" /></Label>
                <Label><span className="sr-only">Filter by status</span><NativeSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="attention_group">Needs attention</option><option value="processing_group">Review and processing</option><option value="physical_held">Physical batches held</option>{Array.from(new Set(batches.map((batch) => batch.status))).map((status) => <option value={status} key={status}>{formatStatus(status)}</option>)}</NativeSelect></Label>
              </div>
              <div className="batch-list">
                {filtered.length === 0 ? <div className="empty-state"><h3>No matching batches</h3><p>Clear the search or choose another status.</p></div> : filtered.map((batch) => (
                  <Card className="batch-card clickable-card" key={batch.id} onClick={() => setSelectedBatch(batch)}>
                    <div className="batch-main"><div><p className="reference">{batch.referenceNumber}</p><h3>{batch.clientName}</h3><p>{batch.reportingPeriodLabel} · {batch.categories.join(", ")}</p></div><Badge variant="outline" className="status-pill">{formatStatus(batch.status)}</Badge></div>
                    <div className="batch-meta"><span><small>Received</small>{new Date(batch.receivedAt).toLocaleDateString()}</span><span><small>From</small>{batch.senderName}</span><span><small>{batch.physical ? "Current location" : "Digital files"}</small>{batch.physical ? batch.currentLocation : `${batch.attachmentCount} attachment${batch.attachmentCount === 1 ? "" : "s"}`}</span><Button variant="outline" className="secondary-button" onClick={(event) => { event.stopPropagation(); setSelectedBatch(batch); }}>Open details</Button></div>
                  </Card>
                ))}
              </div>
            </section>
          )}
          {view === "clients" && referenceData && (
            <section>
              <div className="page-heading compact-heading"><div><p className="eyebrow">Owner view</p><h1>Accounting clients</h1><p className="muted">Synthetic client workspaces available in this pilot.</p></div></div>
              <div className="info-table">{referenceData.clients.map((client) => <article key={client.id}><span className="client-avatar">{client.code.slice(0, 2)}</span><div><h3>{client.name}</h3><p>{client.code} · {client.reportingFrequency} reporting</p></div><strong>{batches.filter((batch) => batch.clientId === client.id).length} batches</strong></article>)}</div>
            </section>
          )}
          {view === "locations" && referenceData && (
            <section>
              <div className="page-heading compact-heading"><div><p className="eyebrow">Physical custody</p><h1>Storage locations</h1><p className="muted">Where active physical batches can be found right now.</p></div></div>
              <div className="info-table">{referenceData.locations.map((location) => <article key={location.id}><span className="client-avatar">⌖</span><div><h3>{location.name}</h3><p>{formatStatus(location.locationType)}</p></div><strong>{batches.filter((batch) => batch.currentLocation === location.name).length} held here</strong></article>)}</div>
            </section>
          )}
          {view === "guide" && <Guide role={user.role} onNavigate={setView} />}
        </main>
      </div>
      <Sheet
        open={selectedBatch !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedBatch(null);
        }}
      >
        <SheetContent className="detail-panel" showCloseButton={false}>
          {selectedBatch && (
            <>
              <SheetHeader className="sr-only">
                <SheetTitle>{selectedBatch.referenceNumber}</SheetTitle>
                <SheetDescription>
                  Document batch details, status journey, and attachments
                </SheetDescription>
              </SheetHeader>
              <BatchDetails
                batch={selectedBatch}
                onClose={() => setSelectedBatch(null)}
                onAcknowledgement={() => void openAcknowledgement(selectedBatch.id)}
              />
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me().then((result) => setUser(result.user)).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="splash" role="status">Opening AyosPapel…</main>;
  if (!user) return <Login onLogin={setUser} />;
  return (
    <Workspace
      user={user}
      onLogout={() => {
        void api.logout().finally(() => setUser(null));
      }}
    />
  );
}

