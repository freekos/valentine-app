import { ValentineCard } from "./valentine_card";

interface ValentinesGridProps {
  data: any[];
}

export const ValentinesGrid = ({ data }: ValentinesGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 sm:grid-cols-2">
      {data.map((valentine) => (
        <ValentineCard key={valentine.id} data={valentine} />
      ))}
    </div>
  );
};
