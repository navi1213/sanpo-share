type ButtonProps = {
  text: string;
  variant?: "contained" | "outlined" | "text";
  className?: string; // 任意のクラス名を受け取る
  onClick?: () => void; // 任意のクリックハンドラ
  href?: string;
};

const Button = ({
  text,
  variant = "contained",
  className = "",
  onClick,
  href,
}: ButtonProps) => {
  // デフォルトスタイルを variant に基づいて決定
  const baseStyles = "px-4 py-2 text-sm font-medium rounded-md";
  const variantStyles =
    variant === "contained"
      ? "text-white bg-blue-600 hover:bg-blue-700"
      : variant === "outlined"
      ? "text-blue-600 border border-blue-600 hover:bg-blue-50"
      : "text-blue-600 hover:underline";

  const Component = href ? 'a' : 'button';
  
  return (
    <Component
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...(href ? { href } : {})}
    >
      {text}
    </Component>
  );
};

export default Button;

