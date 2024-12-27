import React from 'react';

const Table = ({ columns, data }) => {
  const formatHeader = (header) => {
    return header
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatCellContent = (column, value) => {
    if (value === null || value === undefined) return '-';
    
    if (column === 'gate_in' && value) {
      return value.substring(0, 5);
    }
    
    return value.toString();
  };

  const getColumnAlignment = (column) => {
    const numberColumns = ['qty', 'nett_weight', 'gross_weight', 'volume', 'year', 'month', 'week_no', 'week_in_month'];
    return numberColumns.includes(column) ? 'text-right' : 'text-left';
  };

  return (
    <div className="h-full rounded-lg border border-gray-200 bg-white">
      <div className="h-full overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className={`${getColumnAlignment(column)} sticky top-0 bg-gray-50 px-6 py-2 text-xs font-medium uppercase tracking-wider text-gray-500`}
                >
                  {formatHeader(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column}`}
                    className={`${getColumnAlignment(column)} whitespace-nowrap px-6 py-4 text-sm text-gray-900`}
                  >
                    {formatCellContent(column, row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;