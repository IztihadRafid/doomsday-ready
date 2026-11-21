type SubContentHeaderProps = {
  title: string;
  subTitle: string;
  description: string;
};
const SubContentHeader = ({
  title,
  subTitle,
  description,
}: SubContentHeaderProps) => {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
        {title}
      </p>
      <h1 className="mt-2 text-4xl font-bold">{subTitle}</h1>
      <p className="mt-2 text-gray-400">{description}</p>
    </div>
  );
};

export default SubContentHeader;
