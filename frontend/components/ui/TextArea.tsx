type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function TextArea(props: Props) {
  return (
    <textarea
      className="
        min-h-[180px]
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