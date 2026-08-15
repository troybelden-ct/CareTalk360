import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { loadHedisSettings, saveHedisSettings, type HedisMeasureConfig } from "@/lib/hedis-config";

const HedisMeasuresSettings = () => {
  const [measures, setMeasures] = useState<HedisMeasureConfig[]>(loadHedisSettings);
  const [search, setSearch] = useState("");

  const update = (next: HedisMeasureConfig[]) => {
    setMeasures(next);
    saveHedisSettings(next);
  };

  const toggle = (code: string) => {
    update(measures.map((m) => (m.code === code ? { ...m, enabled: !m.enabled } : m)));
  };

  const toggleSelfReport = (code: string) => {
    update(measures.map((m) => (m.code === code ? { ...m, selfReport: !m.selfReport } : m)));
  };

  const enabledCount = measures.filter((m) => m.enabled).length;

  // Group by category
  const categories = [...new Set(measures.map((m) => m.category))];
  const q = search.trim().toLowerCase();
  const filtered = measures.filter(
    (m) =>
      !q ||
      m.measure.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
  );
  const filteredCategories = categories.filter((cat) =>
    filtered.some((m) => m.category === cat)
  );

  return (
    <MainLayout>
      <div style={{ padding: "20px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#1a3a5c",
            textDecoration: "underline",
            textUnderlineOffset: "4px",
            marginBottom: "16px",
          }}
        >
          HEDIS Measures
        </h1>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "10px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 14, color: "#374151" }}>
              <span style={{ fontWeight: 700 }}>{enabledCount}</span> of{" "}
              {measures.length} measures enabled for patient review
            </div>
            <input
              type="text"
              placeholder="Search measures..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: 6,
                padding: "7px 12px",
                fontSize: 13,
                width: 260,
                outline: "none",
              }}
            />
          </div>

          {filteredCategories.map((cat) => (
            <div key={cat} style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1e3a5f",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: 4,
                  marginBottom: 8,
                }}
              >
                {cat}
              </div>
              {filtered
                .filter((m) => m.category === cat)
                .map((m) => (
                  <label
                    key={m.code}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "6px 0",
                      cursor: "pointer",
                      fontSize: 13,
                      color: "#374151",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={m.enabled}
                      onChange={() => toggle(m.code)}
                      style={{ width: 16, height: 16, cursor: "pointer" }}
                    />
                    <span style={{ fontWeight: 500, minWidth: 40 }}>{m.code}</span>
                    <span>—</span>
                    <span style={{ flex: 1 }}>{m.measure}</span>
                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        color: m.selfReport ? "#137D41" : "#9ca3af",
                        cursor: "pointer",
                        marginLeft: 8,
                        whiteSpace: "nowrap",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={m.selfReport}
                        onChange={() => toggleSelfReport(m.code)}
                        style={{ width: 14, height: 14, cursor: "pointer" }}
                      />
                      Self-Report
                    </label>
                  </label>
                ))}
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default HedisMeasuresSettings;
