@isTest
public class ObjectViewerController_Test {
	@isTest
    public static void test_ListOfAllObjects() {
        ObjectViewerController.listOfAllObjects();
    }
    
    @isTest
    public static void test_listOfAllFields() {
        ObjectViewerController.listOfAllFields('Account');
    }
}
