import validate from 'validate.js';

const titleConstraints = {
    title: {
        presence: {
            message: '^Please enter the Component Title.',
        },
        length: {
            maximum: 255,
            message: '^The Component Title you provided must be less than 255 characters.',
        },
    },
};

const approachConstraints = {
    approach: {
        presence: {
            message: '^Please enter the Pedagogical Strategy.',
        },
        length: {
            maximum: 255,
            message: '^The Pedagogical Strategy you provided must be less than 255 characters.',
        },
    },
};


const losConstraints = {
    'los[]': {
        presence: {
            message: '^Please pick one.',
        }
    },
};

export const validateForm = forms => {
    let fmErrs = forms.map(f => {
        let c;
        if(f.startsWith('ps-form-title-'))
            c = titleConstraints;
        else if(f.startsWith('ps-form-approach-'))
            c = approachConstraints;
        else if(f.startsWith('ps-form-los-'))
            c = losConstraints;
        else if(f.startsWith('ps-form-assessment-'))
            c = {};
        else if(f.startsWith('ps-form-group-assessment-'))
            c = {};
        else if(f.startsWith('ps-form-individual-assessment-'))
            c = {};
        else
            c = constraints;
        return {
            id: f,
            errs: validate($('#'+f).get(0), c),
        }
    }).filter(f => f.errs);
    let hasErr = fmErrs.length > 0;
    let errors = {};
    fmErrs.forEach(e => errors[e.id] = e.errs);
    return {hasErr, errors};
}
