import { LightningElement } from "lwc";
import LightningDatatable from "lightning/datatable";
import imageTableControl from "./imageTableControl.html";

//class used to handle the visualization of images
export default class CodexDataTable extends LightningDatatable {
  static customTypes = {
    file: {
      template: imageTableControl,
    },
  };
}
