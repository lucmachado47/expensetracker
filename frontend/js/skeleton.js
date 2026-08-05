/** Renders shimmering placeholder rows into a table body while data is loading. */

/**
 * Fills a <tbody> with skeleton rows.
 *
 * @param {HTMLElement|null} tbody Target table body (safely no-ops if null).
 * @param {number} columns Number of columns to fill per row.
 * @param {number} [rows=4] Number of placeholder rows to render.
 */
export const renderSkeletonRows = (tbody, columns, rows = 4) => {
    if (!tbody) return

    const cell = () => `<td><span class="skeleton skeleton-bar"></span></td>`

    tbody.innerHTML = Array.from({ length: rows })
        .map(() => `<tr class="skeleton-row">${Array.from({ length: columns }).map(cell).join('')}</tr>`)
        .join('')
}