 "use client";

import { useEffect, useRef, useState } from "react";

const CHANNELS = [
  // Kendi yayÄ±nlama iznin olan kanallarÄ± buraya ekleyebilirsin:
  // { name: "Ã–rnek Kanal", url: "https://example.com/stream.m3u8", category: "Genel" },
];

const demoFeatured = ["TRT 1", "ATV", "SHOW TV", "KANAL D", "STAR TV", "FOX TV"];

export default function Home() {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [channels, setChannels] = useState(CHANNELS);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("TÃ¼mÃ¼");
  const [m3uUrl, setM3uUrl] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => () => hlsRef.current?.destroy(), []);

  function play(channel) {
    const video = videoRef.current;
    if (!video) return;
    setSelected(channel);
    hlsRef.current?.destroy();
    hlsRef.current = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = channel.url;
      video.play().catch(() => {});
      return;
    }

    import("hls.js").then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(channel.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      } else {
        video.src = channel.url;
      }
    });
  }

  async function loadM3U() {
    if (!m3uUrl.trim()) return;
    try {
      const res = await fetch(m3uUrl.trim());
      if (!res.ok) throw new Error();
      const parsed = parseM3U(await res.text());
      setChannels(parsed);
      setSelected(null);
      alert(`${parsed.length} kanal yÃ¼klendi.`);
    } catch {
      alert("M3U listesi yÃ¼klenemedi. URL ve CORS izinlerini kontrol et.");
    }
  }

  const categories = ["TÃ¼mÃ¼", ...new Set(channels.map(c => c.category).filter(Boolean))];
  const filtered = channels.filter(c =>
    (category === "TÃ¼mÃ¼" || c.category === category) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="app">
      <header className="topbar">
        <button className="mobileMenu" onClick={() => setMenuOpen(!menuOpen)}>â˜°</button>
        <div className="brand"><div className="brandCar">âŒ</div><div><strong>CAR <i>TV</i></strong><small>IPTV</small></div></div>
        <div className="search"><span>âŒ•</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kanal ara..." /></div>
        <div className="topActions"><div className="clock">20:45<small>12 EylÃ¼l 2026</small></div><button>â™¡<small>Favoriler</small></button><button>âš™<small>Ayarlar</small></button><button>â›¶</button></div>
      </header>

      <div className="body">
        <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
          <nav>
            {["âŒ‚|Ana Sayfa", "â–£|TÃ¼m Kanallar", "â–±|TV KanallarÄ±", "â—|Spor", "â–¤|Film & Dizi", "â–¥|Haber", "â˜º|Ã‡ocuk", "â—’|Belgesel", "â™«|MÃ¼zik", "âŒ–|Yerel Kanallar", "â™¡|Favoriler", "â—·|Son Ä°zlenenler"].map((item, i) => {
              const [icon, text] = item.split("|");
              return <button key={text} className={i === 0 ? "active" : ""} onClick={() => {setCategory(text === "TÃ¼m Kanallar" ? "TÃ¼mÃ¼" : text); setMenuOpen(false)}}><span>{icon}</span>{text}</button>;
            })}
          </nav>
          <div className="sideCard"><div className="carIcon">ğŸš˜</div><b>CAR TV IPTV</b><p>DilediÄŸin her yerde,<br/>favori kanallarÄ±nÄ± izle!</p></div>
        </aside>

        <section className="content">
          <div className="hero">
            <div className="heroText"><small>CAR TV IPTV</small><h1>Favori KanallarÄ±n<br/><em>Hepsi Burada!</em></h1><p>Sinema, dizi, spor, Ã§ocuk ve daha fazlasÄ±...</p><button onClick={() => filtered[0] && play(filtered[0])}>â–¶ Hemen Ä°zle</button></div>
            <div className="heroCar">ğŸï¸</div>
          </div>

          <SectionTitle icon="â–£" title="Ã–ne Ã‡Ä±kan Kanallar" />
          <div className="featured">
            {demoFeatured.map((name, i) => <button key={name} className="channelCard" onClick={() => {
              const c = channels.find(x => x.name.toLowerCase().includes(name.toLowerCase()));
              if (c) play(c);
            }}><span className={`fakeLogo l${i}`}>{name}</span><b>{name}</b><small>Genel TV</small><span className="star">â˜†</span></button>)}
          </div>

          <SectionTitle icon="â–£" title="Kategoriler" />
          <div className="categories">
            {[["â–£","TÃ¼m Kanallar","112"],["âš½","Spor","18"],["â–¤","Film & Dizi","24"],["â–¥","Haber","12"],["â˜º","Ã‡ocuk","8"],["â™«","MÃ¼zik","6"]].map(([icon,name,count]) =>
              <button key={name} onClick={() => setCategory(name === "TÃ¼m Kanallar" ? "TÃ¼mÃ¼" : name)}><span>{icon}</span><b>{name}</b><small>{count} Kanal</small><i>â€º</i></button>
            )}
          </div>

          <SectionTitle icon="â†—" title="PopÃ¼ler Kanallar" />
          <div className="popular">
            {filtered.slice(0, 8).map((c, i) => <button key={i} onClick={() => play(c)}><span className="miniLogo">{c.name.slice(0, 6)}</span><b>{c.name}</b></button>)}
            {filtered.length === 0 && <div className="emptyList">HenÃ¼z kanal eklenmedi. SaÄŸdaki M3U alanÄ±ndan izinli listenizi yÃ¼kleyin.</div>}
          </div>
        </section>

        <aside className="rightPanel">
          <div className="liveHeader"><b><span className="dot"></span> CANLI YAYIN</b><span>HD</span></div>
          <div className="liveScreen">
            <video ref={videoRef} controls playsInline />
            {!selected && <div className="livePlaceholder">ğŸ“º<strong>CAR TV</strong><small>Bir kanal seÃ§erek izlemeye baÅŸla</small></div>}
          </div>
          <div className="nowCard"><span className="redLogo">TV</span><div><b>{selected?.name || "Kanal SeÃ§ilmedi"}</b><small>{selected?.category || "CanlÄ± yayÄ±n"}</small></div><span>â€º</span></div>
          <h3>YayÄ±nda Åimdi</h3>
          <div className="schedule"><div><b>20:00</b><span>CanlÄ± YayÄ±n</span></div><div><b>21:45</b><span>AkÅŸam ProgramÄ±</span></div><div><b>00:15</b><span>Gece YayÄ±nÄ±</span></div></div>
          <h3>â™¡ Favoriler</h3>
          <div className="favorites"><div>â–£ <span>Favori kanallarÄ±n burada gÃ¶rÃ¼necek</span></div></div>
          <div className="m3u"><input value={m3uUrl} onChange={e => setM3uUrl(e.target.value)} placeholder="M3U URL" /><button onClick={loadM3U}>â†— M3U URL Ekle</button></div>
        </aside>
      </div>
      <footer>CAR TV IPTV â€¢ YalnÄ±zca yayÄ±nlama iznin olan iÃ§erikleri kullan.</footer>
    </main>
  );
}

function SectionTitle({icon,title}) { return <div className="sectionTitle"><span>{icon}</span><h2>{title}</h2><a>TÃ¼mÃ¼nÃ¼ GÃ¶r â†’</a></div>; }

function parseM3U(text) {
  const lines = text.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const out = [];
  for (let i=0;i<lines.length;i++) {
    if (!lines[i].startsWith("#EXTINF")) continue;
    const info=lines[i], url=lines[i+1] && !lines[i+1].startsWith("#") ? lines[i+1] : "";
    const name=info.split(",").slice(1).join(",").trim() || "Kanal";
    const group=(info.match(/group-title="([^"]*)"/i)||[,"Genel"])[1];
    if(url) out.push({name,url,category:group});
  }
  return out;
}
