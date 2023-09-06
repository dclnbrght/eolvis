import { exportForTesting } from '../src/web/components/dataUpdate.js';

const { validateItem, displayError } = exportForTesting;

describe("dataUpdate", function () {
    describe("validateItem", function () {
        let errorBox;

        beforeEach(function () {
            // Create a mock error box element and add it to the document body
            errorBox = document.createElement("div");
            errorBox.id = "dialog-form-error";
            document.body.appendChild(errorBox);
        });

        afterEach(function () {
            // Remove the mock error box element after each test
            document.body.removeChild(errorBox);
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

            const result = validateItem(validItem);

            expect(result).toBe(true);
            expect(errorBox.classList.contains("hidden")).toBe(true);
        });


        it("should return false and display an error for an empty name", function () {
            const invalidItem = {
                name: ""
            };

            const result = validateItem(invalidItem);

            expect(result).toBe(false);
            expect(errorBox.classList.contains("hidden")).toBe(false);
            expect(errorBox.innerHTML).toContain("Please enter a Name");
        });


        it("should return false and display an error for an empty version", function () {
            const invalidItem = {
                name: "Valid Name",
                version: ""
            };

            const result = validateItem(invalidItem);

            expect(result).toBe(false);
            expect(errorBox.classList.contains("hidden")).toBe(false);
            expect(errorBox.innerHTML).toContain("Please enter a Version");
        });


        it("should return false and display an error for an empty type", function () {
            const invalidItem = {
                name: "Valid Name",
                version: "1",
                type: ""
            };

            const result = validateItem(invalidItem);

            expect(result).toBe(false);
            expect(errorBox.classList.contains("hidden")).toBe(false);
            expect(errorBox.innerHTML).toContain("Please select a Type");
        });

        it("should return false and display an error for an empty supportedFrom", function () {
            const invalidItem = {
                name: "Valid Name",
                version: "1",
                type: "Type",
                supportedFrom: ""
            };

            const result = validateItem(invalidItem);

            expect(result).toBe(false);
            expect(errorBox.classList.contains("hidden")).toBe(false);
            expect(errorBox.innerHTML).toContain("Please enter a Supported From date");
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

            const result = validateItem(invalidItem);

            expect(result).toBe(false);
            expect(errorBox.classList.contains("hidden")).toBe(false);
            expect(errorBox.innerHTML).toContain(
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

            const result = validateItem(invalidItem);

            expect(result).toBe(false);
            expect(errorBox.classList.contains("hidden")).toBe(false);
            expect(errorBox.innerHTML).toContain(
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

            const result = validateItem(invalidItem);

            expect(result).toBe(false);
            expect(errorBox.classList.contains("hidden")).toBe(false);
            expect(errorBox.innerHTML).toContain(
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

            const result = validateItem(itemWithNoErrors);

            expect(result).toBe(true);
            expect(errorBox.classList.contains("hidden")).toBe(true);
        });
    });
});