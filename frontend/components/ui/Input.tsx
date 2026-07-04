type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input(props: Props) {
  return (
    <input
      className="
        w-full
        rounded-xl
        border
        border-slate-700
        bg-slate-900
        p-3
        outline-none
        focus:border-blue-500
      "
      {...props}
    />
  );
}