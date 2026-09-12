 "use client";

import { useEffect, useRef, useState } from "react";

const CHANNELS = [
  // BURAYA SADECE KULLANMA İZNİN OLAN YAYINLARI EKLE.
  // { name: "Örnek Kanal", url: "https://example.com/stream.m3u8", category: "Genel" },
];

export default function Home() {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [channels, setChannels] = useState(CHANNELS);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tümü");
  const [m3uUrl, setM3uUrl] = useState("");

  useEffect(() => () => hlsRef.current?.destroy(), []);

  function play(channel) {
    const video = videoRef.current;
    if (!video) return;
    setSelected(channel);

    hlsRef.current?.destroy();
    hlsRef.current = null;

    const url = channel.url;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play().catch(() => {});
      return;
    }

    import("hls.js").then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      } else {
        video.src = url;
      }
    });
  }

  async function loadM3U() {
    try {
      const res = await fetch(m3uUrl);
      if (!res.ok) throw new Error("Liste alınamadı");
      const text = await res.text();
      const parsed = parseM3U(text);
      setChannels(parsed);
      setSelected(null);
    } catch {
      alert("M3U listesi yüklenemedi. CORS veya URL izinlerini kontrol et.");
    }
  }

  const cats = ["Tümü", ...new Set(channels.map(c => c.category).filter(Boolean))];
  const filtered = channels.filter(c =>
    (category === "Tümü" || c.category === category) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main>
      <header>
        <div className="logo">CAR <span>TV</span></div>
        <div className="badge">IPTV PLAYER</div>
      </header>

      <section className="importBox">
        <input
          value={m3uUrl}
          onChange={e => setM3uUrl(e.target.value)}
          placeholder="İzinli M3U/M3U8 listenin URL'si"
        />
        <button onClick={loadM3U}>Listeyi Yükle</button>
      </section>

      <section className="layout">
        <div className="playerCard">
          <div className="screen">
            <video ref={videoRef} controls playsInline />
            {!selected && <div className="empty">Bir kanal seç 🚗📺</div>}
          </div>
          <h2>{selected?.name || "CAR TV"}</h2>
          <p>{selected ? selected.category || "Genel" : "Kanal listesinden bir yayın seç."}</p>
        </div>

        <aside>
          <div className="tools">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Kanal ara..."
            />
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="channels">
            {filtered.length === 0 && <div className="noChannels">Henüz kanal eklenmedi.</div>}
            {filtered.map((c, i) => (
              <button className="channel" key={`${c.name}-${i}`} onClick={() => play(c)}>
                <span className="number">{String(i + 1).padStart(2, "0")}</span>
                <span className="channelName">{c.name}</span>
                <span className="arrow">▶</span>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <footer>CAR TV • Yalnızca yayınlama iznin olan içerikleri kullan.</footer>
    </main>
  );
}

function parseM3U(text) {
  const lines = text.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("#EXTINF")) continue;
    const info = lines[i];
    const url = lines[i + 1] && !lines[i + 1].startsWith("#") ? lines[i + 1] : "";
    const name = info.split(",").slice(1).join(",").trim() || "Kanal";
    const group = (info.match(/group-title="([^"]*)"/i) || [,"Genel"])[1];
    if (url) out.push({ name, url, category: group });
  }
  return out;
}