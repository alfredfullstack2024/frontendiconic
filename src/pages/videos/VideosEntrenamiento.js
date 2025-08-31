import React, { useState } from "react";

export default function VideosEntrenamiento() {
  const ejerciciosPorGrupo = {
    "🎯 Acrobacias Básicas": [
      "ACROBACIAS BÁSICAS desde el suelo - EL MACACO",
      "Curso Básico de Acrobacias (Compilación)",
      "Acrobacias Fáciles - Stunts Básicos",
      "Parada de manos con rodada adelante (Paso a paso)",
      "Gana flexibilidad en las piernas para el split",
      "Cómo hacer una parada de manos (Paso a paso)",
      "KIP UP en español - Paso a paso",
      "PINO PUENTE en gimnasia rítmica",
      "La vertical de cabeza - Gimnasia artística",
      "3 acrobacias para baile - Mejora tus acrobacias",
      "La paloma con una mano - Tutorial",
      "Cómo hacer Slow-Roll - Gimnasia acrobática",
      "La rueda - Paso a paso",
      "Rueda sin manos - Paso a paso"
    ],
    "🧘 Flexibilidad y Estiramientos": [
      "Ejercicios para ganar flexibilidad en las piernas",
    ],
    "🤝 Acrobacias en Pareja": [
      "Acrobacia en pareja para principiantes",
      "Acrobacias sencillas en pareja",
      "Acrobacias en pareja estilo TikTok",
      "Acrobacia fácil en pareja",
      "Acrobacias intermedias en pareja",
      "Acrobacias avanzadas en pareja",
    ],
    "⚡ Avanzadas": [
      "Mortal lateral - Tutorial acrobacias",
      "Flic-flac con rondada",
      "Curso básico de acrobacias (compilación)",
      "Cómo hacer rueda y flic-flac avanzado",
      "Acrobacia en pareja para principiantes (baile)",
      "Salto carpado paso a paso",
      "Round-off para principiantes"
    ],
    "📺 Playlist Porras": [
      "Ver Playlist Porras"
    ]
  };

  const videoMap = {
    // Acrobacias Básicas
    "ACROBACIAS BÁSICAS desde el suelo - EL MACACO": "https://www.youtube.com/embed/NIjo70Dq9wo",
    "Curso Básico de Acrobacias (Compilación)": "https://www.youtube.com/embed/opC4bv1pbK8",
    "Acrobacias Fáciles - Stunts Básicos": "https://www.youtube.com/embed/cFlkFakT7FY",
    "Parada de manos con rodada adelante (Paso a paso)": "https://www.youtube.com/embed/4HUJ-zKmkmM",
    "Gana flexibilidad en las piernas para el split": "https://www.youtube.com/embed/kP2oztmC93o",
    "Cómo hacer una parada de manos (Paso a paso)": "https://www.youtube.com/embed/8djVh2Df6ew",
    "KIP UP en español - Paso a paso": "https://www.youtube.com/embed/gbsYQq_ANMY",
    "PINO PUENTE en gimnasia rítmica": "https://www.youtube.com/embed/VnWzN5WxbFM",
    "La vertical de cabeza - Gimnasia artística": "https://www.youtube.com/embed/LaxBQQJTf4w",
    "3 acrobacias para baile - Mejora tus acrobacias": "https://www.youtube.com/embed/4JSmTbeIGzg",
    "La paloma con una mano - Tutorial": "https://www.youtube.com/embed/LtaEUc-9pek",
    "Cómo hacer Slow-Roll - Gimnasia acrobática": "https://www.youtube.com/embed/WmPaDnjUJJM",
    "La rueda - Paso a paso": "https://www.youtube.com/embed/jKMOOqU6Ai0",
    "Rueda sin manos - Paso a paso": "https://www.youtube.com/embed/rwydmiABAoA",

    // Flexibilidad
    "Ejercicios para ganar flexibilidad en las piernas": "https://www.youtube.com/embed/ubp4VtL8PzQ",

    // Acrobacias en Pareja
    "Acrobacia en pareja para principiantes": "https://www.youtube.com/embed/Gv3tdKpANdY",
    "Acrobacias sencillas en pareja": "https://www.youtube.com/embed/1FUSmHJMN44",
    "Acrobacias en pareja estilo TikTok": "https://www.youtube.com/embed/J2ZDz_7cwcA",
    "Acrobacia fácil en pareja": "https://www.youtube.com/embed/5vi1_iutCRE",
    "Acrobacias intermedias en pareja": "https://www.youtube.com/embed/s-Od8cuBvuQ",
    "Acrobacias avanzadas en pareja": "https://www.youtube.com/embed/ahW8kMjt-dU",

    // Avanzadas
    "Mortal lateral - Tutorial acrobacias": "https://www.youtube.com/embed/9aFTTS-cJQA",
    "Flic-flac con rondada": "https://www.youtube.com/embed/xoywXLojb-o",
    "Cómo hacer rueda y flic-flac avanzado": "https://www.youtube.com/embed/ubp4VtL8PzQ",
    "Acrobacia en pareja para principiantes (baile)": "https://www.youtube.com/embed/Gv3tdKpANdY",
    "Salto carpado paso a paso": "https://www.youtube.com/embed/TEv6g3LWUfM",
    "Round-off para principiantes": "https://www.youtube.com/embed/w6U4QiUBd84",

    // Playlist Porras
    "Ver Playlist Porras": "https://www.youtube.com/embed/videoseries?list=PLJ5zQoDXumRB9ab9LZIax1qCSOv5nUtqN"
  };

  const [videoSeleccionado, setVideoSeleccionado] = useState("https://www.youtube.com/embed/TXSxN_WY208?list=PLfoM3A_rQ0tUBh7d8-24lTLin6v29s3N3");

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", background: "#f0f8ff" }}>
      <h1 style={{ textAlign: "center", color: "#ff4081" }}>🎬 Videos de Entrenamiento</h1>
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 1 }}>
          {Object.keys(ejerciciosPorGrupo).map((categoria) => (
            <div key={categoria} style={{ marginBottom: "20px" }}>
              <h2 style={{ color: "#3f51b5" }}>{categoria}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {ejerciciosPorGrupo[categoria].map((ejercicio) => (
                  <button
                    key={ejercicio}
                    style={{
                      background: "linear-gradient(45deg, #ff4081, #ff9800)",
                      color: "white",
                      border: "none",
                      padding: "10px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      flex: "1 0 45%"
                    }}
                    onClick={() => setVideoSeleccionado(videoMap[ejercicio])}
                  >
                    {ejercicio}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <iframe
            width="100%"
            height="500px"
            src={videoSeleccionado}
            title="Video de entrenamiento"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}
