import validate from 'validate.js';

export const constraints = {
    topic: {
        presence: {
            message: '^Please enter the Topic.',
        },
        length: {
            maximum: 255,
            message: '^The Topic you provided must be less than 255 characters.',
        },
    },
    objective: {
        presence: {
            message: '^Please enter the Objective.',
        },
    },
    utcDate: {
        presence: {
            message: '^Please enter the Date.',
        },
    },
};

export const validateForm = form => {
    return validate(form, constraints);
}
