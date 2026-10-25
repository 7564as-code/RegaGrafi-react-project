import "./Button.css";

type ButtonProps = {
  text: string,
  disabled?:true|false
  color?: string;
  textColor?: string;
  borderColor?: string;
  size?: "small" | "medium" | "large";
  onClick?: () => void;
};

export default function Button({
  text,disabled=false,
  color = "#2563eb",
  textColor = "#fff",
  borderColor,
  size = "medium",
  onClick,
}: ButtonProps) {
  return (
    <button disabled={disabled}
      className={`button button--${size}`}
      style={{
        backgroundColor: color,
        color: textColor,
        border: borderColor ? `1px solid ${borderColor}` : "none",
      }}
      onClick={onClick}
    >
      {text} 
    </button>
  );
}