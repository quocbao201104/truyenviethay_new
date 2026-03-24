const DEFAULT_AUDIO_PUBLIC_BASE_URL = "https://audio.truyenviethay.id.vn";

const joinUrl = (base, pathPart) => {
  const baseClean = String(base || "").replace(/\/+$/, "");
  const pathClean = String(pathPart || "").replace(/^\/+/, "");
  return `${baseClean}/${pathClean}`;
};

const getAudioPublicBaseUrl = () =>
  process.env.AUDIO_PUBLIC_BASE_URL || DEFAULT_AUDIO_PUBLIC_BASE_URL;

const resolveAudioUrl = (audioUrl, r2Key) => {
  if (audioUrl) return audioUrl;
  if (!r2Key) return null;
  return joinUrl(getAudioPublicBaseUrl(), r2Key);
};

module.exports = {
  DEFAULT_AUDIO_PUBLIC_BASE_URL,
  getAudioPublicBaseUrl,
  resolveAudioUrl,
};
