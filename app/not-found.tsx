import Navigation from "./components/Navigation";

export default function NotFound() { 
  return (
    <div>
      <div>
        <Navigation />
        <h1>404</h1>
          <label
            htmlFor="email"
            style={{
              display: "block",
              marginTop: "6px",
              marginBottom: "8px",
              fontSize: "14px",
            }}
          >
            This page can't be found.
          </label>
      </div>
    </div>
  );
}
