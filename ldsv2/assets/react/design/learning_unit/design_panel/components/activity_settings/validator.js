import validate from 'validate.js';

export const constraints = {
    groupSize: {
        presence: {
            message: '^Please enter the Group Size.',
        },
        numericality: {
            greaterThanOrEqualTo: 1,
            lessThanOrEqualTo: 9999,
            message: '^The Group Size you provided must be between 1 and 9999.',
        }
    },

    groupSizeMax: {
        presence: {
            message: '^Please enter the Maximum Group Size.',
        },
        numericality: {
            greaterThanOrEqualTo: 1,
            lessThanOrEqualTo: 9999,
            message: '^The Maximum Group Size you provided must be between 1 and 9999.',
        }
    },

    duration: {
        presence: {
            message: '^Please enter the Duration.',
        },
        numericality: {
            greaterThanOrEqualTo: 1,
            lessThanOrEqualTo: 9999,
            message: '^The Duration you provided must be between 1 and 9999.',
        }
    },
};

export const validateForm = form => {
    return validate(form, constraints);
}

const urlConstraints = {
    title: {
        presence: {
            message: '^Please enter the Title.',
        },
    },

    url: {
        presence: {
            message: '^Please enter the URL.',
        },
        url: {
            message: '^Please enter a valid URL.',
        },
    },
};

export const validateUrlForm = forms => {
    let fmErrs = forms
        .map(f => ({
            id: f,
            errs: validate($(`#ud-as-url-form-${f}`).get(0), urlConstraints),
        }))
        .filter(f => f.errs);
    let hasErr = fmErrs.length > 0;
    let errors = {};
    fmErrs.forEach(e => errors[e.id] = e.errs);
    return {hasErr, errors};
}

const fileConstraints = {
    file: {
        presence: {
            message: '^Please upload a file.',
        },
    },
};

export const validateFileForm = forms => {
    let fmErrs = forms
        .map(f => ({
            id: f,
            errs: validate($(`#ud-as-file-form-${f}`).get(0), fileConstraints),
        }))
        .filter(f => f.errs);
    let hasErr = fmErrs.length > 0;
    let errors = {};
    fmErrs.forEach(e => errors[e.id] = e.errs);
    return {hasErr, errors};
}
