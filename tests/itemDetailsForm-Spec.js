import * as itemDetailsForm from '../src/web/components/itemDetailsForm.js';

describe("dataUpdate", function () {
    describe("validateItem", function () {

        let mockItemDetailsForm = null;

        beforeEach(function () {
            // Create a mock item details form element
            mockItemDetailsForm = document.createElement('item-details-form');
            mockItemDetailsForm.id = "item-details-form";
            mockItemDetailsForm.connectedCallback();
            document.body.appendChild(mockItemDetailsForm);
        });

        afterEach(function () {
            document.body.removeChild(mockItemDetailsForm);
        });

        
        it("should return true for a valid item", function () {
            const validItem = {
                name: "Valid Name",
                version: "1.0",
                type: "Type",
                supportedFrom: "2023-01-01",
                supportedTo: "2024-01-01",
                link: "",
                latestPatch: "",
                useFrom: "2023-01-01",
                useTo: "2024-01-01",
                notes: "",
            };

            const result = mockItemDetailsForm.validateItem(validItem);

            expect(result.isValid).toBe(true);
        });


        it("should return false and display an error for an empty name", function () {
            const invalidItem = {
                name: ""
            };

            const result = mockItemDetailsForm.validateItem(invalidItem);

            expect(result.isValid).toBe(false);
            expect(result.msg).toContain("Please enter a Name");
        });


        it("should return false and display an error for an empty version", function () {
            const invalidItem = {
                name: "Valid Name",
                version: ""
            };

            const result = mockItemDetailsForm.validateItem(invalidItem);

            expect(result.isValid).toBe(false);
            expect(result.msg).toContain("Please enter a Version");
        });


        it("should return false and display an error for an empty type", function () {
            const invalidItem = {
                name: "Valid Name",
                version: "1",
                type: ""
            };

            const result = mockItemDetailsForm.validateItem(invalidItem);

            expect(result.isValid).toBe(false);
            expect(result.msg).toContain("Please select a Type");
        });


        it("should return false and display an error for an empty supportedFrom", function () {
            const invalidItem = {
                name: "Valid Name",
                version: "1",
                type: "Type",
                supportedFrom: ""
            };

            const result = mockItemDetailsForm.validateItem(invalidItem);

            expect(result.isValid).toBe(false);
            expect(result.msg).toContain("Please enter a Supported From date");
        });


        it("should return false and display an error for an invalid supported date range", function () {
            const invalidItem = {
                name: "Valid Name",
                version: "1.0",
                type: "Type",
                supportedFrom: "2023-01-01",
                supportedTo: "2022-01-01", // Invalid date range
                link: "",
                latestPatch: "",
                useFrom: "2023-01-01",
                useTo: "2024-01-01",
                notes: "",
            };

            const result = mockItemDetailsForm.validateItem(invalidItem);

            expect(result.isValid).toBe(false);
            expect(result.msg).toContain(
                "The Supported To date must be greater than the Supported From date"
            );
        });


        it("should return false and display an error for an invalid use date range", function () {
            const invalidItem = {
                name: "Valid Name",
                version: "1.0",
                type: "Type",
                supportedFrom: "2023-01-01",
                supportedTo: "2024-01-01",
                link: "",
                latestPatch: "",
                useFrom: "2023-01-01",
                useTo: "2022-01-01", // Invalid date range
                notes: "",
            };

            const result = mockItemDetailsForm.validateItem(invalidItem);

            expect(result.isValid).toBe(false);
            expect(result.msg).toContain(
                "The Use To date must be greater than the Use From date"
            );
        });


        it("should return false and display an error for an useFrom is before supportedFrom", function () {
            const invalidItem = {
                name: "Valid Name",
                version: "1.0",
                type: "Type",
                supportedFrom: "2023-01-01",
                supportedTo: "2024-01-01",
                link: "",
                latestPatch: "",
                useFrom: "2022-01-01", // Invalid date
                useTo: "2024-01-01",
                notes: "",
            };

            const result = mockItemDetailsForm.validateItem(invalidItem);

            expect(result.isValid).toBe(false);
            expect(result.msg).toContain(
                "The Use From date must be greater than the Supported From date"
            );
        });


        it("should return true when there are no errors", function () {
            const itemWithNoErrors = {
                name: "Valid Name",
                version: "1.0",
                type: "Type",
                supportedFrom: "2023-01-01",
                supportedTo: "2024-01-01",
                link: "",
                latestPatch: "",
                useFrom: "2023-01-01",
                useTo: "2024-01-01",
                notes: "",
            };

            const result = mockItemDetailsForm.validateItem(itemWithNoErrors);

            expect(result.isValid).toBe(true);
        });
    });
});