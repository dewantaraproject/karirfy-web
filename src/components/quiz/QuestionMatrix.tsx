import type { QuestionItem } from "../../types";

export function QuestionMatrix({ rows }: { rows: NonNullable<QuestionItem["matrixData"]> }) {
  return (
    <table className="glass matrix-grid" aria-label={`Matriks angka ${rows.length} × ${rows[0]?.length ?? 0}`}>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {row.map((value, cell) => (
              <td key={cell} className={value === "?" ? "matrix-cell qmark" : "matrix-cell"}>
                {value === "?" ? <span aria-label="Angka yang hilang">?</span> : value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
