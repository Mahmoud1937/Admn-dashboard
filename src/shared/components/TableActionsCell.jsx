export default function TableActionsCell({
  as: Cell = "td",
  column = "actions",
  backgroundColor,
  hoverColor,
  className = "",
  side = "right",
  style,
  ...props
}) {
  return (
    <Cell
      scope={Cell === "th" ? "col" : undefined}
      {...props}
      data-table-action={column}
      className={`table-actions-cell ${className}`}
      style={{
        [side]: `var(--table-action-${column}-offset, 0px)`,
        "--table-action-background": backgroundColor,
        "--table-action-hover": hoverColor,
        ...style,
      }}
    />
  );
}
