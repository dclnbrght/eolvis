
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
    const supportedEndIsSet = item.supportedTo !== "";
    const supportedTo = supportedEndIsSet ? new Date(item.supportedTo) : new Date(item.supportedFrom);

    const supportExtendedEndIsSet = item.supportedToExtended !== "";
    const supportedToExtended = supportExtendedEndIsSet ? new Date(item.supportedToExtended) : supportedTo;
    
    const inUseEndIsSet = item.useTo !== "";
    const useTo = inUseEndIsSet ? new Date(item.useTo) : supportedTo;

    const dates = [supportedTo, supportedToExtended, useTo];    
    const sortedDates = dates.sort((a, b) => b - a);
    
    return sortedDates[0];
}

export {
    search
}