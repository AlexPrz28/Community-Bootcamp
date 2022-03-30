declare module "@salesforce/apex/ProductController.findProduct" {
  export default function findProduct(param: {searchKey: any, searchModel: any, searchBrand: any}): Promise<any>;
}
declare module "@salesforce/apex/ProductController.createCar" {
  export default function createCar(param: {carBrand: any, carModel: any, carImage: any, carColor: any, carPrice: any}): Promise<any>;
}
declare module "@salesforce/apex/ProductController.getProductsListAdmin" {
  export default function getProductsListAdmin(): Promise<any>;
}
declare module "@salesforce/apex/ProductController.getProductsList" {
  export default function getProductsList(): Promise<any>;
}
declare module "@salesforce/apex/ProductController.updateProducts" {
  export default function updateProducts(param: {data: any}): Promise<any>;
}
