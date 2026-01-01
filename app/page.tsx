import Navigation from "./components/Navigation";

export default function Home() {
  return (
    <div>
      <div>
        <Navigation />

        {/* Your main content below the buttons */}
        <div>
          <p>Welcome to Dark Mode!</p>
          {/* Add whatever you want on the home page here */}
        </div>
      </div>
    </div>
  );
}