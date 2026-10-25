import "./Button.css";

type ButtonProps = {
  text: string,
  disabled?:true|false
  color?: string;
  textColor?: string;
  borderColor?: string;
  size?: "small" | "medium" | "large";
  full?: boolean;
  onClick?: () => void;
};

export default function Button({
  text,disabled=false,
  color = "var(--color-primary)",
  textColor = "var(--color-surface)",
  borderColor,
  size = "medium",
  full = false,
  onClick,
}: ButtonProps) {
  return (
    <button disabled={disabled}
      className={`button button--${size}${full ? " button--full" : ""}`}
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