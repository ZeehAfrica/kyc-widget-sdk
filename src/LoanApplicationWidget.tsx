/**
 * Placeholder for the loan originator multi-step flow from `zeeh-kyc-widget`.
 * The full loan application UI is not bundled in this SDK release; use the
 * hosted `/l/:uniqueUsername` experience or copy the loan module from the widget repo.
 */
export function LoanApplicationWidget() {
  return (
    <div
      role="note"
      className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground"
    >
      Loan originator widget is not included in <code>@zeehdev/zeeh-kyc-react-sdk</code>{" "}
      v0.1. See the package README for integration options.
    </div>
  );
}
