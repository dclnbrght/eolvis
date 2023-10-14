
const search = (items, names, periods, refDate) => {
    return items.filter(i =>
        (
            names.includes(i.name) 
            || names.includes("All"))
        && (
            (periods.includes("past") && new Date(getLatestTo(i)) <= refDate)
            || (periods.includes("current") && new Date(i.supportedFrom) <= refDate && new Date(getLatestTo(i)) >= refDate) 
            || (periods.includes("future") && new Date(i.supportedFrom) >= refDate)
            || (periods.includes("All"))
        )
    );
}

const getLatestTo = (item) => {
    const supportedTo = new Date(item.supportedTo);
    const supportedToExtended = new Date(item.supportedToExtended);
    const useTo = new Date(item.useTo);

    const dates = [supportedTo, supportedToExtended, useTo];
    const sortedDates = dates.sort((a, b) => a - b);
    return sortedDates[2];
}

export {
    search
}