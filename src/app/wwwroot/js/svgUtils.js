
const createSvgElement = (type) => {
    return document.createElementNS("http://www.w3.org/2000/svg", type);
};

const createSvgRect = (x, y, width, height, classNames = []) => {
    const rect = createSvgElement("rect");
    classNames.forEach(className => { if (className !== "") rect.classList.add(className); });
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", width);
    rect.setAttribute("height", height);
    return rect;
};

const createSvgText = (text, x, y, anchor = "middle", classNames = []) => {
    const textElement = createSvgElement("text");
    classNames.forEach(className => { if (className !== "") textElement.classList.add(className); });
    textElement.textContent = text;
    textElement.setAttribute("x", x);
    textElement.setAttribute("y", y);
    textElement.setAttribute("text-anchor", anchor);
    return textElement;
};

export {
    createSvgElement,
    createSvgRect,
    createSvgText
};