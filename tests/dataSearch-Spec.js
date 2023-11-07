import { search } from '../src/web/js/dataSearch.js';

describe("dataSearch", function () {
    describe("search", function () {
        const today = new Date("2023-06-01");
        const items = [
            {
                name: "Item 1",
                supportedFrom: "2020-01-01",
                supportedTo: "2021-01-01",
                supportedToExtended: "2021-01-01",
                useFrom: "2020-01-01",
                useTo: "2021-01-01",
            },
            {
                name: "Item 2",
                supportedFrom: "2023-01-01",
                supportedTo: "2023-12-01",
                supportedToExtended: "2023-12-01",
                useFrom: "2023-03-01",
                useTo: "2023-09-01",
            },
            {
                name: "Item 3",
                supportedFrom: "2024-01-01",
                supportedTo: "2024-12-01",
                supportedToExtended: "2024-12-01",
                useFrom: "2024-03-01",
                useTo: "2024-09-01",
            },
            {
                name: "Item 4",
                supportedFrom: "2022-06-01",
                supportedTo: "2022-10-01",
                supportedToExtended: "",
                useFrom: "",
                useTo: "",
            },
            {
                name: "Item 5",
                supportedFrom: "2024-06-01",
                supportedTo: "2024-10-01",
                supportedToExtended: "",
                useFrom: "",
                useTo: "",
            },
        ];

        it("should return all items when no filters are selected", function () {
            const names = ["All"];
            const periods = ["All"];

            const result = search(items, names, periods, today);

            expect(result.length).toBe(5);
        });

        it("should return only items matching the selected names", function () {
            const names = ["Item 1"];
            const periods = ["past", "current", "future"];

            const result = search(items, names, periods, today);

            expect(result.length).toBe(1);
            expect(result[0].name).toBe("Item 1");
        });

        it("should return no items when name does not exist", function () {
            const names = ["Item X"];
            const periods = ["past", "current", "future"];

            const result = search(items, names, periods, today);

            expect(result.length).toBe(0);
        });

        it("should return only items matching the selected periods - past", function () {
            const names = ["All"];
            const periods = ["past"];
            
            const result = search(items, names, periods, today);

            expect(result.length).toBe(2);
        });

        it("should return only items matching the selected periods - past, current", function () {
            const names = ["All"];
            const periods = ["past","current"];

            const result = search(items, names, periods, today);

            expect(result.length).toBe(3);
        });

        it("should return only items matching the selected periods - future", function () {
            const names = ["All"];
            const periods = ["future"];

            const result = search(items, names, periods, today);

            expect(result.length).toBe(2);
        });

        it("should return only items matching the selected names and periods", function () {
            const names = ["Item 2"];
            const periods = ["current"];

            const result = search(items, names, periods, today);

            expect(result.length).toBe(1);
            expect(result[0].name).toBe("Item 2");
        });
    });
});

