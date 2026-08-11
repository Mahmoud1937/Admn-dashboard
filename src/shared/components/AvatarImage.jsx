import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

export default function AvatarImage({ src, alt, size = "h-10 w-10" }) {
  return (
    <div className={`flex ${size} items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50`}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <FontAwesomeIcon icon={faImage} className="text-sm text-slate-300" />
      )}
    </div>
  );
}