interface Repair {
  date: string;
  issue: string;
  repair: string;
}

interface Props {
  repairs: Repair[];
}

export default function RepairHistory({ repairs }: Props) {
  return (
    <div className="mt-8">
      <h3 className="text-white font-semibold mb-4">Repair History</h3>

      <div className="space-y-4">
        {repairs.map((r, i) => (
          <div
            key={i}
            className="bg-gray-900 border border-gray-800 p-4 rounded-lg"
          >
            <p className="text-gray-300 text-sm">{r.date}</p>

            <p className="text-gray-400 text-sm mt-1">Issue: {r.issue}</p>

            <p className="text-gray-400 text-sm">Repair: {r.repair}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
