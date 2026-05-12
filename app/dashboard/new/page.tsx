import Link from "next/link";
import ProjectForm from "../components/ProjectForm";

export default function NewProjectPage() {
  return (
    <>
      <div className="dash-header">
        <div>
          <Link href="/dashboard" style={{ fontSize: "13px", color: "var(--text-subtle)", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "10px" }}>
            ← Back
          </Link>
          <h1 className="dash-title">New Project</h1>
          <p className="dash-subtitle">Fill in the details and hit publish.</p>
        </div>
      </div>
      <ProjectForm />
    </>
  );
}
