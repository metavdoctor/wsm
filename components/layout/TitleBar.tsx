export default function TitleBar({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="-mx-4 lg:-mx-6 -mt-4 lg:-mt-6 mb-5 h-[55px] bg-white flex items-center">
      <div className="w-[30px] h-full bg-[#D7B377] shrink-0" />
      <span className="ml-4 text-[11px] font-semibold text-[#2B4162] tracking-wide uppercase whitespace-nowrap">
        {title}
      </span>
      {children && (
        <div className="ml-auto flex items-center gap-2 pr-4 lg:pr-6">
          {children}
        </div>
      )}
    </div>
  );
}
