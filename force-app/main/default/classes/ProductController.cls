public with sharing class ProductController {

    //get products method with search integration 
    @AuraEnabled(cacheable=true)
    public static List<PricebookEntry> findProduct(String searchKey, String searchModel, String searchBrand){

        String[] criteria = new List<String>();
        String whereClause = '';
        String key = searchKey;
        String key2 = searchKey;
        String keyModel = searchModel ;
        String keyBrand = searchBrand;
        
        if(!String.isEmpty(searchKey)){
            key = '%' + searchKey + '%';
            criteria.add('Color__c LIKE :key ');
        }

        if(!String.isEmpty(searchModel)){
            keyModel = '%' + searchModel + '%';
            criteria.add('Model__c LIKE :keyModel');
        }

        if(!String.isEmpty(searchBrand)){
            keyBrand = '%' + searchBrand + '%';
            criteria.add('Brand__c LIKE :keyBrand');
        }

        if(criteria.size()>0){
            whereClause = ' AND ' + String.join(criteria, ' AND ');
        }

        String query = 'SELECT Id, Name, IsActive, Brand__c, Model__c, Color__c, Photo__c, Price__c FROM Product2 WHERE IsActive = true AND Model__c != null ' + whereClause;
        
        return Database.query(query);
        
    }

    //create a new car 
    @AuraEnabled
    public static Product2 createCar(string carBrand, string carModel, string carImage, string carColor, integer carPrice){
        String carName = carBrand + ' ' + carModel;
        Product2 carObj = new Product2();
        carObj.Name = carName;
        carObj.Brand__c=carBrand;
        carObj.Model__c=carModel;
        carObj.Photo__c=carImage;
        carObj.Color__c=carColor;
        carObj.Price__c=carPrice;
        carObj.IsActive=true;
        insert carObj;

        Product2 product = [SELECT Id, Name FROM Product2 WHERE Name =:carName AND Brand__c =:carBrand AND Color__c =:carColor LIMIT 1];
        String productId = product.Id;

        PricebookEntry price = new PricebookEntry();
        price.Pricebook2Id = '01s5f000008Ju0jAAC';
        price.Product2Id = productId;
        price.UnitPrice = carPrice;
        price.IsActive = true;
        
        insert price;
        return carObj;

    }

    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductsListAdmin() {
        return [ SELECT Id, Name, 
                IsActive, Brand__c, Model__c, 
                Color__c, Photo__c, Price__c FROM Product2 WHERE Model__c != null];
    }

    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductsList() {
        return [ SELECT Id, Name, 
                IsActive, Brand__c, Model__c, 
                Color__c, Photo__c, Price__c FROM Product2 WHERE Model__c != null AND IsActive = true];
    }

    //updateProducts
    @AuraEnabled
    public static string updateProducts( Object data ) {
        
        List < Product2 > accsForUpdate = ( List < Product2 > ) JSON.deserialize(
            JSON.serialize( data ),
            List < Product2 >.class
        );
        try {
            update accsForUpdate;
            return 'Success: Product(s) updated successfully';
        }
        catch (Exception e) {
            return 'The following exception has occurred: ' + e.getMessage();
        }

    }



}