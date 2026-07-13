import MainLayout from "@/components/layout/MainLayout";

interface PlaceholderProps {
  title: string;
}

const Placeholder = ({ title }: PlaceholderProps) => (
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
        {title}
      </h1>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "10px",
          padding: "40px",
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <p style={{ fontSize: "16px", color: "#666" }}>
          This page is under development.
        </p>
      </div>
    </div>
  </MainLayout>
);

export default Placeholder;
