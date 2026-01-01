import Navigation from "../../components/Navigation";

export default async function ProjectsPage({ 
    params
}: {
    params: Promise<{ projectId: string}>
}) {
  const projectId = (await params).projectId;
  return (
    <div>
      <div>
        <Navigation />
        <p>id: {projectId}</p>
      </div>
    </div>
  );
}
