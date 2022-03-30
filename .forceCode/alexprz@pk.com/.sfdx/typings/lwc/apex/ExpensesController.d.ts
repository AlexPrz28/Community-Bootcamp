declare module "@salesforce/apex/ExpensesController.getExpenses" {
  export default function getExpenses(): Promise<any>;
}
declare module "@salesforce/apex/ExpensesController.saveExpense" {
  export default function saveExpense(param: {expense: any}): Promise<any>;
}
