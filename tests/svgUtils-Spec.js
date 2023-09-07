import { createSvgElement, createSvgRect, createSvgText } from '../src/web/components/svgUtils.js';

describe("svgUtils", function () {

    describe("createSvgElement", function () {
        it("should create an SVG element with the specified type", function () {
            const svgElement = createSvgElement("rect");

            expect(svgElement).toBeDefined();
            expect(svgElement.nodeName).toBe("rect");
        });
    });

    describe("createSvgRect", function () {
        it("should create an SVG rectangle with the specified attributes and classes", function () {
            const x = 10;
            const y = 20;
            const width = 30;
            const height = 40;
            const classNames = ["class1", "class2"];

            const rect = createSvgRect(x, y, width, height, classNames);

            expect(rect).toBeDefined();
            expect(rect.nodeName).toBe("rect");
            expect(rect.getAttribute("x")).toBe(x.toString());
            expect(rect.getAttribute("y")).toBe(y.toString());
            expect(rect.getAttribute("width")).toBe(width.toString());
            expect(rect.getAttribute("height")).toBe(height.toString());
            expect(rect.classList.contains("class1")).toBe(true);
            expect(rect.classList.contains("class2")).toBe(true);
        });

        it("should create an SVG rectangle without classes if classNames array is empty", function () {
            const x = 10;
            const y = 20;
            const width = 30;
            const height = 40;
            const classNames = [];

            const rect = createSvgRect(x, y, width, height, classNames);

            expect(rect).toBeDefined();
            expect(rect.nodeName).toBe("rect");
            expect(rect.getAttribute("x")).toBe(x.toString());
            expect(rect.getAttribute("y")).toBe(y.toString());
            expect(rect.getAttribute("width")).toBe(width.toString());
            expect(rect.getAttribute("height")).toBe(height.toString());
            expect(rect.classList.length).toBe(0);
        });
    });

    describe("createSvgText", function () {
        it("should create an SVG text element with the specified text, attributes, and classes", function () {
            const text = "Sample Text";
            const x = 50;
            const y = 60;
            const anchor = "middle";
            const classNames = ["class1", "class2"];

            const textElement = createSvgText(text, x, y, anchor, classNames);

            expect(textElement).toBeDefined();
            expect(textElement.nodeName).toBe("text");
            expect(textElement.textContent).toBe(text);
            expect(textElement.getAttribute("x")).toBe(x.toString());
            expect(textElement.getAttribute("y")).toBe(y.toString());
            expect(textElement.getAttribute("text-anchor")).toBe(anchor);
            expect(textElement.classList.contains("class1")).toBe(true);
            expect(textElement.classList.contains("class2")).toBe(true);
        });

        it("should create an SVG text element without classes if classNames array is empty", function () {
            const text = "Sample Text";
            const x = 50;
            const y = 60;
            const anchor = "middle";
            const classNames = [];

            const textElement = createSvgText(text, x, y, anchor, classNames);

            expect(textElement).toBeDefined();
            expect(textElement.nodeName).toBe("text");
            expect(textElement.textContent).toBe(text);
            expect(textElement.getAttribute("x")).toBe(x.toString());
            expect(textElement.getAttribute("y")).toBe(y.toString());
            expect(textElement.getAttribute("text-anchor")).toBe(anchor);
            expect(textElement.classList.length).toBe(0);
        });
    });
});