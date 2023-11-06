
const search = (items, names, periods, refDate) => {
    return items.filter(i =>
        (
            names.includes(i.name) 
            || names.includes("All"))
        && (
            (periods.includes("past") && getUseToDate(i) <= refDate)
            || (periods.includes("current") && getUseFromDate(i) <= refDate && getUseToDate(i) >= refDate) 
            || (periods.includes("future") && getUseFromDate(i) >= refDate)
            || (periods.includes("All"))
        )
    );
}

const getUseFromDate = (item) => {
    return new Date(item.useFrom ?? item.supportedFrom);
}

const getUseToDate = (item) => {
    return new Date(item.useTo ?? item.supportedToExtended ?? item.supportedTo ?? item.supportedFrom);
}

export {
    search
}