
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

const isEmpty = (value) => {
    return (value == null || (typeof value === "string" && value.trim().length === 0)) ? null : value;
}

const getUseFromDate = (item) => {
    return new Date(isEmpty(item.useFrom) ?? item.supportedFrom);
}

const getUseToDate = (item) => {
    return new Date(isEmpty(item.useTo) ?? isEmpty(item.supportedToExtended) ?? isEmpty(item.supportedTo) ?? item.supportedFrom);
}

export {
    search
}