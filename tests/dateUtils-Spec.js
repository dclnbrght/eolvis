import { numberOfMonths, addMonths } from '../src/app/wwwroot/js/dateUtils.js';

describe("dateUtils", function () {

    describe("numberOfMonths", function () {
        it("should calculate the number of months (rounded up) between two dates correctly", function () {
            const date1 = new Date("2023-01-01");
            const date2 = new Date("2024-01-01");

            const months = numberOfMonths(date1, date2);

            expect(months).toBe(13); // Expecting 12 months (rounded up) between the dates
        });

        it("should return 0 when one or both dates are invalid", function () {
            const date1 = new Date("2023-01-01");
            const invalidDate = new Date("invalid-date");

            const months1 = numberOfMonths(date1, invalidDate);
            const months2 = numberOfMonths(invalidDate, date1);
            const months3 = numberOfMonths(invalidDate, invalidDate);

            expect(months1).toBe(0);
            expect(months2).toBe(0);
            expect(months3).toBe(0);
        });

        it("should handle dates with different years", function () {
            const date1 = new Date("2023-01-01");
            const date2 = new Date("2024-03-01");

            const months = numberOfMonths(date1, date2);

            expect(months).toBe(15); // Expecting 15 months (rounded up) between the dates
        });
    });

    describe("addMonths", function () {
        it("should add the specified number of months to a date", function () {
            const date = new Date("2023-01-01");

            const newDate = addMonths(date, 6);

            expect(newDate.getFullYear()).toBe(2023);
            expect(newDate.getMonth()).toBe(6); // 0-based index, so 6 corresponds to July
        });

        it("should handle negative months to subtract months from a date", function () {
            const date = new Date("2023-01-01");

            const newDate = addMonths(date, -3);

            expect(newDate.getFullYear()).toBe(2022);
            expect(newDate.getMonth()).toBe(9); // 0-based index, so 9 corresponds to October
        });

        it("should not modify the original date object", function () {
            const date = new Date("2023-01-01");
            const originalYear = date.getFullYear();
            const originalMonth = date.getMonth();

            const newDate = addMonths(date, 6);

            expect(date.getFullYear()).toBe(originalYear);
            expect(date.getMonth()).toBe(originalMonth);
        });
    });
});
