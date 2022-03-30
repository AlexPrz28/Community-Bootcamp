declare module "@salesforce/apex/VehicleController.getVehicleList" {
  export default function getVehicleList(): Promise<any>;
}
declare module "@salesforce/apex/VehicleController.findVehicleByModel" {
  export default function findVehicleByModel(param: {searchKey: any}): Promise<any>;
}
declare module "@salesforce/apex/VehicleController.findVehicleByBrand" {
  export default function findVehicleByBrand(param: {searchKey: any}): Promise<any>;
}
