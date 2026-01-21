// src/App.jsx
import React, { useReducer, useCallback, useEffect } from "react";
import SelectField from "./components/SelectField.jsx";
import moodData from "./store/mood.json";

// Initial state
const initialState = {
  genre: "",
  mood: "",
  level: "",
  aiResponses: [],
  loading: false,
  error: null,
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case "SET_GENRE":
      return { ...state, genre: action.payload, mood: "", error: null };
    case "SET_MOOD":
      return { ...state, mood: action.payload, error: null };
    case "SET_LEVEL":
      return { ...state, level: action.payload, error: null };
    case "SET_LOADING":
      return { ...state, loading: action.payload, error: null };
    case "ADD_RESPONSE":
      return {
        ...state,
        aiResponses: [...state.aiResponses, action.payload],
        loading: false,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "RESET_ALL":
      return initialState;
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const { genre, mood, level, aiResponses, loading, error } = state;

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    if (!genre || !mood || !level) return;

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const GEMINI_API_KEY = "AIzaSyAaitFnIuiRbEjr7EcmMq9Ieg5LQJzAs2I";
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. Explain why.`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        dispatch({ type: "ADD_RESPONSE", payload: text });
      } else {
        dispatch({ type: "SET_ERROR", payload: "No response from AI." });
      }
    } catch (err) {
      console.error("Fetch error:", err);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to fetch recommendations. Please try again.",
      });
    }
  }, [genre, mood, level]);

  // Handler wrappers
  const handleGenreChange = useCallback((value) => {
    dispatch({ type: "SET_GENRE", payload: value });
  }, []);

  const handleMoodChange = useCallback((value) => {
    dispatch({ type: "SET_MOOD", payload: value });
  }, []);

  const handleLevelChange = useCallback((value) => {
    dispatch({ type: "SET_LEVEL", payload: value });
  }, []);

  const genres = Object.keys(moodData);
  const availableMoods = moodData[genre] || [];

  return (
    <section
      style={{
        padding: "24px",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#333" }}>
        📚 Book Recommendation Bot
      </h1>

      <SelectField
        placeholder="Select a genre"
        id="genre"
        options={genres}
        value={genre}
        onChange={handleGenreChange}
      />

      <SelectField
        placeholder="Select a mood"
        id="mood"
        options={availableMoods}
        value={mood}
        onChange={handleMoodChange}
      />

      <SelectField
        placeholder="Select your reading level"
        id="level"
        options={["Beginner", "Intermediate", "Expert"]}
        value={level}
        onChange={handleLevelChange}
      />

      <button
        onClick={fetchRecommendations}
        disabled={!genre || !mood || !level || loading}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: loading ? "#ccc" : "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          cursor: !genre || !mood || !level ? "not-allowed" : "pointer",
          marginTop: "8px",
        }}
      >
        {loading ? "Generating..." : "Get Book Recommendations"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "12px", textAlign: "center" }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: "24px" }}>
        {aiResponses.map((response, index) => (
          <details
            key={index}
            style={{
              marginBottom: "16px",
              padding: "12px",
              border: "1px solid #eee",
              borderRadius: "6px",
              backgroundColor: "#fafafa",
            }}
          >
            <summary style={{ fontWeight: "bold", cursor: "pointer" }}>
              Recommendation #{index + 1}
            </summary>
            <div
              style={{
                marginTop: "8px",
                whiteSpace: "pre-wrap",
                lineHeight: 1.5,
              }}
            >
              {response}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
