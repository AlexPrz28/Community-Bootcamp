import { LightningElement, wire } from "lwc";
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import fetchProducts from "@salesforce/apex/ProductController.getProductsListAdmin";
import updateProducts from "@salesforce/apex/ProductController.updateProducts";

//columns const to use in the html table
const columns = [
  {
    label: "Model",
    fieldName: "Model__c",
    type: "text",
    editable: true,
  },
  {
    label: "Brand",
    fieldName: "Brand__c",
    type: "text",
    editable: true,
  },
  {
    label: "Image",
    fieldName: "Photo__c",
    type: "image",
  },
  {
    label: "Color",
    fieldName: "Color__c",
    type: "text",
    editable: true,
  },
  {
    label: "Price",
    fieldName: "Price__c",
    type: "text",
    editable: true,
  },
  {
    label: "Active",
    fieldName: "IsActive",
    type: "boolean",
    editable: true,
  },
];

export default class CarListAdmin extends LightningElement {
  records;
  // variable that track the provisioned value
  wiredRecords;
  error;
  columns = columns;
  // variable that stores the changed records
  draftValues = [];

  //method to get all the products
  @wire(fetchProducts)
  wiredAccount(value) {
    this.wiredRecords = value;
    const { data, error } = value;

    if (data) {
      this.records = data;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.records = undefined;
    }
  }

  //method to save the changes with the html button
  async handleSave(event) {
    const updatedFields = event.detail.draftValues;

    await updateProducts({ data: updatedFields })
      .then((result) => {
        console.log(JSON.stringify("Apex update result: " + result));
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Product(s) updated",
            variant: "success",
          })
        );

        refreshApex(this.wiredRecords).then(() => {
          this.draftValues = [];
        });
      })
      .catch((error) => {
        console.log("Error is " + JSON.stringify(error));
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error updating or refreshing records",
            message: error.body.message,
            variant: "error",
          })
        );
      });
  }
}
