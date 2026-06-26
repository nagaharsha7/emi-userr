import { db, isFirebaseConfigured } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  orderBy
} from "firebase/firestore";

// Local storage mock helpers
const MOCK_LOANS_KEY = "paytrack_mock_loans";
const MOCK_PAYMENTS_KEY = "paytrack_mock_payments";
const MOCK_SEEDED_KEY = "paytrack_mock_seeded_v2";

const getMockLoans = () => JSON.parse(localStorage.getItem(MOCK_LOANS_KEY) || "[]");
const saveMockLoans = (loans) => localStorage.setItem(MOCK_LOANS_KEY, JSON.stringify(loans));
const getMockPayments = () => JSON.parse(localStorage.getItem(MOCK_PAYMENTS_KEY) || "[]");
const saveMockPayments = (payments) => localStorage.setItem(MOCK_PAYMENTS_KEY, JSON.stringify(payments));

const seedMockData = (userId) => {
  if (localStorage.getItem(MOCK_SEEDED_KEY)) return;

  const mockLoans = [
    {
      loanId: "mock_loan_car",
      userId,
      loanName: "HDFC Car Loan",
      lender: "HDFC Bank",
      loanAmount: 600000,
      emiAmount: 12000,
      interestRate: 8.5,
      duration: 60,
      remainingAmount: 564000, // 3 EMIs paid
      startDate: "2026-02-15",
      status: "active",
      notes: "Car registration: KA-03-MM-1234. EMI auto-debited on 15th.",
      createdAt: new Date().toISOString()
    }
  ];

  const mockPayments = [
    // Car loan payments (3 paid, 4th due June 15 is overdue!)
    {
      paymentId: "mock_pay_car_1",
      loanId: "mock_loan_car",
      userId,
      amount: 12000,
      date: "2026-03-15T10:30:00.000Z",
      method: "UPI"
    },
    {
      paymentId: "mock_pay_car_2",
      loanId: "mock_loan_car",
      userId,
      amount: 12000,
      date: "2026-04-15T09:15:00.000Z",
      method: "Net Banking"
    },
    {
      paymentId: "mock_pay_car_3",
      loanId: "mock_loan_car",
      userId,
      amount: 12000,
      date: "2026-05-15T18:45:00.000Z",
      method: "UPI"
    }
  ];

  localStorage.setItem(MOCK_LOANS_KEY, JSON.stringify(mockLoans));
  localStorage.setItem(MOCK_PAYMENTS_KEY, JSON.stringify(mockPayments));
  localStorage.setItem(MOCK_SEEDED_KEY, "true");
};

export const loanService = {
  // Add a new loan
  addLoan: async (userId, loanData) => {
    const formattedData = {
      userId,
      loanName: loanData.loanName,
      lender: loanData.lender,
      loanAmount: Number(loanData.loanAmount),
      emiAmount: Number(loanData.emiAmount),
      interestRate: Number(loanData.interestRate),
      duration: Number(loanData.duration),
      remainingAmount: Number(loanData.loanAmount), // starts as full loan amount
      startDate: loanData.startDate, // YYYY-MM-DD
      status: "pending",
      notes: loanData.notes || "",
      purchasedProduct: loanData.purchasedProduct || "",
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      const loansColl = collection(db, "loans");
      const newLoanRef = doc(loansColl);
      const loanId = newLoanRef.id;
      
      const finalDoc = { ...formattedData, loanId };
      await setDoc(newLoanRef, finalDoc);
      return finalDoc;
    } else {
      const loans = getMockLoans();
      const loanId = "mock_loan_" + Math.random().toString(36).substr(2, 9);
      const finalDoc = { ...formattedData, loanId };
      
      loans.push(finalDoc);
      saveMockLoans(loans);
      return finalDoc;
    }
  },

  // Get all loans for a user
  getLoans: async (userId) => {
    if (isFirebaseConfigured) {
      const loansColl = collection(db, "loans");
      const q = query(loansColl, where("userId", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } else {
      seedMockData(userId);
      const loans = getMockLoans();
      return loans.filter(l => l.userId === userId);
    }
  },

  // Get details for a single loan
  getLoanDetails: async (loanId) => {
    if (isFirebaseConfigured) {
      const docRef = doc(db, "loans", loanId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } else {
      const loans = getMockLoans();
      return loans.find(l => l.loanId === loanId) || null;
    }
  },

  // Pay EMI
  payEmi: async (loanId, userId, amount, method = "UPI") => {
    const paymentAmount = Number(amount);
    const dateStr = new Date().toISOString();

    if (isFirebaseConfigured) {
      const loanRef = doc(db, "loans", loanId);
      const loanSnap = await getDoc(loanRef);
      
      if (!loanSnap.exists()) {
        throw new Error("Loan not found");
      }
      
      const loanData = loanSnap.data();
      const newRemaining = Math.max(0, loanData.remainingAmount - paymentAmount);
      const newStatus = newRemaining <= 0 ? "completed" : "active";
      
      // Update loan remaining amount and status
      await updateDoc(loanRef, {
        remainingAmount: newRemaining,
        status: newStatus
      });
      
      // Create payment record
      const paymentsColl = collection(db, "payments");
      const newPaymentRef = doc(paymentsColl);
      const paymentId = newPaymentRef.id;
      
      const paymentRecord = {
        paymentId,
        loanId,
        userId,
        amount: paymentAmount,
        date: dateStr,
        method
      };
      
      await setDoc(newPaymentRef, paymentRecord);
      return { paymentRecord, newRemaining, newStatus };
    } else {
      const loans = getMockLoans();
      const loanIdx = loans.findIndex(l => l.loanId === loanId);
      
      if (loanIdx === -1) {
        throw new Error("Loan not found");
      }
      
      const loan = loans[loanIdx];
      const newRemaining = Math.max(0, loan.remainingAmount - paymentAmount);
      const newStatus = newRemaining <= 0 ? "completed" : "active";
      
      // Update mock loan
      loans[loanIdx] = {
        ...loan,
        remainingAmount: newRemaining,
        status: newStatus
      };
      saveMockLoans(loans);
      
      // Add payment
      const payments = getMockPayments();
      const paymentId = "mock_pay_" + Math.random().toString(36).substr(2, 9);
      const paymentRecord = {
        paymentId,
        loanId,
        userId,
        amount: paymentAmount,
        date: dateStr,
        method
      };
      
      payments.push(paymentRecord);
      saveMockPayments(payments);
      
      return { paymentRecord, newRemaining, newStatus };
    }
  },

  // Get payments (either all for user, or filtered by loanId)
  getPayments: async (userId, loanId = null) => {
    if (isFirebaseConfigured) {
      const paymentsColl = collection(db, "payments");
      let q;
      if (loanId) {
        q = query(paymentsColl, where("loanId", "==", loanId));
      } else {
        q = query(paymentsColl, where("userId", "==", userId));
      }
      const snapshot = await getDocs(q);
      // Sort payments client-side or Firestore-side (client-side is safer without indexing requirements)
      const data = snapshot.docs.map(doc => doc.data());
      return data.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      seedMockData(userId);
      const payments = getMockPayments();
      let userPayments = payments.filter(p => p.userId === userId);
      if (loanId) {
        userPayments = userPayments.filter(p => p.loanId === loanId);
      }
      return userPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  }
};
