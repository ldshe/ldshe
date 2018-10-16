import validate from 'validate.js';

export const constraints = {
    title: {
        presence: {
            message: '^Please enter the Course Title.',
        },
        length: {
            maximum: 255,
            message: '^The Course Title you provided must be less than 255 characters.',
        },
    },
    subject: {
        presence: {
            message: '^Please enter the Subject.',
        },
        length: {
            maximum: 255,
            message: '^The Subject you provided must be less than 255 characters.',
        },
    },
    teacher: {
        presence: {
            message: '^Please enter the Teacher / Instructor.',
        },
        length: {
            maximum: 255,
            message: '^The Teacher / Instructor you provided must be less than 255 characters.',
        },
    },
    classSize: {
        presence: {
            message: '^Please enter the Class Size.',
        },
      numericality: {
          greaterThanOrEqualTo: 1,
          lessThanOrEqualTo: 9999999,
          message: '^The Class Size you provided must be between 1 and 9999999.',
      }
    },
    purpose: {
        presence: {
            message: '^Please enter the Purpose.',
        },
    },
    semester: {
        presence: {
            message: '^Please enter the Semester.',
        },
        length: {
            maximum: 255,
            message: '^The Semester you provided must be less than 255 characters.',
        },
    },
    sessInDuration: {
        presence: {
            message: '^Please enter the Session Duration.',
        },
      numericality: {
          greaterThanOrEqualTo: 1,
          lessThanOrEqualTo: 9999,
          message: '^The Session Duration you provided must be between 1 and 9999.',
      }
    },
    sessPpDuration: {
        presence: {
            message: '^Please enter the Pre+Post Session Duration.',
        },
      numericality: {
          greaterThanOrEqualTo: 1,
          lessThanOrEqualTo: 9999,
          message: '^The Pre+Post Session Duration you provided must be between 1 and 9999.',
      }
    },
};

export const validateForm = form => {
    return validate(form, constraints);
}
