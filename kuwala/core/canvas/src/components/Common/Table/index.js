import React, { useMemo } from "react";
import { useFlexLayout, useResizeColumns, useSortBy, useTable} from "react-table";
import styles from "./styles";
import Icon from "../Icon";
import {BACKGROUND_COLOR_MAP, BORDER_COLOR_MAP} from "../../../constants/styling";

const Table = ({ color = 'kuwalaGreen', columns, data }) => {
    const defaultColumn = useMemo(
        () => ({
            minWidth: 48,
            width: 144,
            maxWidth: 432,
        }),
        []
    )
    columns = useMemo(() => [
        {
            Header: '',
            id: 'index',
            accessor: (_row, i) => i + 1,
            width: 48,
            disableSortBy: true
        },
        ...columns
    ], [columns]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable(
        {
            columns,
            data,
            defaultColumn,
        },
        useFlexLayout,
        useResizeColumns,
        useSortBy
    );

    const renderSortingIcon = (column) => {
        return (
            <span className={styles.iconContainer}>
                <Icon
                    icon={column.isSortedDesc ? 'arrow-down' : 'arrow-up'}
                    color={'black'}
                    size={'xxs'}
                />
            </span>
        );
    };

    const renderResizer = (column) => {
        return (
            <div
                {...column.getResizerProps()}
                className={styles.resizer}
                onClick={event => event.stopPropagation()}
            />
        )
    }

    const renderHeader = () => {
        return (
            <thead className={styles.reactTableElement}>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th
                                className={`${styles.headerColumn} ${BORDER_COLOR_MAP[color]} ${BACKGROUND_COLOR_MAP[color.replace('kuwala', 'kuwalaLight')]}`}
                                {...column.getHeaderProps(column.getSortByToggleProps())}
                            >
                                {column.render('Header')}
                                {column.isSorted && renderSortingIcon(column)}
                                {renderResizer(column)}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
        );
    };

    const renderRows = () => {
        return (
            <tbody {...getTableBodyProps()} className={styles.reactTableElement}>
                {rows.map((row) => {
                    prepareRow(row)

                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => (
                                <td className={`${styles.cell} ${BORDER_COLOR_MAP[color]}`} {...cell.getCellProps()}>
                                    {cell.render('Cell')}
                                </td>
                            ))}
                        </tr>
                    )
                })}
            </tbody>
        )
    }

    return (
        <div className={`${styles.tableContainer} ${BORDER_COLOR_MAP[color]}`}>
            <table {...getTableProps()} className={styles.reactTableElement}>
                {renderHeader()}
                {renderRows()}
            </table>
        </div>

    )
}

export default Table;
