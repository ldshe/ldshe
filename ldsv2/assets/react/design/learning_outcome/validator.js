import validate from 'validate.js';

const constraints = {
    type: {
        presence: {
            message: '^Please enter the Type.',
        }
    },
    description: {
        presence: {
            message: '^Please enter the Description.',
        }
    },
};

export const validateForm = forms => {
    let fmErrs = forms.map(f => ({
        id: f,
        errs: validate($('#'+f).get(0), constraints),
    })).filter(f => f.errs);
    let hasErr = fmErrs.length > 0;
    let errors = {};
    fmErrs.forEach(e => errors[e.id] = e.errs);
    return {hasErr, errors};
}
