import { db } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  writeBatch 
} from "firebase/firestore";
import { DailyLog, CustomExpense, SalaryRecord } from "./types";

/**
 * Pushes a single log to Firestore
 */
export async function saveLogToFirestore(log: DailyLog): Promise<void> {
  try {
    const docRef = doc(db, "logs", log.id);
    await setDoc(docRef, log, { merge: true });
  } catch (error) {
    console.error("Error saving log to Firestore:", error);
  }
}

/**
 * Deletes a single log from Firestore
 */
export async function deleteLogFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, "logs", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting log from Firestore:", error);
  }
}

/**
 * Pushes a single custom expense to Firestore
 */
export async function saveExpenseToFirestore(expense: CustomExpense): Promise<void> {
  try {
    const docRef = doc(db, "expenses", expense.id);
    await setDoc(docRef, expense, { merge: true });
  } catch (error) {
    console.error("Error saving expense to Firestore:", error);
  }
}

/**
 * Deletes a single expense from Firestore
 */
export async function deleteExpenseFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, "expenses", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting expense from Firestore:", error);
  }
}

/**
 * Pushes a single salary record to Firestore
 */
export async function saveSalaryToFirestore(salary: SalaryRecord): Promise<void> {
  try {
    const docRef = doc(db, "salaries", salary.id);
    await setDoc(docRef, salary, { merge: true });
  } catch (error) {
    console.error("Error saving salary to Firestore:", error);
  }
}

/**
 * Deletes a single salary record from Firestore
 */
export async function deleteSalaryFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, "salaries", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting salary from Firestore:", error);
  }
}

/**
 * Bulk upload of all local records to Firestore (Manual Backup / Sync push)
 */
export async function backupAllToFirestore(
  logs: DailyLog[], 
  expenses: CustomExpense[], 
  salaries: SalaryRecord[]
): Promise<void> {
  const batch = writeBatch(db);
  
  // Add logs to batch (Firestore batch limit is 500)
  for (const log of logs.slice(0, 150)) {
    const docRef = doc(db, "logs", log.id);
    batch.set(docRef, log, { merge: true });
  }
  
  // Add expenses to batch
  for (const exp of expenses.slice(0, 150)) {
    const docRef = doc(db, "expenses", exp.id);
    batch.set(docRef, exp, { merge: true });
  }
  
  // Add salaries to batch
  for (const sal of salaries.slice(0, 100)) {
    const docRef = doc(db, "salaries", sal.id);
    batch.set(docRef, sal, { merge: true });
  }
  
  await batch.commit();
}

/**
 * Pulls all records from Firestore and merges them with local records.
 * Returns the merged sets of logs, expenses, and salaries.
 */
export async function mergeAndFetchFromFirestore(
  localLogs: DailyLog[],
  localExpenses: CustomExpense[],
  localSalaries: SalaryRecord[]
): Promise<{
  mergedLogs: DailyLog[];
  mergedExpenses: CustomExpense[];
  mergedSalaries: SalaryRecord[];
}> {
  try {
    // 1. Fetch from Firestore
    const logsSnapshot = await getDocs(collection(db, "logs"));
    const expensesSnapshot = await getDocs(collection(db, "expenses"));
    const salariesSnapshot = await getDocs(collection(db, "salaries"));

    const firestoreLogs: DailyLog[] = [];
    logsSnapshot.forEach((doc) => {
      firestoreLogs.push(doc.data() as DailyLog);
    });

    const firestoreExpenses: CustomExpense[] = [];
    expensesSnapshot.forEach((doc) => {
      firestoreExpenses.push(doc.data() as CustomExpense);
    });

    const firestoreSalaries: SalaryRecord[] = [];
    salariesSnapshot.forEach((doc) => {
      firestoreSalaries.push(doc.data() as SalaryRecord);
    });

    // 2. Perform merging based on unique ID
    const mergedLogsMap = new Map<string, DailyLog>();
    localLogs.forEach(l => mergedLogsMap.set(l.id, l));
    firestoreLogs.forEach(l => mergedLogsMap.set(l.id, l));
    const mergedLogs = Array.from(mergedLogsMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const mergedExpensesMap = new Map<string, CustomExpense>();
    localExpenses.forEach(e => mergedExpensesMap.set(e.id, e));
    firestoreExpenses.forEach(e => mergedExpensesMap.set(e.id, e));
    const mergedExpenses = Array.from(mergedExpensesMap.values());

    const mergedSalariesMap = new Map<string, SalaryRecord>();
    localSalaries.forEach(s => mergedSalariesMap.set(s.id, s));
    firestoreSalaries.forEach(s => mergedSalariesMap.set(s.id, s));
    const mergedSalaries = Array.from(mergedSalariesMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Write back new items to Firestore if they only existed locally
    await backupAllToFirestore(mergedLogs, mergedExpenses, mergedSalaries);

    return {
      mergedLogs,
      mergedExpenses,
      mergedSalaries
    };
  } catch (error) {
    console.error("Error during Firestore fetch and merge:", error);
    return {
      mergedLogs: localLogs,
      mergedExpenses: localExpenses,
      mergedSalaries: localSalaries
    };
  }
}
