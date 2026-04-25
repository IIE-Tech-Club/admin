import './Loader.css';

export default function Loader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="loader-container">
      <span className="loader"></span>
      <span className="font-mono text-[9px] text-[rgba(0,245,255,0.45)] uppercase tracking-[0.3em] animate-pulse">
        {text}
      </span>
    </div>
  );
}
