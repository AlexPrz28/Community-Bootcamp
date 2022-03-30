import { LightningElement, wire, track } from "lwc";
import getProductList from "@salesforce/apex/ProductController.getProductsList";
import { exportCSVFile } from "c/utils";
import JSPDF from "@salesforce/resourceUrl/jspdf";
import JSPDF_AUTO_TABLE from "@salesforce/resourceUrl/jspdfautotable";
import { loadScript } from "lightning/platformResourceLoader";

export default class PaymentCalculator extends LightningElement {
  //Method to load the js libraries to generate pdf tables
  renderedCallback() {
    Promise.all([loadScript(this, JSPDF), loadScript(this, JSPDF_AUTO_TABLE)])
      .then(() => {
        console.log("loaded");
        this.jsPDFLoaded = true;
      })
      .catch(() => {
        console.log("not loaded");
      });
  }

  records = [];
  amount = 100000;
  down = 10000;

  //headers to use for the csv file
  tableHeaders = {
    Pay: "Pay",
    UnpaidAutoBalance: "Unpaid Auto Balance",
    MonthlyAutoCapitalPayment: "Monthly Auto Capital Payment",
    MonthlyPaymentOfAutoInterest: "Monthly Payment Of Auto Interest",
    TotalPaymentWithVAT: "Total Payment With VAT",
  };

  //columns to use in the table
  @track columns = [
    { label: "Pay", fieldName: "Pay", type: "number" },
    {
      label: "Unpaid Auto Balance",
      fieldName: "UnpaidAutoBalance",
      type: "currency",
    },
    {
      label: "Monthly Auto Capital Payment",
      fieldName: "MonthlyAutoCapitalPayment",
      type: "currency",
    },
    {
      label: "Monthly Payment Of AutoInterest",
      fieldName: "MonthlyPaymentOfAutoInterest",
      type: "currency",
    },
    {
      label: "Total Payment With VAT",
      fieldName: "TotalPaymentWithVAT",
      type: "currency",
    },
  ];

  //variables to generate the model picklist
  modelValue = "Model";
  @track l_All_Types;
  @track ModelOptions;

  //Method to get the models from Product Object
  @wire(getProductList, {})
  WiredObjects_Type({ error, data }) {
    if (data) {
      try {
        this.l_All_Types = data;
        let options = [];
        for (var key in data) {
          options.push({
            label: data[key].Model__c,
            value: data[key].Model__c,
          });
        }
        options.push({
          label: " ",
          value: "",
        });

        this.ModelOptions = options;
      } catch (error) {
        console.error("check error here", error);
      }
    } else if (error) {
      console.error("check error here", error);
    }
  }

  handleModelChange(event) {
    this.modelValue = event.target.value;
  }

  //COMBOBOX TERMS
  term = 0;
  calculated = false;
  get termOptions() {
    return [
      { label: "12", value: "12" },
      { label: "24", value: "24" },
      { label: "36", value: "36" },
      { label: "48", value: "48" },
    ];
  }

  handleTermChange(event) {
    this.term = event.detail.value;
  }

  handleAmountChange(event) {
    this.amount = event.detail.value;
  }

  handleDownChange(event) {
    this.down = event.detail.value;
  }

  handleClickPayment(event) {
    this.calculatePayments();
    this.calculated = true;
  }

  handleClickReset(event) {
    this.records = [];
    this.calculated = false;
  }

  //html handler button to generate the payment records
  calculatePayments() {
    var initialAmount = this.amount;
    var downC = this.down;
    var termC = parseInt(this.term);
    var balance = 0;
    var rate = 1.03;
    var tax = 1.08;
    var payment = 0;
    var paymentWithRate = 0;
    var ratePayment = 0;
    var capitalPayment = 0;
    var totalPayment = 0;
    this.records = [];

    if (initialAmount > 0 && downC > 0 && termC != null) {
      initialAmount = initialAmount - downC;
      payment = initialAmount / termC;
      balance = initialAmount;

      for (var i = 0; i < termC; i++) {
        paymentWithRate = payment * rate;
        ratePayment = paymentWithRate / 100;
        capitalPayment = paymentWithRate - ratePayment;
        totalPayment = paymentWithRate * tax;
        balance = balance - capitalPayment;

        var temp = {
          Pay: "" + (i + 1),
          UnpaidAutoBalance: "" + balance,
          MonthlyAutoCapitalPayment: "" + capitalPayment,
          MonthlyPaymentOfAutoInterest: "" + ratePayment,
          TotalPaymentWithVAT: "" + totalPayment,
        };
        this.records.push(temp);
      }
    }
  }

  //html handler button to generate csv
  csvGenerator() {
    var date = this.gerateDate();
    var docName = "Payment " + date;
    exportCSVFile(this.tableHeaders, this.records, docName);
    console.log("CSV GENERATED");
  }

  generatePdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    if (this.records != null) {
      var rows = [];
      var filteredRecords = this.records.map(function (el) {
        var temp = [
          el.Pay,
          el.UnpaidAutoBalance,
          el.MonthlyAutoCapitalPayment,
          el.MonthlyPaymentOfAutoInterest,
          el.TotalPaymentWithVAT,
        ];
        rows.push(temp);
      });
      //Generate the table with rows and headers
      doc.autoTable({
        head: [
          [
            "Pay",
            "Unpaid Auto Balance",
            "Monthly Auto Capital Payment",
            "Monthly Payment Of Auto Interest",
            "Total Payment With VAT",
          ],
        ],
        body: rows,
      });
      //save dpf file with date in the name
      var date = this.gerateDate();
      var docName = "Payment " + date + ".pdf";
      doc.save(docName);
    }
  }

  //method to get current date and time
  gerateDate() {
    var today = new Date();
    var date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + " " + time;

    return dateTime;
  }
  //html handler button to generate pdf
  pdfGenerator() {
    this.generatePdf();
    console.log("PDF GENERATED");
    window.location.replace(
      "https://cardealership-developer-edition.na163.force.com/user/s/simulator"
    );
  }
}
