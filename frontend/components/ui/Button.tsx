type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className="
        rounded-xl
        bg-blue-600
        px-6
        py-3
        font-semibold
        transition
        hover:bg-blue-700
        disabled:opacity-50
      "
      {...props}
    >
      {children}
    </button>
  );
}