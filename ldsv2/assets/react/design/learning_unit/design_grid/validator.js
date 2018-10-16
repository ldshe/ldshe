import validate from 'validate.js';

const constraints = {
    title: {
        presence: {
            message: '^Please enter the Component Title.',
        },
        length: {
            maximum: 255,
            message: '^The Component Title you provided must be less than 255 characters.',
        },
    },
    approach: {
        presence: {
            message: '^Please enter the Pedagogical Strategy.',
        },
        length: {
            maximum: 255,
            message: '^The Pedagogical Strategy you provided must be less than 255 characters.',
        },
    },
    description: {
        presence: {
            message: '^Please enter the Description.',
        },
    },
}

export const validateForm = forms => {
    let fmErrs = forms.map(f => {
        return {
            id: f,
            errs: validate($('#'+f).get(0), constraints),
        }
    }).filter(f => f.errs);
    let hasErr = fmErrs.length > 0;
    let errors = {};
    fmErrs.forEach(e => errors[e.id] = e.errs);
    return {hasErr, errors};
}
