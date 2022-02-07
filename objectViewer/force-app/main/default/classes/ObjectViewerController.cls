public class ObjectViewerController {
    @AuraEnabled(cacheable=true)
    public static Map<String, String> listOfAllObjects() {
        Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe(); 
        Map<String, String> objectsMap = new Map<String, String>();
        List<EntityDefinition> definitions = [SELECT Label, QualifiedApiName FROM EntityDefinition WHERE IsCustomizable = true order by Label];
        
        for(EntityDefinition definition: definitions) {
            objectsMap.put(definition.Label, definition.QualifiedApiName);
        }
        
		return objectsMap; 
    }
    
    @AuraEnabled(cacheable=true)
    public static List<FieldDataWrapper> listOfAllFields(String objectAPIName) {
        Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe(); 
        Schema.SObjectType type = gd.get(objectAPIName.toLowerCase());
        Schema.DescribeSObjectResult ds = type.getDescribe();
        Map<String, Schema.SObjectField> mapOfFields = ds.fields.getMap();
        List<FieldDataWrapper> fieldsData = new List<FieldDataWrapper>();
        
        for(Schema.SObjectField field: mapOfFields.values()) {
            FieldDataWrapper wrap = new FieldDataWrapper();
            wrap.FieldLabel = field.getDescribe().getLabel();
            wrap.FieldType = String.valueOf(field.getDescribe().getType());
            wrap.FieldAPIName = field.getDescribe().getName();
            wrap.isRequired = field.getDescribe().isNillable();
            fieldsData.add(wrap);
        }
        
        return fieldsData;
    }
    
    class FieldDataWrapper {
    	@AuraEnabled public String FieldLabel;
    	@AuraEnabled public String FieldType;
        @AuraEnabled public String FieldAPIName;
        @AuraEnabled public Boolean isRequired;
	}
}