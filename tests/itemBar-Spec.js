import { ItemBar } from '../src/web/components/itemBar.js';

describe("itemBar", function () {

    let itemBar = null;
    
    beforeEach(function () {
        itemBar = new ItemBar();
    });

    describe('getClassNamesForItemInUse', () => {

        it('should return the correct class names for an item in use', () => {

            const refDate = new Date('2023-08-01');
            const inUseStart = new Date('2023-01-01');
            const inUseEndIsSet = true;
            const inUseEnd = new Date('2023-12-31');
            const supportedEnd = new Date('2024-06-01');
            const settings = {
                warnNearEolDays: 90
            };

            const classNames = itemBar.getClassNamesForItemInUse(
                refDate,
                inUseStart,
                inUseEndIsSet,
                inUseEnd,
                supportedEnd,
                settings
            );

            expect(classNames).toContain("item");
            expect(classNames).toContain("item-inuse");
            expect(classNames).not.toContain("item-inuse-eol");
        });
        
        it('should return the correct class names for an item in use NEAR the supportedEnd date', () => {

            const refDate = new Date('2023-12-01');
            const inUseStart = new Date('2023-01-01');
            const inUseEndIsSet = true;
            const inUseEnd = new Date('2023-12-31');
            const supportedEnd = new Date('2024-01-31');
            const settings = {
                warnNearEolDays: 90
            };

            const classNames = itemBar.getClassNamesForItemInUse(
                refDate,
                inUseStart,
                inUseEndIsSet,
                inUseEnd,
                supportedEnd,
                settings
            );

            expect(classNames).toContain("item");
            expect(classNames).toContain("item-inuse");
            expect(classNames).toContain("item-inuse-near-eol");
        });

        it('should return the correct class names for an item in use PAST the supportedEnd date', () => {

            const refDate = new Date('2023-08-01');
            const inUseStart = new Date('2023-01-01');
            const inUseEndIsSet = true;
            const inUseEnd = new Date('2023-12-31');
            const supportedEnd = new Date('2023-11-01');
            const settings = {
                warnNearEolDays: 90
            };

            const classNames = itemBar.getClassNamesForItemInUse(
                refDate,
                inUseStart,
                inUseEndIsSet,
                inUseEnd,
                supportedEnd,
                settings
            );

            expect(classNames).toContain("item");
            expect(classNames).toContain("item-inuse");
            expect(classNames).toContain("item-inuse-eol");
        });

        it('should return the correct class names for an item in future use with no end date', () => {

            const refDate = new Date('2023-01-01');
            const inUseStart = new Date('2023-03-01');
            const inUseEndIsSet = false;
            const inUseEndCalc = new Date('2023-12-31');
            const supportedEndCalc = new Date('2024-01-01');
            const settings = {
                warnNearEolDays: 90
            };

            const classNames = itemBar.getClassNamesForItemInUse(
                refDate,
                inUseStart,
                inUseEndIsSet,
                inUseEndCalc,
                supportedEndCalc,
                settings
            );

            // Assertions
            expect(classNames).toContain("item");
            expect(classNames).toContain("item-inuse-future-noEnd");
        });

    });

    describe("render", function () {
        let container;

        beforeEach(function () {
            // Create a container element and add it to the document body
            container = document.createElement("div");
            document.body.appendChild(container);
        });

        afterEach(function () {
            // Remove the container element after each test
            document.body.removeChild(container);
        });

        it("should render item bars with correct attributes", function () {
            const item = {
                "id": "a00feab3-6c0f-4bc3-a14d-53e7afaf2161",
                "name": "Test OS",
                "version": "1",
                "supportedFrom": "2022-01-01",
                "supportedTo": "2023-04-30",
                "supportedToExtended": "",
                "latestPatch": "",
                "latestPatchReleased": "",
                "useFrom": "2022-02-01",
                "useTo": "2023-06-30",
                "link": "",
                "notes": "test near EOL",
                "lts": false,
                "type": "operating-system",
                "updated": "2023-06-23"
            };

            const y = 0;
            const today = new Date("2023-01-01");
            const minDate = new Date("2020-01-01");
            const maxDate = new Date("2024-12-31");
            const displayInUseBar = true;

            const renderedItem = itemBar.render(item, y, today, minDate, maxDate, displayInUseBar);

            // Append the renderedItem to the container
            container.appendChild(renderedItem);

            // Query for elements and attributes using querySelector
            const itemSupported = renderedItem.querySelector(".item-supported");
            const itemUse = renderedItem.querySelector(".item");
            const itemSupportedBorder = renderedItem.querySelector(".item-supported-border");
            const itemLabel = renderedItem.querySelector(".item-label");

            // Perform assertions on element presence and attributes
            expect(itemSupported).toBeDefined(); // Check that element is defined
            expect(itemUse).toBeDefined();
            expect(itemSupportedBorder).toBeDefined();
            expect(itemLabel).toBeDefined();

            // Check CSS classes
            expect(itemSupported.classList.contains("item-supported")).toBe(true);
            expect(itemUse.classList.contains("item")).toBe(true);
            expect(itemSupportedBorder.classList.contains("item-supported-border")).toBe(true);
            expect(itemLabel.classList.contains("item-label")).toBe(true);
        });

    });
});