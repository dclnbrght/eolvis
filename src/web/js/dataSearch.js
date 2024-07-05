
const search = (items, minDate, maxDate, names, periods, filterByInUse, refDate) => {
    return items.filter(i =>
        (
            names.includes(i.name) 
            || names.includes("All")
        ) 
        && 
        (
            (periods.includes("past") && getMaxToDate(i, filterByInUse) <= refDate)
            || (periods.includes("current") && getMinFromDate(i) <= refDate && getMaxToDate(i, filterByInUse) >= refDate) 
            || (periods.includes("future") && getMinFromDate(i) >= refDate)
            || (periods.includes("All"))
        ) 
        && 
        (
            (getMaxToDate(i, filterByInUse) >= minDate && getMinFromDate(i) <= maxDate)
        ) 
    );
}

const isEmpty = (value) => {
    return (value == null || (typeof value === "string" && value.trim().length === 0)) ? null : value;
}

const getMinFromDate = (item) => {
    return new Date(item.supportedFrom);
}

const getMaxToDate = (item, filterByInUse) => {
    let toDates = [item.supportedFrom, item.supportedTo, item.supportedToExtended];
    if (filterByInUse)
        toDates.push(item.useTo);

    const filteredDates = toDates
        .filter(date => date !== null)
        .map(date => new Date(date));

    if (filteredDates.length === 0) return null;

    const maxDate = new Date(Math.max(...filteredDates));

    return maxDate;
}

export {
    search
}