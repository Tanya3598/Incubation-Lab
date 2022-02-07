import { LightningElement, wire, track } from 'lwc';
import listOfAllObjects from '@salesforce/apex/ObjectViewerController.listOfAllObjects';
import listOfAllFields from '@salesforce/apex/ObjectViewerController.listOfAllFields';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import download_Disabled from '@salesforce/label/c.Download_will_be_disabled';
import No_Data_Found from '@salesforce/label/c.No_Data_Found';

export default class ObjectViewer extends LightningElement {
    value = '';

    options;
    data;
    completeFieldsData;
    columns;
    showTable;
    objectName;
    searchDatatypeValue = '';
    searchNameValue = '';
    @track disableButton = false;


    @wire(listOfAllObjects)
    wiredData({ error, data }) {
        if (data) {
            const objectLabels = Object.keys(data);
            //sort data for better readability
            objectLabels.sort();

            //Objects map to options in combobox conversion
            const optionsList = objectLabels.map(objectLabel => {
                return {
                    label: objectLabel,
                    value: data[objectLabel]
                }
            })
            this.options = optionsList;
            this.error = null;
        } else if (error) {
            this.error = error;
            this.record = undefined;
        }
    }

    showError() {
        // show error message in case of no data
        const event = new ShowToastEvent({
            title: No_Data_Found,
            message: download_Disabled,
            variant: 'error'
        });
        this.dispatchEvent(event);
    }

    handleFieldNameSearch(event) {
        let value = event.detail.value;
        this.searchNameValue = value;
        //filter out data based on name field
        this.data = this.completeFieldsData.filter(fieldDetail => fieldDetail.FieldLabel.toLowerCase().indexOf(value) != -1 && fieldDetail.FieldType.toLowerCase().indexOf(this.searchDatatypeValue) != -1);
        if(this.data == null || this.data.length === 0) {
            this.disableButton = true;
            this.showError();
        } else {
            this.disableButton = false;
        }
    }

    handleDatatypeSearch(event) {
        let value = event.detail.value;
        this.searchDatatypeValue = value;
        //filter out data based on datatype field
        this.data = this.completeFieldsData.filter(fieldDetail => fieldDetail.FieldType.toLowerCase().indexOf(value) != -1 && fieldDetail.FieldLabel.toLowerCase().indexOf(this.searchNameValue) != -1);
        if(this.data == null || this.data.length === 0) {
            this.disableButton = true;
            this.showError();
        } else {
            this.disableButton = false;
        }
    }

    downloadCSVFile() {   
        let rowEnd = '\n';
        let csvString = '';
        // this set elminates the duplicates if have any duplicate keys
        let rowData = new Set();

        // getting keys from data
        this.data.forEach(function (record) {
            Object.keys(record).forEach(function (key) {
                rowData.add(key);
            });
        });

        // Array.from() method returns an Array object from any object with a length property or an iterable object.
        rowData = Array.from(rowData);
        
        // splitting using ','
        csvString += rowData.join(',');
        csvString += rowEnd;

        // main for loop to get the data based on key value
        for(let i=0; i < this.data.length; i++){
            let colValue = 0;

            // validating keys in data
            for(let key in rowData) {
                if(rowData.hasOwnProperty(key)) {
                    // Key value 
                    // Ex: Id, Name
                    let rowKey = rowData[key];
                    // add , after every value except the first.
                    if(colValue > 0){
                        csvString += ',';
                    }
                    // If the column is undefined, it as blank in the CSV file.
                    let value = this.data[i][rowKey] === undefined ? '' : this.data[i][rowKey];
                    csvString += '"'+ value +'"';
                    colValue++;
                }
            }
            csvString += rowEnd;
        }

        // Creating anchor element to download
        let downloadElement = document.createElement('a');

        // This  encodeURI encodes special characters, except: , / ? : @ & = + $ # (Use encodeURIComponent() to encode these characters).
        downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
        downloadElement.target = '_self';
        // CSV File Name
        downloadElement.download = this.objectName + ' Data.csv';
        // below statement is required if you are using firefox browser
        document.body.appendChild(downloadElement);
        // click() Javascript function to download CSV file
        downloadElement.click(); 
    }

    //change object handler
    handleChange(event) {
        //turn off table display
        this.showTable = false;
        this.value = event.detail.value;
        this.objectName = this.value;

        //empty fields value for new objects
        this.searchDatatypeValue = '';
        this.searchNameValue = '';

        //apex method call imperative
        listOfAllFields({objectAPIName: this.value})
        .then(result => {

            //columns defining for tables
            this.columns = [{label: 'Field Name', fieldName: 'FieldLabel' }, {label: 'Field API Name', fieldName: 'FieldAPIName'}, 
                            {label: 'DataType', fieldName: 'FieldType'}, {label: 'Required', fieldName: 'isRequired'}];
            const fieldInformations = [];

            //turn boolean true/false to Yes/No
            for(let field of result) {
                const fieldInformation = {...field, isRequired: (field.isRequired == true ? 'No': 'Yes')};
                fieldInformations.push(fieldInformation);
            }
            this.data = fieldInformations;
            //turn on table display
            this.showTable = true;
            this.completeFieldsData = this.data;
        })
        .catch(error => {
            console.log(error);
        })
    }
}