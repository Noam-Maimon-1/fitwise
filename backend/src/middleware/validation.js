const validateId = (id) => {
    return Number.isInteger(Number(id)) && Number(id) > 0;
};

const getMissingFields = (body, requiredFields) => {
    return requiredFields.filter(field =>
        body[field] === undefined || body[field] === ""
    );
};

const validateNumericFields = (body, numericFields) => {
    return numericFields.filter(field =>
        typeof body[field] !== "number" || body[field] < 0
    );
};

const validatePositiveNumericFields = (body, numericFields) => {
    return numericFields.filter(field =>
        typeof body[field] !== "number" || body[field] <= 0
    );
};

module.exports = {
    validateId,
    getMissingFields,
    validateNumericFields,
    validatePositiveNumericFields
};