import { useState, useEffect } from "react";
import "./App.css";
import appLogo from "./assets/app_logo.png";
import companyLogo from "./assets/company_logo.png";
import screen1 from "./assets/screen1.png";
import screen2 from "./assets/screen2.png";
import screen3 from "./assets/screen3.png";
import screen4 from "./assets/screen4.png";
import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  deleteDoc,
  where,
  getDocs
} from "firebase/firestore";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // URL-based Admin toggle
  const [showAdmin, setShowAdmin] = useState(window.location.hash === "#admin");
  const [adminCode, setAdminCode] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [waitlist, setWaitlist] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Local user status
  const [localUserStatus, setLocalUserStatus] = useState(null); // 'pending', 'ready', null

  const ADMIN_CODE = "3540";

  // Listen for hash changes to toggle admin view
  useEffect(() => {
    const handleHashChange = () => {
      setShowAdmin(window.location.hash === "#admin");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Check local storage for existing submission and sync with Firebase
  useEffect(() => {
    const savedEmail = localStorage.getItem("waitlistEmail");
    if (savedEmail) {
      const q = query(collection(db, "waitlist"), where("email", "==", savedEmail));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setLocalUserStatus(userData.status || 'pending');
          setSubmitted(true);
        } else {
          // If not found in DB but in local storage, user was probably removed
          localStorage.removeItem("waitlistEmail");
          setLocalUserStatus(null);
          setSubmitted(false);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Admin sync
  useEffect(() => {
    if (isAdminAuthenticated) {
      const q = query(collection(db, "waitlist"), orderBy("createdAt", "asc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const entries = [];
        querySnapshot.forEach((doc) => {
          entries.push({ id: doc.id, ...doc.data() });
        });
        setWaitlist(entries);
      });
      return () => unsubscribe();
    }
  }, [isAdminAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "waitlist"), {
        name,
        email,
        reason,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      localStorage.setItem("waitlistEmail", email);
      setSubmitted(true);
      setLocalUserStatus('pending');
      setName("");
      setEmail("");
      setReason("");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error joining waitlist. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (adminCode === ADMIN_CODE) {
      setIsAdminAuthenticated(true);
    } else {
      alert("Invalid code");
    }
  };

  const markAsReady = async (id) => {
    try {
      await updateDoc(doc(db, "waitlist", id), {
        status: 'ready'
      });
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  const removePerson = async (id) => {
    if (window.confirm("Are you sure you want to remove this person?")) {
      try {
        // Use the doc reference directly with the ID passed from the map
        const docRef = doc(db, "waitlist", id);
        await deleteDoc(docRef);
        console.log("Document successfully deleted:", id);
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Failed to remove person. Error: " + error.message);
      }
    }
  };

  if (showAdmin) {
    return (
      <div className="App admin-panel">
        <nav className="navbar">
          <div className="container">
            <div className="logo-container">
              <img src={companyLogo} alt="Dev City Studio" className="company-logo" />
              <span className="company-name">Admin Panel</span>
            </div>
            <button className="nav-button" onClick={() => { window.location.hash = ""; setShowAdmin(false); }}>Exit Admin</button>
          </div>
        </nav>

        <div className="container admin-content">
          {!isAdminAuthenticated ? (
            <div className="admin-login">
              <h2>Admin Login</h2>
              <form onSubmit={handleAdminAuth}>
                <input
                  type="password"
                  placeholder="Enter Admin Code"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  required
                />
                <button type="submit">Login</button>
              </form>
            </div>
          ) : (
            <div className="admin-dashboard">
              <h2>Waitlist Dashboard</h2>
              <div className="waitlist-table-container">
                <table className="waitlist-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Date Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlist.map((entry, index) => (
                      <tr key={entry.id}>
                        <td>{index + 1}</td>
                        <td>{entry.name}</td>
                        <td>{entry.email}</td>
                        <td>
                          <span className={`status-badge ${entry.status}`}>
                            {entry.status === 'ready' ? 'READY' : 'PENDING'}
                          </span>
                        </td>
                        <td>{entry.createdAt?.toDate().toLocaleString() || "Pending..."}</td>
                        <td className="action-buttons">
                          <button className="details-btn" onClick={() => setSelectedEntry(entry)}>Details</button>
                          {entry.status !== 'ready' && (
                            <button className="ready-btn" onClick={() => markAsReady(entry.id)}>Mark Ready</button>
                          )}
                          <button className="remove-btn" onClick={() => removePerson(entry.id)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedEntry && (
                <div className="modal-overlay" onClick={() => setSelectedEntry(null)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h3>Entry Details</h3>
                    <p><strong>Name:</strong> {selectedEntry.name}</p>
                    <p><strong>Email:</strong> {selectedEntry.email}</p>
                    <p><strong>Status:</strong> {selectedEntry.status}</p>
                    <p><strong>Joined:</strong> {selectedEntry.createdAt?.toDate().toLocaleString()}</p>
                    <p><strong>Reason:</strong></p>
                    <div className="reason-text">{selectedEntry.reason}</div>
                    <button onClick={() => setSelectedEntry(null)}>Close</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

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
          
          <div className="waitlist-section">
            {!submitted ? (
              <div className="waitlist-form-container">
                <h3>Join the Waitlist</h3>
                <form onSubmit={handleSubmit} className="waitlist-form">
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      placeholder="Why do you want to play Stellar Forge?"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Joining..." : "Join Waitlist"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="waitlist-status-container">
                {localUserStatus === 'ready' ? (
                  <div className="waitlist-ready">
                    <div className="ready-icon">✓</div>
                    <h3>You are Accepted!</h3>
                    <p>Welcome to Stellar Forge. You now have access to the game!</p>
                    <a 
                      href="https://play.google.com/apps/testing/com.stellarforge.galactic" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="download-button"
                    >
                      Join Closed Beta on Play Store
                    </a>
                  </div>
                ) : (
                  <div className="waitlist-success">
                    <h3>You're on the list!</h3>
                    <p>Status: <strong>Pending Approval</strong></p>
                    <p>We'll notify you when your access is ready.</p>
                  </div>
                )}
              </div>
            )}
          </div>
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
