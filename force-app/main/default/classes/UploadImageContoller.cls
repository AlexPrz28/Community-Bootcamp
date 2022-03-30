public inherited sharing class UploadImageContoller {
    @AuraEnabled
    public static String saveFile(String strFileName, String base64Data, string carBrand, string carModel, string carColor, integer carPrice) {

        // Decoding base64Data
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');

        //create Product2 Object
        String carName = carBrand + ' ' + carModel;
        Product2 carObj = new Product2();
        carObj.Name = carName;
        carObj.Brand__c=carBrand;
        carObj.Model__c=carModel;
        carObj.Color__c=carColor;
        carObj.Price__c=carPrice;
        carObj.IsActive=true;

        insert carObj;
        
        Product2 product = [SELECT Id, Name FROM Product2 WHERE Name =:carName AND Brand__c =:carBrand AND Color__c =:carColor LIMIT 1];
        String productId = product.Id;

        //Create PricebookEntry Product
        PricebookEntry price = new PricebookEntry();
        price.Pricebook2Id = '01s5f000008Ju0jAAC';
        price.Product2Id = productId;
        price.UnitPrice = carPrice;
        price.IsActive = true;
        
        insert price;

        //Create ContentVersion Object to upload file
        ContentVersion cv = new ContentVersion();
        cv.Title = strFileName;
        cv.PathOnClient = '/' + strFileName;
        cv.FirstPublishLocationId = productId;
        cv.VersionData = EncodingUtil.base64Decode(base64Data);
        cv.IsMajorVersion = true;
        Insert cv;

        //get the file
        list<id> lstConDocs = new list<id>();
        for(ContentDocumentLink cntLink : [Select Id, ContentDocumentId From ContentDocumentLink Where LinkedEntityId =:productId]) {
            lstConDocs.add(cntLink.ContentDocumentId);
        }

        //Create ContentDistribution Object to insert Image to Product2 Object
        ContentDistribution cdl = new ContentDistribution();
        cdl.ContentVersionId = [SELECT Id, Title, ContentDocumentId FROM ContentVersion WHERE ContentDocumentId IN :lstConDocs LIMIT 1].Id;
        cdl.Name = 'PublicShare';
        insert cdl;
        Product2 p = new Product2();
        p.id = productId;
        system.debug(productId);
        p.Photo__c = [SELECT DistributionPublicUrl, ContentDownloadUrl FROM ContentDistribution WHERE Id = :cdl.Id LIMIT 1].ContentDownloadUrl;
        update p;
        return [SELECT DistributionPublicUrl, ContentDownloadUrl FROM ContentDistribution WHERE Id = :cdl.Id LIMIT 1].ContentDownloadUrl;

    }

}