import { LightningElement, track, wire } from "lwc";
import getPicklistList from "@salesforce/apex/ProductController.getProductsList";
import getProductList from "@salesforce/apex/ProductController.findProduct";

//columns used to generated the html table
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
  },
  {
    label: "Image",
    fieldName: "Photo__c",
    type: "file",
  },
  {
    label: "Color",
    fieldName: "Color__c",
    type: "text",
  },
  {
    label: "Price",
    fieldName: "Price__c",
    type: "text",
  },
  {
    label: "Active",
    fieldName: "IsActive",
    type: "boolean",
  },
];

export default class CarList extends LightningElement {
  //variables used to handle the search bars
  modelName = "";
  modelValue = "";
  brandValue = "";

  records;
  wiredRecords;
  error;
  columns = columns;
  draftValues = [];

  //get the products list
  @wire(getProductList, {
    searchKey: "$modelName",
    searchModel: "$modelValue",
    searchBrand: "$brandValue",
  })
  wiredAccount(value) {
    this.wiredRecords = value; // track the provisioned value
    const { data, error } = value;

    if (data) {
      this.records = data;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.records = undefined;
    }
  }

  @track l_All_Types;
  @track ModelOptions;
  @track BrandOptions;

  //get the picklist values for the search bar
  @wire(getPicklistList, {})
  WiredObjects_Type({ error, data }) {
    if (data) {
      try {
        this.l_All_Types = data;
        let options = [];
        let options2 = [];
        for (var key in data) {
          options.push({
            label: data[key].Model__c,
            value: data[key].Model__c,
          });
          options2.push({
            label: data[key].Brand__c,
            value: data[key].Brand__c,
          });
        }
        options.push({
          label: " ",
          value: "",
        });
        options2.push({
          label: " ",
          value: "",
        });
        this.ModelOptions = options;
        this.BrandOptions = options2;
      } catch (error) {
        console.error("check error here", error);
      }
    } else if (error) {
      console.error("check error here", error);
    }
  }

  handleKeyChange(event) {
    this.modelName = event.target.value;
  }

  handleModelChange(event) {
    this.modelValue = event.target.value;
  }

  handleBrandChange(event) {
    this.brandValue = event.target.value;
  }
}
