import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://villages-api-ecru.vercel.app/api/v1";

function App() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSubDistrict, setSelectedSubDistrict] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch states on load
  useEffect(() => {
    axios.get(`${API_URL}/states`)
      .then(res => setStates(res.data.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch districts when state selected
  useEffect(() => {
    if (selectedState) {
      axios.get(`${API_URL}/states/${selectedState}/districts`)
        .then(res => setDistricts(res.data.data))
        .catch(err => console.error(err));
    }
  }, [selectedState]);

  // Fetch subdistricts when district selected
  useEffect(() => {
    if (selectedDistrict) {
      axios.get(`${API_URL}/districts/${selectedDistrict}/subdistricts`)
        .then(res => setSubDistricts(res.data.data))
        .catch(err => console.error(err));
    }
  }, [selectedDistrict]);

  // Fetch villages when subdistrict selected
  useEffect(() => {
    if (selectedSubDistrict) {
      axios.get(`${API_URL}/subdistricts/${selectedSubDistrict}/villages`)
        .then(res => setVillages(res.data.data))
        .catch(err => console.error(err));
    }
  }, [selectedSubDistrict]);

  // Search villages
  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/villages/search?name=${searchTerm}`);
      setSearchResults(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "Arial", maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", color: "#2c3e50" }}>
        🇮🇳 All India Villages API
      </h1>
      <p style={{ textAlign: "center", color: "#7f8c8d" }}>
        Search and explore villages across India
      </p>

      {/* Search Bar */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Search village name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "10px", width: "300px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button
          onClick={handleSearch}
          style={{ padding: "10px 20px", marginLeft: "10px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}
        >
          Search
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div style={{ marginBottom: "30px" }}>
          <h3>Search Results ({searchResults.length})</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#3498db", color: "white" }}>
                <th style={{ padding: "10px" }}>Village</th>
                <th style={{ padding: "10px" }}>Sub-District</th>
                <th style={{ padding: "10px" }}>District</th>
                <th style={{ padding: "10px" }}>State</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((v, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f2f2f2" : "white" }}>
                  <td style={{ padding: "10px" }}>{v.name}</td>
                  <td style={{ padding: "10px" }}>{v.subDistrict?.name}</td>
                  <td style={{ padding: "10px" }}>{v.subDistrict?.district?.name}</td>
                  <td style={{ padding: "10px" }}>{v.subDistrict?.district?.state?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Hierarchy Browser */}
      <h2 style={{ color: "#2c3e50" }}>Browse by Hierarchy</h2>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

        {/* States */}
        <div style={{ flex: 1, minWidth: "200px" }}>
          <h3>States ({states.length})</h3>
          <select
            onChange={(e) => setSelectedState(e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "5px" }}
          >
            <option value="">Select State</option>
            {states.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Districts */}
        <div style={{ flex: 1, minWidth: "200px" }}>
          <h3>Districts ({districts.length})</h3>
          <select
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "5px" }}
          >
            <option value="">Select District</option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Sub Districts */}
        <div style={{ flex: 1, minWidth: "200px" }}>
          <h3>Sub Districts ({subDistricts.length})</h3>
          <select
            onChange={(e) => setSelectedSubDistrict(e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "5px" }}
          >
            <option value="">Select Sub District</option>
            {subDistricts.map(sd => (
              <option key={sd.id} value={sd.id}>{sd.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Villages */}
      {villages.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Villages ({villages.length})</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {villages.map((v, i) => (
              <span key={i} style={{ backgroundColor: "#e8f4fd", padding: "5px 10px", borderRadius: "15px", fontSize: "14px" }}>
                {v.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;