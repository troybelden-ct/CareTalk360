import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClientDetail {
  clientId: number;
  name: string;
  password: string;
  contact: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  email: string;
}

interface BucketRow {
  id: number;
  bucketName: string;
  accessKey: string;
  secretKey: string;
  supDomain: string;
  bucketType: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const US_STATE_ABBRS = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

const BUCKET_TYPES = ["Eligibles", "CCDA_Files", "Clinical_Docs", "Reports"];

const clientDetails: Record<number, ClientDetail> = {
  1:  { clientId: 1,  name: "Humana Gold Plus",   password: "••••••••••", contact: "Sarah Mitchell",  phone: "5552013344", address: "1200 Humana Way",       city: "Louisville",   state: "KY", zipCode: "40202", email: "s.mitchell@humanagold.com" },
  2:  { clientId: 2,  name: "Aetna Medicare",      password: "••••••••••", contact: "James Rodriguez", phone: "5553127788", address: "980 Corporate Blvd",    city: "Hartford",     state: "CT", zipCode: "06103", email: "j.rodriguez@aetnamedicare.com" },
  3:  { clientId: 3,  name: "UHC Community Plan",   password: "••••••••••", contact: "Lisa Chang",      phone: "5554452211", address: "3100 Optum Circle",     city: "Minneapolis",  state: "MN", zipCode: "55403", email: "l.chang@uhcommunity.com" },
  4:  { clientId: 4,  name: "Cigna HealthSpring",   password: "••••••••••", contact: "Michael Torres",  phone: "5556789012", address: "450 Spring Health Dr",  city: "Nashville",    state: "TN", zipCode: "37203", email: "m.torres@cignahs.com" },
  5:  { clientId: 5,  name: "Molina Healthcare",    password: "••••••••••", contact: "Jennifer Adams",  phone: "5551234567", address: "200 Oceangate Blvd",    city: "Long Beach",   state: "CA", zipCode: "90802", email: "j.adams@molinahc.com" },
  6:  { clientId: 6,  name: "WellCare Health",      password: "••••••••••", contact: "David Kim",       phone: "5558901234", address: "8725 Henderson Rd",     city: "Tampa",        state: "FL", zipCode: "33634", email: "d.kim@wellcarehealth.com" },
  7:  { clientId: 7,  name: "Centene Corp",         password: "••••••••••", contact: "Amanda White",    phone: "5552345678", address: "7700 Forsyth Blvd",     city: "St. Louis",    state: "MO", zipCode: "63105", email: "a.white@centene.com" },
  8:  { clientId: 8,  name: "Anthem BCBS",          password: "••••••••••", contact: "Robert Chen",     phone: "5555678901", address: "220 Virginia Ave",      city: "Indianapolis", state: "IN", zipCode: "46204", email: "r.chen@anthembcbs.com" },
  9:  { clientId: 9,  name: "Oscar Health",         password: "••••••••••", contact: "Nicole Brown",    phone: "5553456789", address: "75 Varick St",          city: "New York",     state: "NY", zipCode: "10013", email: "n.brown@oscarhealth.com" },
  10: { clientId: 10, name: "Devoted Health",       password: "••••••••••", contact: "Kevin Martinez",  phone: "5554567890", address: "221 River St",          city: "Waltham",      state: "MA", zipCode: "02453", email: "k.martinez@devotedhealth.com" },
  11: { clientId: 11, name: "Clover Health",        password: "••••••••••", contact: "Emily Watson",    phone: "5557890123", address: "3401 Jersey Ave",       city: "Jersey City",  state: "NJ", zipCode: "07302", email: "e.watson@cloverhealth.com" },
  12: { clientId: 12, name: "Bright Health",        password: "••••••••••", contact: "Daniel Lee",      phone: "5559012345", address: "8000 Norman Center Dr", city: "Minneapolis",  state: "MN", zipCode: "55437", email: "d.lee@brighthealth.com" },
};

const clientBuckets: Record<number, BucketRow[]> = {
  1:  [
    { id: 1, bucketName: "humanagoldbucket",  accessKey: "AKIAQTQVME7PMBTWC", secretKey: "MGpXDnL4opMqTfm2PS", supDomain: "HumanaGold", bucketType: "Eligibles" },
    { id: 2, bucketName: "humanagoldbucket",  accessKey: "AKIAQTQVME7PMBTWC", secretKey: "MGpXDnL4opMqTfm2PS", supDomain: "HumanaGold", bucketType: "CCDA_Files" },
  ],
  2:  [{ id: 1, bucketName: "aetnamedicarebucket", accessKey: "AKIAQTQVME7PMBTWC", secretKey: "MGpXDnL4opMqTfm2PS", supDomain: "Aetna", bucketType: "Eligibles" }],
  3:  [{ id: 1, bucketName: "uhccommunitybucket",  accessKey: "AKIAQTQVME7PMBTWC", secretKey: "MGpXDnL4opMqTfm2PS", supDomain: "UHC",   bucketType: "Eligibles" }],
  4:  [{ id: 1, bucketName: "cignahsbucket",       accessKey: "AKIAQTQVME7PMBTWC", secretKey: "MGpXDnL4opMqTfm2PS", supDomain: "Cigna",  bucketType: "Eligibles" }],
  5:  [{ id: 1, bucketName: "molinabucket",        accessKey: "AKIAQTQVME7PMBTWC", secretKey: "MGpXDnL4opMqTfm2PS", supDomain: "Molina", bucketType: "Eligibles" }],
  6:  [],
  7:  [{ id: 1, bucketName: "centenebucket",       accessKey: "AKIAQTQVME7PMBTWC", secretKey: "MGpXDnL4opMqTfm2PS", supDomain: "Centene", bucketType: "Eligibles" }],
  8:  [
    { id: 1, bucketName: "anthembucket",  accessKey: "AKIAQTQVME7PMBTWC", secretKey: "MGpXDnL4opMqTfm2PS", supDomain: "Anthem", bucketType: "Eligibles" },
    { id: 2, bucketName: "anthembucket",  accessKey: "AKIAQTQVME7PMBTWC", secretKey: "MGpXDnL4opMqTfm2PS", supDomain: "Anthem", bucketType: "CCDA_Files" },
  ],
  9:  [],
  10: [],
  11: [{ id: 1, bucketName: "cloverbucket", accessKey: "AKIAQTQVME7PMBTWC", secretKey: "MGpXDnL4opMqTfm2PS", supDomain: "Clover", bucketType: "Eligibles" }],
  12: [{ id: 1, bucketName: "brightbucket", accessKey: "AKIAQTQVME7PMBTWC", secretKey: "MGpXDnL4opMqTfm2PS", supDomain: "Bright", bucketType: "Eligibles" }],
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const labelStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 500,
  color: "#333",
  whiteSpace: "nowrap",
  minWidth: "120px",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "6px 10px",
  fontSize: "14px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  outline: "none",
  background: "#fff",
};

const selectStyle: React.CSSProperties = {
  padding: "6px 8px",
  fontSize: "14px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  outline: "none",
  background: "#fff",
  minWidth: "60px",
};

const bucketInputStyle: React.CSSProperties = {
  padding: "6px 10px",
  fontSize: "13px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  outline: "none",
  background: "#fff",
  width: "100%",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const clientId = Number(id);
  const clientData = clientDetails[clientId];

  const [form, setForm] = useState<ClientDetail | null>(clientData ? { ...clientData } : null);
  const [showPassword, setShowPassword] = useState(false);
  const [buckets, setBuckets] = useState<BucketRow[]>(
    clientBuckets[clientId] ? [...clientBuckets[clientId].map((b) => ({ ...b }))] : [],
  );

  if (!form) {
    return (
      <MainLayout
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Client List", href: "/client-list" },
          { label: "Edit Client" },
        ]}
      >
        <div style={{ padding: "48px", textAlign: "center", color: "#888" }}>
          Client not found.
        </div>
      </MainLayout>
    );
  }

  const updateField = (field: keyof ClientDetail, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleUpdate = () => {
    toast({ title: "Client updated successfully" });
  };

  const handleClearPassword = () => {
    if (window.confirm("Are you sure you want to clear the password (set to null)?")) {
      setForm((prev) => (prev ? { ...prev, password: "" } : prev));
      toast({ title: "Password cleared" });
    }
  };

  const handleAddBucket = () => {
    const newId = buckets.length > 0 ? Math.max(...buckets.map((b) => b.id)) + 1 : 1;
    setBuckets((prev) => [
      ...prev,
      { id: newId, bucketName: "", accessKey: "", secretKey: "", supDomain: "", bucketType: "Eligibles" },
    ]);
  };

  const handleDeleteBucket = (bucketId: number) => {
    if (window.confirm("Are you sure you want to delete this bucket?")) {
      setBuckets((prev) => prev.filter((b) => b.id !== bucketId));
      toast({ title: "Bucket deleted" });
    }
  };

  const updateBucket = (bucketId: number, field: keyof BucketRow, value: string) => {
    setBuckets((prev) =>
      prev.map((b) => (b.id === bucketId ? { ...b, [field]: value } : b)),
    );
  };

  return (
    <MainLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Client List", href: "/client-list" },
        { label: "Edit Client" },
      ]}
    >
      <div style={{ marginBottom: "24px" }}>
        {/* Page heading */}
        <h3
          style={{
            fontSize: "25px",
            fontWeight: 500,
            textDecoration: "underline",
            textUnderlineOffset: "4px",
            marginBottom: "20px",
          }}
        >
          Update Client
        </h3>

        {/* ----------------------------------------------------------------
            Client Details Form
        ---------------------------------------------------------------- */}
        <div style={{ maxWidth: "900px" }}>
          {/* Row 1: Client Name | Password */}
          <div style={{ display: "flex", gap: "24px", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
              <label style={labelStyle}>Client Name:</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
              <label style={labelStyle}>Password</label>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  style={{ ...inputStyle, width: "100%", paddingRight: "36px" }}
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px",
                    lineHeight: 0,
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={16} color="#666" />
                  ) : (
                    <Eye size={16} color="#666" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Client Contact | Phone */}
          <div style={{ display: "flex", gap: "24px", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
              <label style={labelStyle}>Client Contact:</label>
              <input
                style={inputStyle}
                value={form.contact}
                onChange={(e) => updateField("contact", e.target.value)}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
              <label style={labelStyle}>Phone:</label>
              <input
                style={inputStyle}
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
          </div>

          {/* Row 3: Address (full width) */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <label style={labelStyle}>Address:</label>
            <input
              style={inputStyle}
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>

          {/* Row 4: City | State | Zip code */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
              <label style={labelStyle}>City:</label>
              <input
                style={inputStyle}
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ ...labelStyle, minWidth: "auto" }}>State:</label>
              <select
                style={selectStyle}
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
              >
                {US_STATE_ABBRS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ ...labelStyle, minWidth: "auto" }}>Zip code:</label>
              <input
                style={{ ...inputStyle, maxWidth: "100px" }}
                value={form.zipCode}
                onChange={(e) => updateField("zipCode", e.target.value)}
              />
            </div>
          </div>

          {/* Row 5: Email */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <label style={labelStyle}>Email:</label>
            <input
              style={inputStyle}
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
            <button
              type="button"
              onClick={handleClearPassword}
              style={{
                background: "#c0392b",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 24px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#e74c3c")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#c0392b")}
              aria-label="Clear password"
            >
              Clear Password (Set to Null)
            </button>

            <button
              type="button"
              onClick={handleUpdate}
              style={{
                background: "#1a3a5c",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 32px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#244a9f")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1a3a5c")}
              aria-label="Update client"
            >
              Update
            </button>
          </div>
        </div>

        {/* Divider */}
        <hr style={{ border: "none", borderTop: "1px solid #e0e0e0", margin: "24px 0" }} />

        {/* ----------------------------------------------------------------
            CareTalkHealth Buckets
        ---------------------------------------------------------------- */}
        <h3
          style={{
            fontSize: "22px",
            fontWeight: 500,
            marginBottom: "20px",
          }}
        >
          CareTalkHealth Buckets
        </h3>

        {buckets.map((bucket) => (
          <div key={bucket.id} style={{ marginBottom: "28px" }}>
            {/* Bucket fields row */}
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", marginBottom: "8px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "4px" }}>
                  Bucket Name
                </label>
                <input
                  style={bucketInputStyle}
                  value={bucket.bucketName}
                  onChange={(e) => updateBucket(bucket.id, "bucketName", e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "4px" }}>
                  Access Key
                </label>
                <input
                  style={bucketInputStyle}
                  value={bucket.accessKey}
                  onChange={(e) => updateBucket(bucket.id, "accessKey", e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "4px" }}>
                  Secret Key
                </label>
                <input
                  style={bucketInputStyle}
                  value={bucket.secretKey}
                  onChange={(e) => updateBucket(bucket.id, "secretKey", e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "4px" }}>
                  SUP Domain
                </label>
                <input
                  style={bucketInputStyle}
                  value={bucket.supDomain}
                  onChange={(e) => updateBucket(bucket.id, "supDomain", e.target.value)}
                />
              </div>
              <div style={{ minWidth: "130px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "4px" }}>
                  Bucket Type
                </label>
                <select
                  style={{ ...bucketInputStyle, cursor: "pointer" }}
                  value={bucket.bucketType}
                  onChange={(e) => updateBucket(bucket.id, "bucketType", e.target.value)}
                >
                  {BUCKET_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div>
              <span style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "4px" }}>
                Actions
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => toast({ title: "Bucket saved" })}
                  style={{
                    background: "#244a9f",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    lineHeight: 0,
                  }}
                  aria-label="Edit bucket"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteBucket(bucket.id)}
                  style={{
                    background: "#c0392b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    lineHeight: 0,
                  }}
                  aria-label="Delete bucket"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add Bucket button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
          <button
            type="button"
            onClick={handleAddBucket}
            style={{
              background: "#1a3a5c",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 24px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#244a9f")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1a3a5c")}
            aria-label="Add bucket"
          >
            Add Bucket
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default EditClient;
