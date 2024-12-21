
const numberOfMonths = (date1, date2) => {
    if (isNaN(date1) || isNaN(date2)) {
        return 0;
    }

    const monthDiff = date2.getMonth() - date1.getMonth() + 1;
    const yearDiff = date2.getYear() - date1.getYear();

    return monthDiff + yearDiff * 12;
}

const addMonths = (date, months) => {
    const dateCopy = new Date(date);

    dateCopy.setMonth(dateCopy.getMonth() + months);

    return dateCopy;
}

export {
    numberOfMonths,
    addMonths
};