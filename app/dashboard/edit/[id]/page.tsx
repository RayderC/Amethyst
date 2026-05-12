import { notFound } from "next/navigation";
import Link from "next/link";
import db from "@/lib/db";
import ProjectForm from "../../components/ProjectForm";
import type { Project } from "../../../components/ProjectCard";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = db
    .prepare("SELECT * FROM projects WHERE id = ?")
    .get(id) as Project | undefined;

  if (!project) notFound();

  return (
    <>
      <div className="dash-header">
        <div>
          <Link href="/dashboard" style={{ fontSize: "13px", color: "var(--text-subtle)", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "10px" }}>
            ← Back
          </Link>
          <h1 className="dash-title">Edit Project</h1>
          <p className="dash-subtitle">{project.title}</p>
        </div>
      </div>
      <ProjectForm initial={project} projectId={project.id} />
    </>
  );
}
