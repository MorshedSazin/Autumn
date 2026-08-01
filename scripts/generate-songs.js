import { readdirSync, statSync } from "fs";
import { join, extname, basename } from "path";

const AUDIO_DIR = new URL("../public/audio", import.meta.url).pathname;
const COVERS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCd3lPdrOMNdtjMp-TwR3weG_IA230DDrNDtyaMJw60mNQbWqHphQYZJ43RriGlSLtFPIyZs7Q5n9fNMh7QCGtNw75S2Q2rFRB7aToi9KpxLqcPsax0xhRe4aIaXYDeHdV6OTSS3Am1ZkTYSYt2pfjKacV2275EQvt0uZtEn-jXkGuVVOKWpRbJ9TQJsCAKP5urkMeCLdZjMLQPAlL76U6f5JzO2UstZzmTT24RlUeLQ75QAds3Mmv8-OPwPwCIHV90qRYZAqHrgrw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCU8djDOFnGovOENcPWDlS3_AkG2lRbhQg6MF0u5hWzfe-tuWpNXBRWQTJkQ1SAUDeK0qgcqVpyDyghAi2DdFyVVYk5AcE7LHt8ct5hdDElM-4a9JesxfI1Amy2IKnGzLfJaCbgqvdgbAq9lBZc7J8MwuMtfFW5Eu--jejqdAAqfq9VuBZT3o6oaJE7QdIdBfpCYCjY1imQVTGBtVl4pZYsE1OryE7jgq1VUnd-g2JFwr-mqiAZjNDYpkd2HaNN9Ai-HFoFqKl2B6A",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCBjTjWReNWhRB867M5iEKf7YxpmfJngdK3MrSH7ARGENnLxVSimE6zLMSk1URiW7p99Ba6ITDuOI9XrSV8X6IDbtsppC_7ayoH4FAaTiTloGZkJN3nl9oOWn-9luOWpelyRxqHkZpmkzaaeJNvsjfK-XUFHkuw6ODM_3VfAnCCwbhBTO7GDoan6WSH_9DzFLW6uTwzQ2W2rqujC725BtDUXySRDRUgh37_3S99Cx8HA1R6xYbM5yiseuoOjNGGQOUDIa8wPpeRxpo",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDkJxNVgXT-kpSa4PeeadMcNhmkMEqp4iVglVNKg2zoy8k2U3d-Vx28FWbq5zqOjn4A082hBh0f9fI4kk_UT67KppGJFZdpjQriCmTxFbVbP7n91JD2h03Jzjth22tz9OOKwPa6EUq4WbzRk8b_X9ZU8hSrIH8w4MpguWva-k9fnHuXQEceDWgFvtzmRwBF-1DUWjamJTRZ04qAuey-_TN7MYfz_T1fWQiwYIbUm7d5ScnHFZrgPLQYwlLmarIUWbKh24RgBmWKOmk",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBorYU84aUXIzwPCX0_c7fFP9_LClBSmqzOTk5hDKtSYsc5_kvQJFIix5IebPqM2KJ4-ufiOcycNEDACCQY5c6Feaa4PwXtLaMgyGT0AQDcTpKSQ5rwdK5vq-bsNfHNDvFxmkqHv8hYGrZjuU7DN_14gvyiGIVqwuAREJwsmRsbh5cW4pB2j_gMVoJ2Y2hGivCdK4PayNboAPa_QNnEejBXCqMrG298oOvD546KpHqkh8LcH039-Fq6ePrG5FD6Cso_QLMwmPaWb6w",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDqIFwGPdj1LMG2hta3wHALsgfQ03wqSNMeARet7LuOTHFrxMjoHLNwHSx0Y9WhPwOGQRWPVz6DIXYCdTuebUoxIobCarXG-8Z_X-oXuzvA-JRcjSPcnY4mGlXjYBx9oLa8EvrU2Ie9kq3VM_iaoh-91l4drVFOxaBRR4QDTdVKyM5nFAFoSofgIB9HJFyHcG6wmWVZVy1DDashvn6xDeiUkqqaUpMMlmYCRlMFFXPmPuLauOifU2LlgJjAHR_fo9q-oDMpQXjagmk",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCNoAiXT8m0kLp81iAUppUSHkdrctygTDrZNd3gFkE9lb4lDUkiiPzSL2V2hAKZz_3vT-HscY5MKX5auv4zmKQemV4wIqBUFOUQV3FST6JMmoUXLXRAf1xSl-lYZv9pl9KJV03mKtRXQQdqKINvj2x6j_kQzm0utiEswRgwsWToimIhpMyYFbXj-8TXQ_hCsu2w66CcRMW5GmpTMnkhNfrYzWfof_6UXCfzlXUrCJaTTwUpUkHUJ39bUuVuhLNvfZl3TM0lOMzi0C0",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBmCy2QBuQOudRbU_BFGeZzt1dxJVATPUjfyGf-8nWnzq1EGqKfjufRJqCBWlDtKItwdj3r5Zcc509RMZFqhATaX3t7RRFne_wZII0uqBqbYDSABgRTCN7QVNOvldwAYH0A29caEdv8uySsqtAkKln4wb3YyxOGvdlCyAuMEkORfXDsAxrynn-3ZHZj5nzAPPR5wE1iogtk1QOQncNhHzuEMWtBx8jE9vr6KYsFaUBRjV3CFBaKgEntjTq9msiSl0739CI6SRILx64",
];

const ARTIST_NAME_MAP = {
  "after math": "Aftermath",
  "airsupply": "Air Supply",
  "bangla": "Bangla",
  "bolly": "Bollywood",
  "brand highway": "Brand Highway",
  "bullet from my valentines": "Bullet For My Valentine",
  "cigarette after sex": "Cigarettes After Sex",
  "green day": "Green Day",
  "hollywood": "Hollywood",
  "matallica": "Metallica",
  "queen": "Queen",
  "random": "Various Artists",
  "scorpions": "Scorpions",
  "scorpions rocks": "Scorpions",
  "security_music": "Keyfactor Music",
  "seethere": "Seether",
  "shindown": "Shinedown",
  "sonarbanglaCircus": "Shonar Bangla Circus",
  "the chainsmokers": "The Chainsmokers",
  "warfaze": "Warfaze",
};

const GENRE_MAP = {
  "after math": "Rock",
  "airsupply": "Soft Rock",
  "bangla": "Bangla",
  "bolly": "Bollywood",
  "brand highway": "Bangla Rock",
  "bullet from my valentines": "Metal",
  "cigarette after sex": "Dream Pop",
  "green day": "Punk Rock",
  "hollywood": "Pop",
  "matallica": "Metal",
  "queen": "Classic Rock",
  "random": "Pop",
  "scorpions": "Classic Rock",
  "security_music": "Novelty",
  "seethere": "Rock",
  "shindown": "Rock",
  "sonarbanglaCircus": "Bangla Rock",
  "the chainsmokers": "Electronic",
  "warfaze": "Bangla Rock",
};

function cleanTitle(filename) {
  let name = basename(filename, extname(filename));
  name = name.replace(/\(.*?\)/g, "");
  name = name.replace(/\[.*?\]/g, "");
  name = name.replace(/- YouTube$/gi, "");
  name = name.replace(/- Youtube$/gi, "");
  name = name.replace(/\s*\|.*$/, "");
  name = name.replace(/Official (Music )?Video/gi, "");
  name = name.replace(/Official (Lyric )?Video/gi, "");
  name = name.replace(/Official Audio/gi, "");
  name = name.replace(/Lyric Video/gi, "");
  name = name.replace(/\(Official Video\)/gi, "");
  name = name.replace(/\(Audio\)/gi, "");
  name = name.replace(/\(Lyrics\)/gi, "");
  name = name.replace(/\(Lyric\)/gi, "");
  name = name.replace(/\(Official Lyric Video\)/gi, "");
  name = name.replace(/\(Official Music Video\)/gi, "");
  name = name.replace(/\(Official 4K Video\)/gi, "");
  name = name.replace(/HD\)/gi, "");
  name = name.replace(/ft\./gi, "feat.");
  name = name.replace(/_.*$/g, "");
  name = name.replace(/-\s*[a-zA-Z0-9_-]{10,}$/, "");
  name = name.replace(/\s*-\s*$/, "");
  name = name.replace(/^\s*[-–—]+\s*/, "");
  name = name.replace(/\(\s*\)/g, "");
  name = name.replace(/\[\s*\]/g, "");
  name = name.trim();
  if (name.length < 2) return basename(filename, extname(filename)).replace(/[-_]/g, " ").trim();
  return name;
}

const audioExts = [".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac", ".webm"];

function isAudioFile(name) {
  return audioExts.includes(extname(name).toLowerCase());
}

const dirs = readdirSync(AUDIO_DIR).filter(d => statSync(join(AUDIO_DIR, d)).isDirectory());

let id = 1;
const songs = [];

for (const dir of dirs) {
  const dirPath = join(AUDIO_DIR, dir);
  const files = readdirSync(dirPath).filter(isAudioFile).sort();
  const artist = ARTIST_NAME_MAP[dir.toLowerCase()] || dir;
  const album = artist;
  const genre = GENRE_MAP[dir.toLowerCase()] || "Unknown";

  for (const file of files) {
    const title = cleanTitle(file);
    const coverIdx = (id - 1) % COVERS.length;
    songs.push({
      id: String(id),
      title,
      artist,
      album,
      genre,
      duration: 0,
      cover: COVERS[coverIdx],
      audio: `/audio/${encodeURIComponent(dir)}/${encodeURIComponent(file)}`,
    });
    id++;
  }
}

const playlists = dirs
  .filter(d => {
    const dirPath = join(AUDIO_DIR, d);
    const files = readdirSync(dirPath).filter(isAudioFile);
    return files.length >= 3;
  })
  .slice(0, 10)
  .map((dir, i) => {
    const artist = ARTIST_NAME_MAP[dir.toLowerCase()] || dir;
    const dirPath = join(AUDIO_DIR, dir);
    const files = readdirSync(dirPath).filter(isAudioFile).sort();
    const songIds = files.map((_, j) => {
      const globalIdx = songs.findIndex(s => s.artist === artist);
      return String(globalIdx + 1 + j);
    });
    return {
      id: `pl-${i + 1}`,
      title: `${artist} Essentials`,
      description: `Top tracks from ${artist}`,
      songIds,
      cover: songs.find(s => s.artist === artist)?.cover || COVERS[0],
    };
  });

const uniqueGenres = [...new Set(songs.map(s => s.genre))];
const genres = uniqueGenres.map((g, i) => ({
  id: `g-${i + 1}`,
  name: g,
  color: `from-primary/${((i % 6) + 3) * 10}`,
  count: `${songs.filter(s => s.genre === g).length} tracks`,
}));

const genreImages = {};
for (const g of uniqueGenres) {
  genreImages[g] = COVERS[uniqueGenres.indexOf(g) % COVERS.length];
}

const moods = [...uniqueGenres].slice(0, 4);
const trendingTags = [`#${uniqueGenres[0]?.replace(/\s+/g, "") || "Music"}`, "#NewReleases", "#Throwback", "#LiveSession"];

const output = `export const songs = ${JSON.stringify(songs, null, 2)};

export const playlists = ${JSON.stringify(playlists, null, 2)};

export const moods = ${JSON.stringify(moods)};

export const genres = ${JSON.stringify(genres, null, 2)};

export const genreImages = ${JSON.stringify(genreImages, null, 2)};

export const trendingTags = ${JSON.stringify(trendingTags)};
`;

process.stdout.write(output);
