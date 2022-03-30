import { LightningElement, track, api, wire } from "lwc";
import saveFile from "@salesforce/apex/UploadImageContoller.saveFile";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import PRODUCT_OBJECT from "@salesforce/schema/Product2";
import BRAND_FIELD from "@salesforce/schema/Product2.Brand__c";
import MODEL_FIELD from "@salesforce/schema/Product2.Model__c";

export default class CreateProduct extends LightningElement {
  @track data;
  @track fileName = "";
  @track UploadFile = "Create Product";
  @track showLoadingSpinner = false;
  @track isTrue = false;
  //variables used to save the data
  selectedRecords;
  filesUploaded = [];
  file;
  fileContents;
  fileReader;
  content;
  MAX_FILE_SIZE = 15000000000000;

  @track carImage;
  @track carColor;
  @track carPrice;
  @track valueBrand = "";
  @track valueModel = "";

  //get Product Object
  @wire(getObjectInfo, { objectApiName: PRODUCT_OBJECT })
  accountMetadata;
  // get the picklist values of Brand
  @wire(getPicklistValues, {
    recordTypeId: "$accountMetadata.data.defaultRecordTypeId",
    fieldApiName: BRAND_FIELD,
  })
  brandPicklist;
  // get the picklist values of Model
  @wire(getPicklistValues, {
    recordTypeId: "$accountMetadata.data.defaultRecordTypeId",
    fieldApiName: MODEL_FIELD,
  })
  modelPicklist;

  carHandleChange(event) {
    if (event.target.name == "carImage") {
      this.carImage = event.target.value;
    }
    if (event.target.name == "carColor") {
      this.carColor = event.target.value;
    }
    if (event.target.name == "carPrice") {
      this.carPrice = event.target.value;
    }
  }

  handleChangeModel(event) {
    this.valueModel = event.target.value;
  }

  handleChangeBrand(event) {
    this.valueBrand = event.target.value;
  }

  handleFilesChange(event) {
    if (event.target.files.length > 0) {
      this.filesUploaded = event.target.files;
      this.fileName = event.target.files[0].name;
    }
  }

  //button to upload the object
  handleSave() {
    console.log("handleSave button and method");
    if (this.filesUploaded.length > 0) {
      this.uploadHelper();
    } else {
      this.fileName = "Please select file to upload";
    }
  }

  uploadHelper() {
    console.log("uploadHelper method");
    this.file = this.filesUploaded[0];
    if (this.file.size > this.MAX_FILE_SIZE) {
      window.console.log("File Size is to long");
      return;
    }
    this.showLoadingSpinner = true;
    // create a FileReader object
    this.fileReader = new FileReader();
    // set onload function of FileReader object
    this.fileReader.onloadend = () => {
      this.fileContents = this.fileReader.result;
      let base64 = "base64,";
      this.content = this.fileContents.indexOf(base64) + base64.length;
      this.fileContents = this.fileContents.substring(this.content);

      this.saveToFile();
    };

    this.fileReader.readAsDataURL(this.file);
  }

  handleButton(event) {
    this.isTrue = false;
  }

  // Calling apex class to insert the file
  saveToFile() {
    console.log("saveToFile method");
    saveFile({
      strFileName: this.file.name,
      base64Data: encodeURIComponent(this.fileContents),
      carBrand: this.valueBrand,
      carModel: this.valueModel,
      carColor: this.carColor,
      carPrice: this.carPrice,
    })
      .then((result) => {
        window.console.log("result ====> " + result);
        // refreshing the datatable

        this.fileName = this.fileName + " - Uploaded Successfully";
        this.UploadFile = "File Uploaded Successfully";
        this.isTrue = true;
        this.showLoadingSpinner = false;

        // Showing Success message after file insert
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success!!",
            message: this.file.name + " - Uploaded Successfully!!!",
            variant: "success",
          })
        );
      })
      .catch((error) => {
        // Showing errors if any while inserting the files
        window.console.log(error);
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error while uploading File",
            message: error.message,
            variant: "error",
          })
        );
      });
  }

  // Getting selected rows to perform any action
  getSelectedRecords(event) {
    let conDocIds;
    const selectedRows = event.detail.selectedRows;
    conDocIds = new Set();
    // Display that fieldName of the selected rows
    for (let i = 0; i < selectedRows.length; i++) {
      conDocIds.add(selectedRows[i].ContentDocumentId);
    }

    this.selectedRecords = Array.from(conDocIds).join(",");

    window.console.log("selectedRecords =====> " + this.selectedRecords);
  }
}
