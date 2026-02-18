import "./App.css";
import appLogo from "./assets/app_logo.png";
import companyLogo from "./assets/company_logo.png";
import screen1 from "./assets/screen1.png";
import screen2 from "./assets/screen2.png";
import screen3 from "./assets/screen3.png";
import screen4 from "./assets/screen4.png";

function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <div className="container">
          <div className="logo-container">
            <img src={companyLogo} alt="Dev City Studio" className="company-logo" />
            <span className="company-name">Dev City Studio</span>
          </div>
          <ul className="nav-links">
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
          </ul>
        </div>
      </nav>

      <header className="hero">
        <div className="container">
          <img src={appLogo} alt="Stellar Forge" className="app-logo" />
          <h1>Stellar Forge</h1>
          <p>The ultimate space adventure game.</p>
          <p className="coming-soon">Coming Soon!</p>
        </div>
      </header>

      <section id="features" className="features">
        <div className="container">
          <h2>Features</h2>
          <div className="feature-list">
            <div className="feature-item">
              <h3>Resource Management</h3>
              <p>Gather and manage resources like Energy, Matter, and Data to build your empire.</p>
            </div>
            <div className="feature-item">
              <h3>Upgrades</h3>
              <p>Upgrade your systems with a variety of technologies like Kinetic Capacitors and Solar Arrays.</p>
            </div>
            <div className="feature-item">
              <h3>Tech Tree</h3>
              <p>Unlock new technologies and abilities through an extensive research system.</p>
            </div>
            <div className="feature-item">
              <h3>Explore the Galaxy</h3>
              <p>Travel to different locations like the Stellar Forge, Quantum Realm, and Chronos Expanse.</p>
            </div>
            <div className="feature-item">
              <h3>Customization</h3>
              <p>Customize your experience with different system parameters and visual themes.</p>
            </div>
            <div className="feature-item">
              <h3>Leaderboards</h3>
              <p>Compete with other players and climb the ranks on the global leaderboard.</p>
            </div>
          </div>
          <div className="screenshots">
            <img src={screen1} alt="Screenshot 1" />
            <img src={screen2} alt="Screenshot 2" />
            <img src={screen3} alt="Screenshot 3" />
            <img src={screen4} alt="Screenshot 4" />
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <div className="container">
          <h2>About</h2>
          <p>
            Stellar Forge is an immersive space exploration and adventure game
            developed by Dev City Studio. Embark on a journey through the
            galaxy, build your empire, and conquer the stars.
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Dev City Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
